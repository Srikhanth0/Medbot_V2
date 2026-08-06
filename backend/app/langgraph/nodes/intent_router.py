"""
Intent Router & Query Rewriter Node (Prompt 1 & Prompt 2).

Determines whether RAG vector retrieval is required for a message.
If use_rag is False (casual greetings, conversation memory requests, exercise demos, general math/code reasoning),
it skips document retrieval completely, drastically lowering latency.
If use_rag is True, it rewrites the query into a clean, standalone, expanded search query.
"""

from __future__ import annotations

import json
import logging
import re
import time
from typing import Any

import asyncio
import httpx
from app.llm.factory import get_llm_provider

from app.config import get_settings
from app.langgraph.state import GraphState, IntentCategory
from app.routers.exercises import match_best_exercise

logger = logging.getLogger(__name__)

# Heuristic patterns for ultra-fast classification
CASUAL_PATTERNS = re.compile(
    r"^(hi|hello|hey|good morning|good afternoon|good evening|thanks|thank you|how are you|tell me a joke|bye|goodbye)[\!\.\?]*$",
    re.IGNORECASE,
)

MEMORY_PATTERNS = re.compile(
    r"\b(what did i ask|our previous chat|summarize this chat|what were we talking about|repeat that|continue our discussion)\b",
    re.IGNORECASE,
)

EXERCISE_PATTERNS = re.compile(
    r"\b(exercise|exercises|workout|workouts|stretch|stretches|jumping jacks|kettlebell|situp|situps|sit ups|pike walk|pistol squat|warm up|cool down|fitness|mobility|physio|physical therapy)\b",
    re.IGNORECASE,
)

INTENT_ROUTER_SYSTEM_PROMPT = """You are the Intent Router and Query Optimizer for a Medical RAG Assistant.

Your responsibility:
1. Decide whether the user's message requires retrieval from the medical knowledge base/uploaded reports.
2. Rewrite the user's query into a clean, standalone search query if RAG is required.

Return ONLY a valid JSON object:
{
  "intent": "casual_chat" | "memory_chat" | "reasoning" | "document_lookup" | "exercise" | "ambiguous",
  "use_rag": true | false,
  "confidence": 0.95,
  "reason": "Brief explanation",
  "rewritten_query": "Standalone optimized search query"
}

Classification Rules:
1. "casual_chat" -> Greetings, thanks, jokes, polite chitchat (hi, hello, how are you). -> use_rag = false
2. "memory_chat" -> References past conversation turns (what did I ask before?, summarize chat). -> use_rag = false
3. "reasoning" -> General logic, code, math (explain recursion, write python script). -> use_rag = false
4. "exercise" -> Requests for exercise recommendations, workout demos, 3D exercises, stretches, warm-ups, fitness guidance. -> use_rag = false
5. "document_lookup" -> Requires medical knowledge, report lookup, lab ranges, symptoms, drug guidelines, PDF analysis. -> use_rag = true
6. "ambiguous" -> Uncertain queries or follow-up questions about health. Default to use_rag = true.

Query Rewriting Rules:
- Preserve original medical intent.
- Resolve pronouns (e.g. "What is its dosage?" -> "What is the dosage of Metformin?").
- Expand medical abbreviations (e.g. "CKD" -> "Chronic Kidney Disease").
- Remove conversational filler ("Can you tell me...", "Please find out...").
- Keep medical terminology intact.

Do NOT answer the user's question. Return valid JSON only."""


async def intent_router_node(state: GraphState) -> GraphState:
    """
    LangGraph node: Intent Router & Query Rewriter.
    """
    start = time.time()
    query = state.query.strip()

    if not query:
        state.intent = IntentCategory.CASUAL_CHAT
        state.use_rag = False
        state.rewritten_query = query
        state.timing["intent_router"] = time.time() - start
        return state

    # 1. Fast heuristic bypass for simple greetings
    if CASUAL_PATTERNS.match(query):
        state.intent = IntentCategory.CASUAL_CHAT
        state.use_rag = False
        state.rewritten_query = query
        state.intent_confidence = 1.0
        state.intent_reason = "Matched casual greeting pattern"
        logger.info("Intent Router: classified as casual_chat (bypassing RAG retrieval)")
        state.timing["intent_router"] = time.time() - start
        return state

    if MEMORY_PATTERNS.search(query):
        state.intent = IntentCategory.MEMORY_CHAT
        state.use_rag = False
        state.rewritten_query = query
        state.intent_confidence = 0.95
        state.intent_reason = "Matched conversation memory pattern"
        logger.info("Intent Router: classified as memory_chat (bypassing RAG retrieval)")
        state.timing["intent_router"] = time.time() - start
        return state

    # Fast heuristic bypass for exercise queries
    if EXERCISE_PATTERNS.search(query):
        exercise_data = match_best_exercise(query)
        if exercise_data:
            state.intent = IntentCategory.EXERCISE
            state.use_rag = False
            state.rewritten_query = query
            state.intent_confidence = 0.98
            state.intent_reason = f"Matched exercise pattern: {exercise_data['title']}"
            state.recommended_exercise = exercise_data
            logger.info("Intent Router: classified as exercise (%s)", exercise_data["title"])
            state.timing["intent_router"] = time.time() - start
            return state

    # 2. LLM-based Intent Router & Query Rewriter using LLM Provider
    try:
        provider = get_llm_provider()

        history_context = ""
        if state.conversation_history:
            recent_msgs = state.conversation_history[-4:]
            history_context = "\nRecent Conversation Turns:\n" + "\n".join(
                f"{m.get('role')}: {m.get('content')}" for m in recent_msgs
            )

        messages = [
            {"role": "system", "content": INTENT_ROUTER_SYSTEM_PROMPT},
            {
                "role": "user",
                "content": f"{history_context}\n\nCurrent User Query: \"{query}\"",
            },
        ]

        content = await asyncio.wait_for(
            provider.generate(messages, temperature=0.1),
            timeout=10.0
        )

        # Extract JSON block
        json_match = re.search(r"\{.*\}", content, re.DOTALL)
        if json_match:
            data = json.loads(json_match.group(0))
            intent_str = data.get("intent", "document_lookup").lower()
            use_rag = bool(data.get("use_rag", True))
            rewritten = data.get("rewritten_query", query).strip() or query

            state.intent = IntentCategory(intent_str) if intent_str in IntentCategory.__members__.values() else IntentCategory.DOCUMENT_LOOKUP
            
            if state.intent == IntentCategory.EXERCISE:
                use_rag = False
                state.recommended_exercise = match_best_exercise(query)

            state.use_rag = use_rag
            state.rewritten_query = rewritten
            state.intent_confidence = float(data.get("confidence", 0.9))
            state.intent_reason = str(data.get("reason", ""))

            logger.info(
                "Intent Router: classified as intent=%s, use_rag=%s, rewritten_query='%s'",
                state.intent.value,
                state.use_rag,
                state.rewritten_query,
            )
            state.timing["intent_router"] = time.time() - start
            return state

    except Exception as e:
        logger.warning("Intent Router LLM call failed: %s. Defaulting to use_rag=True", e)

    # Fallback default: document_lookup with original query
    state.intent = IntentCategory.DOCUMENT_LOOKUP
    state.use_rag = True
    state.rewritten_query = query
    state.timing["intent_router"] = time.time() - start
    return state
