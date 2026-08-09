from pydantic import BaseModel
from typing import Optional


class RagChatRequest(BaseModel):
    session_id: str
    message: str


class Citation(BaseModel):
    index: int
    source: str
    chunk_id: int
    snippet: str


class RagChatResponse(BaseModel):
    answer: str
    citations: list[Citation]
    mode: str  # "rag" | "basic"


class UploadResponse(BaseModel):
    session_id: str
    document_indexed: bool
    chunk_count: int
    source: str


class SessionStatusResponse(BaseModel):
    session_id: str
    has_document: bool
    chunk_count: int
    source: Optional[str] = None
