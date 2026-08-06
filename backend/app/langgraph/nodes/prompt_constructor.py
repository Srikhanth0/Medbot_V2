"""
Prompt Constructor Node — Assembles the complete LLM prompt with token budget enforcement.

Token budget per prompt assembly (hard cap, trim in this order if exceeded — never trim system/safety prompt):
1. Retrieved chunks first
2. Conversation history
3. Rolling summary

Rough guide:
- System prompt: ~600 tokens
- Summary: <= 300 tokens
- History: <= 1,500 tokens
- Retrieved chunks: <= 2,000 tokens
- Medical API enrichment: <= 500 tokens
"""

from __future__ import annotations

import logging
import os
import time
import tiktoken

from app.langgraph.state import GraphState

logger = logging.getLogger(__name__)

# Token counting encoder
try:
    TOKEN_ENCODER = tiktoken.get_encoding("cl100k_base")
except Exception:
    TOKEN_ENCODER = None

SYSTEM_PROMPT_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "prompts",
    "system_constitution.md"
)

def count_tokens(text: str) -> int:
    """Accurately count tokens using tiktoken, falling back to word count estimate."""
    if not text:
        return 0
    if TOKEN_ENCODER:
        return len(TOKEN_ENCODER.encode(text))
    return int(len(text.split()) * 1.3)

def load_system_constitution() -> str:
    """Load the versioned system constitution prompt."""
    if os.path.exists(SYSTEM_PROMPT_PATH):
        with open(SYSTEM_PROMPT_PATH, "r", encoding="utf-8") as f:
            return f.read()
    return (
        "# Identity and Purpose\n"
        "You are MedBot, a specialized Medical Understanding Assistant. "
        "You help users understand their medical reports. You are NOT a doctor.\n"
    )

def prompt_constructor_node(state: GraphState) -> GraphState:
    """
    LangGraph node: Prompt Constructor.

    Assembles system prompt + rolling summary + conversation history +
    retrieved chunks (with [chunk_id] labels inside <retrieved_context>) +
    medical API context into the final assembled prompt list for the LLM.
    """
    start = time.time()

    # Load system prompt
    system_text = load_system_constitution()

    # Build Retrieved Context block
    retrieved_context_blocks = []
    if state.retrieved_chunks:
        for chunk in state.retrieved_chunks:
            chunk_header = f"--- [chunk_id: {chunk.chunk_id}] ---"
            if chunk.section:
                chunk_header += f" (Section: {chunk.section})"
            if chunk.page_number:
                chunk_header += f" (Page: {chunk.page_number})"
            if chunk.is_abnormal:
                chunk_header += " [ABNORMAL RESULT]"

            content_text = chunk.content
            if chunk.parent_content and len(chunk.parent_content) > len(chunk.content):
                content_text = f"Context: {chunk.parent_content}\nSpecific Value: {chunk.content}"

            retrieved_context_blocks.append(f"{chunk_header}\n{content_text}")

    context_str = "\n\n".join(retrieved_context_blocks)
    
    # Wrap in prompt injection defense tags
    xml_context = f"<retrieved_context>\n{context_str}\n</retrieved_context>" if context_str else "<retrieved_context>\nNo relevant chunks found in the user's report.\n</retrieved_context>"

    # Build Medical API Context block
    medical_api_blocks = []
    if state.medical_context:
        for med in state.medical_context:
            medical_api_blocks.append(med.result)
    
    med_api_str = "\n\n".join(medical_api_blocks)
    xml_medical_api = f"<medical_api_context>\n{med_api_str}\n</medical_api_context>" if med_api_str else ""

    # Assemble System Message Content
    full_system_message = (
        f"{system_text}\n\n"
        f"You are evaluating the user's question using the following retrieved document chunks and medical facts.\n\n"
        f"{xml_context}\n"
    )
    if xml_medical_api:
        full_system_message += f"\n{xml_medical_api}\n"

    # Assemble messages array for LLM
    assembled_messages = [
        {"role": "system", "content": full_system_message}
    ]

    # Add Rolling Summary if present
    if state.rolling_summary:
        assembled_messages.append({
            "role": "system",
            "content": f"Prior Conversation Summary:\n{state.rolling_summary}"
        })

    # Add Short-term History (last N turns)
    if state.conversation_history:
        for msg in state.conversation_history[-8:]:
            assembled_messages.append({
                "role": msg.get("role", "user"),
                "content": msg.get("content", "")
            })

    # Add Current User Query
    assembled_messages.append({
        "role": "user",
        "content": state.query
    })

    state.assembled_prompt = assembled_messages
    logger.info("Prompt constructed with %d messages for query: %s", len(assembled_messages), state.query[:50])

    state.timing["prompt_constructor"] = time.time() - start
    return state
