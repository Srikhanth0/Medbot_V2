from datetime import datetime
from typing import Optional, List, Dict, Any
from uuid import UUID

from pydantic import BaseModel, Field, ConfigDict


class CitationItem(BaseModel):
    chunk_id: str
    document_name: Optional[str] = None
    page_number: Optional[int] = None
    section: Optional[str] = None
    evidence_quote: str = ""
    score: Optional[float] = None



class ReportUploadResponse(BaseModel):
    """Response returned when a medical report is successfully uploaded."""
    report_id: UUID = Field(..., description="Unique identifier for the uploaded report")
    status: str = Field(..., description="Current processing status (e.g., 'processing', 'completed')")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "report_id": "123e4567-e89b-12d3-a456-426614174000",
                "status": "processing"
            }
        }
    )


class ReportStatusResponse(BaseModel):
    """Response detailing the status of a medical report."""
    id: UUID = Field(..., description="Unique identifier for the report")
    status: str = Field(..., description="Current processing status")
    report_type: Optional[str] = Field(None, description="Type of the report (e.g., 'blood_test', 'mri')")
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow, description="When the report was uploaded")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "status": "completed",
                "report_type": "blood_test",
                "created_at": "2023-10-25T10:00:00Z"
            }
        }
    )


class ConversationCreate(BaseModel):
    """Request to create a new conversation context."""
    report_id: Optional[UUID] = Field(None, description="Optional report ID to link with this conversation")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "report_id": "123e4567-e89b-12d3-a456-426614174000"
            }
        }
    )


class ConversationResponse(BaseModel):
    """Response containing conversation details."""
    id: UUID = Field(..., description="Unique identifier for the conversation")
    report_id: Optional[UUID] = Field(None, description="Linked report ID, if any")
    rolling_summary: Optional[str] = Field(None, description="Current AI-generated summary of the conversation")
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow, description="When the conversation started")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "report_id": "123e4567-e89b-12d3-a456-426614174000",
                "rolling_summary": "Patient inquired about blood pressure results.",
                "created_at": "2023-10-25T10:00:00Z"
            }
        }
    )


class MessageCreate(BaseModel):
    """Request to post a message in a conversation."""
    content: str = Field(..., description="The message content sent by the user")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "content": "Can you explain what my hemoglobin level means?"
            }
        }
    )


class MessageResponse(BaseModel):
    """Response containing message details."""
    id: UUID = Field(..., description="Unique identifier for the message")
    role: str = Field(..., description="Role of the message author ('user' or 'assistant')")
    content: str = Field(..., description="The text content of the message")
    citations: List[CitationItem] = Field(default_factory=list, description="Inline citations extracted from retrieved report chunks")
    safety_event: Optional[str] = Field(None, description="Safety event classification, if triggered")
    confidence: Optional[str] = Field(None, description="Confidence level ('low', 'medium', 'high')")
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow, description="When the message was created")


class ChatStreamEvent(BaseModel):
    """Event payload for Server-Sent Events (SSE) chat streaming."""
    event: str = Field(..., description="Event type ('token', 'done', 'error')")
    data: str = Field(..., description="Text chunk or JSON payload")


class HealthResponse(BaseModel):
    """API health status response."""
    status: str = Field(..., description="Overall health status ('healthy', 'degraded')")
    checks: Dict[str, Any] = Field(..., description="Detailed status of backend sub-components")


class ErrorResponse(BaseModel):
    """Standardized API error response."""
    detail: str = Field(..., description="Human-readable error explanation")


class UserProfile(BaseModel):
    """User profile preferences and context."""
    clerk_user_id: str = Field(..., description="Clerk user ID")
    reading_level: str = Field("standard", description="Reading complexity level ('simple', 'standard', 'technical')")
    preferred_units: str = Field("conventional", description="Measurement units preference ('conventional', 'si')")
    language: str = Field("en", description="Preferred language code")
