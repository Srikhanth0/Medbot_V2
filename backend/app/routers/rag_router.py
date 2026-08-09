"""
RAG API Router — /upload, /chat, /session/{session_id}/status endpoints.
Per medreport-rag-prd.md §11.
"""

from __future__ import annotations

import logging
import uuid

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.models.rag_models import (
    Citation,
    RagChatRequest,
    RagChatResponse,
    SessionStatusResponse,
    UploadResponse,
)
from app.rag.ingestion import EmptyDocumentError, ValidationError
from app.rag.router import get_session_status, handle_chat_turn

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Medical Report RAG"])


# ---------------------------------------------------------------------------
# POST /upload — Multipart file upload + ingestion
# ---------------------------------------------------------------------------
@router.post("/upload", response_model=UploadResponse)
@router.post("/api/upload", response_model=UploadResponse, include_in_schema=False)
async def upload_document(
    session_id: str = Form(...),
    file: UploadFile = File(...),
):
    """
    Upload a medical report (PDF, DOCX, or TXT) and index it for the session.
    """
    logger.info(
        "📄 Upload request: session=%s, file='%s', type=%s",
        session_id, file.filename, file.content_type,
    )

    try:
        file_bytes = await file.read()

        # Use the chat turn handler with file attached (ingestion path)
        result = await handle_chat_turn(
            session_id=session_id,
            user_message="",  # No message during pure upload
            file_bytes=file_bytes,
            content_type=file.content_type or "application/octet-stream",
            filename=file.filename or "unknown",
        )

        # Get session state to return chunk count
        status = get_session_status(session_id)

        return UploadResponse(
            session_id=session_id,
            document_indexed=True,
            chunk_count=status["chunk_count"],
            source=file.filename or "unknown",
        )

    except ValidationError as e:
        logger.warning("Upload validation failed: %s", e)
        raise HTTPException(status_code=400, detail=str(e))
    except EmptyDocumentError as e:
        logger.warning("Empty document uploaded: %s", e)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error("Upload failed: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail=f"Upload processing failed: {e}")


# ---------------------------------------------------------------------------
# POST /chat — Chat turn with optional file attachment
# ---------------------------------------------------------------------------
@router.post("/chat", response_model=RagChatResponse)
@router.post("/api/chat", response_model=RagChatResponse, include_in_schema=False)
async def chat(request: RagChatRequest):
    """
    Handle a chat turn. Dispatches to RAG or basic LLM mode based on
    whether the session has an indexed document.
    """
    logger.info(
        "💬 Chat request: session=%s, message='%s'",
        request.session_id, request.message[:80],
    )

    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    try:
        result = await handle_chat_turn(
            session_id=request.session_id,
            user_message=request.message,
        )

        # Convert citation dicts to Citation models
        citations = [Citation(**c) for c in result.get("citations", [])]

        return RagChatResponse(
            answer=result["answer"],
            citations=citations,
            mode=result["mode"],
        )

    except Exception as e:
        logger.error("Chat failed: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail=f"Chat processing failed: {e}")


# ---------------------------------------------------------------------------
# POST /chat/upload — Chat turn WITH file attachment in one call
# ---------------------------------------------------------------------------
@router.post("/chat/upload", response_model=RagChatResponse)
@router.post(
    "/api/chat/upload", response_model=RagChatResponse, include_in_schema=False
)
async def chat_with_upload(
    session_id: str = Form(...),
    message: str = Form(...),
    file: UploadFile = File(...),
):
    """
    Handle a chat turn with a file attachment. Ingests the file first,
    then answers the question using RAG.
    """
    logger.info(
        "💬📄 Chat+Upload: session=%s, file='%s', message='%s'",
        session_id, file.filename, message[:80],
    )

    try:
        file_bytes = await file.read()

        result = await handle_chat_turn(
            session_id=session_id,
            user_message=message,
            file_bytes=file_bytes,
            content_type=file.content_type or "application/octet-stream",
            filename=file.filename or "unknown",
        )

        citations = [Citation(**c) for c in result.get("citations", [])]

        return RagChatResponse(
            answer=result["answer"],
            citations=citations,
            mode=result["mode"],
        )

    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except EmptyDocumentError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error("Chat+Upload failed: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail=f"Processing failed: {e}")


# ---------------------------------------------------------------------------
# GET /session/{session_id}/status
# ---------------------------------------------------------------------------
@router.get("/session/{session_id}/status", response_model=SessionStatusResponse)
@router.get(
    "/api/session/{session_id}/status",
    response_model=SessionStatusResponse,
    include_in_schema=False,
)
async def session_status(session_id: str):
    """Get the current state of a session (whether a document is indexed)."""
    status = get_session_status(session_id)
    return SessionStatusResponse(**status)
