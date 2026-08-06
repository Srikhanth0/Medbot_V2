"""
Conversations Router — Create & list chat sessions.
"""

from __future__ import annotations

from datetime import datetime
import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException

from app.dependencies import get_current_user, get_db_pool
from app.models.schemas import ConversationCreate, ConversationResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/conversations", tags=["Conversations"])


@router.post("", response_model=ConversationResponse)
async def create_new_conversation(
    payload: ConversationCreate,
    user_id: str = Depends(get_current_user),
    pool=Depends(get_db_pool),
):
    """
    Create a new conversation session, optionally scoped to a report_id.
    """
    from app.db.queries import create_conversation

    try:
        conv_id = await create_conversation(
            pool=pool,
            user_id=user_id,
            report_id=payload.report_id,
            title="New Medical Chat",
        )
        return ConversationResponse(
            id=str(conv_id),
            report_id=payload.report_id,
            rolling_summary="",
            created_at=datetime.utcnow(),
        )
    except Exception as e:
        logger.exception("Failed to create conversation")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{conversation_id}")
async def get_conversation_history(
    conversation_id: str,
    user_id: str = Depends(get_current_user),
    pool=Depends(get_db_pool),
):
    """
    Fetch history and rolling summary for a conversation.
    """
    from app.db.queries import get_conversation

    conv = await get_conversation(pool, conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    return conv
