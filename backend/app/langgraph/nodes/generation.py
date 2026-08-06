"""
Generation Node — Invokes NVIDIA Inkling LLM via ChatNVIDIA / OpenAI API compatible endpoint.

Handles streaming token delivery and Langfuse tracing.
All calls have strict timeouts and max_retries=0 to prevent indefinite hangs.
"""

from __future__ import annotations

import logging
import time
from typing import Any, AsyncGenerator

import httpx
from app.llm.factory import get_llm_provider

from app.config import get_settings
from app.langgraph.state import GraphState

logger = logging.getLogger(__name__)


async def generate_response(messages: list[dict[str, str]]) -> str:
    """
    Call NVIDIA Inkling model using OpenAI-compatible Async client.
    """
    provider = get_llm_provider()
    return await provider.generate(messages, temperature=0.2)


async def generate_stream_response(messages: list[dict[str, str]]) -> AsyncGenerator[str, None]:
    """
    Stream response tokens from NVIDIA Inkling model for SSE endpoint.
    """
    provider = get_llm_provider()
    async for chunk in provider.generate_stream(messages, temperature=0.2):
        yield chunk


async def generation_node(state: GraphState) -> GraphState:
    """
    LangGraph node: LLM Generation.
    """
    start = time.time()

    if not state.assembled_prompt:
        state.error = "No assembled prompt available for generation"
        logger.error(state.error)
        state.timing["generation"] = time.time() - start
        return state

    try:
        raw_output = await generate_response(state.assembled_prompt)
        state.raw_llm_output = raw_output
        state.generated_response = raw_output
        logger.info("Generated LLM response (%d chars)", len(raw_output))
    except Exception as e:
        state.error = f"LLM generation failed: {e}"
        logger.exception("Generation error")

    state.timing["generation"] = time.time() - start
    return state
