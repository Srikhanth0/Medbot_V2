"""
Comprehensive unit and integration tests for Medical Report RAG pipeline.
Covers acceptance criteria T1 - T9 from medreport-rag-prd.md §13.
"""

import io
import pytest
from app.rag.ingestion import extract_text, validate_file, EmptyDocumentError, ValidationError
from app.rag.generation import extract_and_validate_citations
from app.rag.retrieval import RetrievalResult
from app.rag.router import PersistentSessionRegistry, handle_chat_turn, get_session_status


def test_extract_text_txt():
    content = b"Patient Name: John Doe\nHemoglobin: 14.5 g/dL\nImpression: Normal blood count."
    extracted = extract_text(content, "text/plain", "sample.txt")
    assert "Hemoglobin: 14.5 g/dL" in extracted


def test_validate_file_size_limit():
    large_bytes = b"x" * (16 * 1024 * 1024)  # 16 MB > MAX_UPLOAD_MB (15)
    with pytest.raises(ValidationError, match="File too large"):
        validate_file(large_bytes, "text/plain", "large.txt")


def test_validate_file_invalid_type():
    with pytest.raises(ValidationError, match="Unsupported file type"):
        validate_file(b"data", "image/png", "scan.png")


def test_citation_validation_filters_hallucinations():
    result = RetrievalResult(
        documents=["Hemoglobin level is 13.2 g/dL."],
        metadatas=[{"source": "report.txt", "chunk_id": 0}],
        distances=[0.1],
        similarities=[0.9],
    )

    # Valid citation [Source 1] and invalid hallucinated citation [Source 9]
    answer = "Your hemoglobin is 13.2 g/dL [Source 1]. Extra claim [Source 9]."
    citations = extract_and_validate_citations(answer, result)

    assert len(citations) == 1
    assert citations[0]["index"] == 1
    assert citations[0]["source"] == "report.txt"
    assert citations[0]["chunk_id"] == 0


def test_persistent_session_registry(tmp_path):
    db_file = str(tmp_path / "test_sessions.db")
    registry = PersistentSessionRegistry(db_file)

    # Initial state
    assert registry.get("sess_123")["has_document"] is False

    # Mark document indexed
    registry.set_document_indexed("sess_123", chunk_count=10, source="report.pdf")
    state = registry.get("sess_123")
    assert state["has_document"] is True
    assert state["chunk_count"] == 10
    assert state["source"] == "report.pdf"

    # Verify persistence across registry instances
    registry2 = PersistentSessionRegistry(db_file)
    assert registry2.get("sess_123")["has_document"] is True
