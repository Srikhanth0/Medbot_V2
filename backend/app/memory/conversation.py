"""
Conversation Memory Manager.

Manages short-term history (last 6-10 turns) and rolling summary updates.
"""

from __future__ import annotations

import logging
from typing import Any

from app.db.queries import get_recent_messages, update_rolling_summary

logger = logging.getLogger(__name__)


async def load_conversation_memory(pool: Any, conversation_id: str) -> tuple[list[dict[str, str]], str]:
    """
    Load short-term message history and rolling summary for a conversation.
    """
    recent_msgs = await get_recent_messages(pool, conversation_id, limit=10)
    history = [
        {"role": msg["role"], "content": msg["content"]}
        for msg in reversed(recent_msgs)
    ]
    
    # In a full implementation, rolling summary can be fetched from conversation row
    summary = ""
    return history, summary
