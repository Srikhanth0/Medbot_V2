"""
Messages Router — Post messages and stream SSE AI responses via LangGraph.
"""

from __future__ import annotations

import json
import logging
from typing import AsyncGenerator

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sse_starlette.sse import EventSourceResponse

from app.db.queries import insert_message
from app.dependencies import get_current_user, get_db_pool
from app.langgraph.graph import build_medbot_graph
from app.langgraph.nodes.generation import generate_stream_response
from app.langgraph.state import GraphState, SafetyClassification
from app.memory.conversation import load_conversation_memory
from app.models.schemas import MessageCreate

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/conversations", tags=["Messages"])


@router.post("/{conversation_id}/messages")
async def send_message_stream(
    conversation_id: str,
    payload: MessageCreate,
    user_id: str = Depends(get_current_user),
    pool=Depends(get_db_pool),
):
    """
    Send a user message to a conversation.
    Executes LangGraph RAG & safety pipeline, then streams SSE tokens.
    """
    if not payload.content or not payload.content.strip():
        raise HTTPException(status_code=400, detail="Message content cannot be empty")

    logger.info("📩  [INCOMING USER MESSAGE] Conversation: %s | Query: %r", conversation_id[:8], payload.content)

    # 1. Save User Message to Database
    await insert_message(
        pool=pool,
        conversation_id=conversation_id,
        role="user",
        content=payload.content,
    )

    # 2. Load Memory History
    history, summary = await load_conversation_memory(pool, conversation_id)

    # 3. Initialize LangGraph State
    initial_state = GraphState(
        query=payload.content,
        user_id=user_id,
        conversation_id=conversation_id,
        conversation_history=history,
        rolling_summary=summary,
    )

    # 4. Build LangGraph workflow
    app_graph = build_medbot_graph(pool=pool)

    async def event_generator() -> AsyncGenerator[str, None]:
        try:
            # 1. Run graph up to getting assembled_prompt
            final_state = None
            async for event in app_graph.astream(initial_state):
                for node_name, state_update in event.items():
                    final_state = state_update
                if "prompt_constructor" in event:
                    break
                if "safety_gate" in event:
                    s_cls = event["safety_gate"].get("safety_classification") if isinstance(event["safety_gate"], dict) else getattr(event["safety_gate"], "safety_classification", None)
                    if s_cls and s_cls != SafetyClassification.NORMAL:
                        break

            if final_state is None:
                final_state = initial_state

            def get_field(obj, field, default=None):
                return obj.get(field, default) if isinstance(obj, dict) else getattr(obj, field, default)

            # Check if safety gate triggered emergency/reframe
            if get_field(final_state, "safety_classification") != SafetyClassification.NORMAL:
                resp_text = get_field(final_state, "final_response", "")
                s_event = get_field(final_state, "safety_event")
                yield f"data: {json.dumps({'event': 'token', 'data': resp_text})}\n\n"
                yield f"data: {json.dumps({'event': 'done', 'citations': [], 'safety_event': s_event, 'confidence': 'high'})}\n\n"
                
                # Save Assistant Response
                await insert_message(
                    pool=pool,
                    conversation_id=conversation_id,
                    role="assistant",
                    content=resp_text,
                    safety_event=s_event,
                    confidence="high",
                    user_id=user_id,
                )
                return

            # Check if LLM generation produced an error
            if get_field(final_state, "error"):
                error_msg = "I'm sorry, the AI service is temporarily unavailable. Please try again in a moment."
                logger.warning("Pipeline error before streaming: %s", get_field(final_state, "error"))
                yield f"data: {json.dumps({'event': 'token', 'data': error_msg})}\n\n"
                yield f"data: {json.dumps({'event': 'error', 'detail': 'Service temporarily unavailable'})}\n\n"
                await insert_message(
                    pool=pool,
                    conversation_id=conversation_id,
                    role="assistant",
                    content=error_msg,
                    confidence="low",
                    user_id=user_id,
                )
                return

            # Stream tokens
            prompt_msgs = get_field(final_state, "assembled_prompt", [])
            accumulated_text = ""

            if prompt_msgs:
                async for token in generate_stream_response(prompt_msgs):
                    accumulated_text += token
                    yield f"data: {json.dumps({'event': 'token', 'data': token})}\n\n"

            # Run post_check_node on the accumulated text
            from app.langgraph.nodes.post_check import post_check_node
            
            if isinstance(final_state, dict):
                # Filter dictionary keys to only those in GraphState fields
                from dataclasses import fields
                valid_keys = {f.name for f in fields(GraphState)}
                filtered_state = {k: v for k, v in final_state.items() if k in valid_keys}
                check_state = GraphState(**filtered_state)
            else:
                check_state = final_state
                
            check_state.generated_response = accumulated_text
            check_state = post_check_node(check_state)

            final_text = check_state.final_response
            
            # Stream disclaimer if appended
            if len(final_text) > len(accumulated_text):
                disclaimer_suffix = final_text[len(accumulated_text):]
                yield f"data: {json.dumps({'event': 'token', 'data': disclaimer_suffix})}\n\n"

            # Serialize citations
            citations = [c.__dict__ if hasattr(c, '__dict__') else dict(c) for c in check_state.citations]
            conf = check_state.confidence.value if hasattr(check_state.confidence, "value") else check_state.confidence

            # Save complete assistant response
            await insert_message(
                pool=pool,
                conversation_id=conversation_id,
                role="assistant",
                content=final_text,
                citations=json.dumps(citations),
                confidence=conf,
                user_id=user_id,
            )

            logger.info(
                "✅  [STREAM COMPLETE 200 OK] Conversation: %s | Length: %d chars | Citations: %d | Confidence: %s",
                conversation_id[:8],
                len(final_text),
                len(citations),
                conf
            )

            rec_ex = get_field(check_state, "recommended_exercise") or get_field(final_state, "recommended_exercise")

            yield f"data: {json.dumps({'event': 'done', 'citations': citations, 'confidence': conf, 'recommended_exercise': rec_ex})}\n\n"

        except Exception as e:
            logger.exception("SSE stream error: %s", e)
            error_msg = "I'm sorry, something went wrong. Please try again."
            yield f"data: {json.dumps({'event': 'token', 'data': error_msg})}\n\n"
            yield f"data: {json.dumps({'event': 'error', 'detail': str(e)[:200]})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
