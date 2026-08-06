"""LangGraph state definition for the MedBot RAG pipeline."""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Any
from uuid import UUID


class SafetyClassification(str, Enum):
    """Safety classification categories for user queries."""

    NORMAL = "normal"
    EMERGENCY = "emergency"
    DIAGNOSIS_SEEKING = "diagnosis_seeking"
    TREATMENT_SEEKING = "treatment_seeking"
    DRUG_MISUSE = "drug_misuse"


class IntentCategory(str, Enum):
    """Intent categories determined by Intent Router."""

    CASUAL_CHAT = "casual_chat"
    MEMORY_CHAT = "memory_chat"
    REASONING = "reasoning"
    DOCUMENT_LOOKUP = "document_lookup"
    EXERCISE = "exercise"
    AMBIGUOUS = "ambiguous"


class Confidence(str, Enum):
    """Confidence level of the generated response."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


@dataclass
class RetrievedChunk:
    """A chunk retrieved from pgvector search."""

    chunk_id: str
    content: str
    score: float
    chunk_type: str | None = None
    section: str | None = None
    page_number: int | None = None
    is_abnormal: bool | None = None
    loinc_code: str | None = None
    parent_content: str | None = None


@dataclass
class MedicalEnrichment:
    """Context enrichment from medical APIs."""

    source: str  # 'rxnorm' | 'openfda' | 'medlineplus'
    query: str
    result: str
    url: str | None = None


@dataclass
class Citation:
    """A citation reference in the generated response."""

    chunk_id: str
    source_text: str | None = None
    document_name: str | None = None
    page_number: int | None = None
    section: str | None = None
    evidence_quote: str | None = None
    score: float | None = None


@dataclass
class GraphState:
    """
    Complete state object passed through the LangGraph pipeline.

    Flow:
    safety_gate -> intent_router -> (if use_rag: query_rewriter -> retrieval -> medical_enrichment)
    -> prompt_constructor -> generation -> post_check -> END
    """

    # --- Input ---
    query: str = ""
    user_id: str = ""
    conversation_id: str = ""
    report_id: str | None = None

    # --- Safety Gate Output ---
    safety_classification: SafetyClassification = SafetyClassification.NORMAL
    safety_response: str | None = None  # Pre-built response for emergency/reframe
    detected_entities: list[str] = field(default_factory=list)

    # --- Intent Router & Query Rewriter Output ---
    intent: IntentCategory = IntentCategory.DOCUMENT_LOOKUP
    use_rag: bool = True
    rewritten_query: str = ""
    intent_confidence: float = 1.0
    intent_reason: str = ""
    recommended_exercise: dict | None = None

    # --- Retrieval Output ---
    retrieved_chunks: list[RetrievedChunk] = field(default_factory=list)

    # --- Medical Enrichment Output ---
    medical_context: list[MedicalEnrichment] = field(default_factory=list)

    # --- Memory ---
    conversation_history: list[dict[str, str]] = field(default_factory=list)
    rolling_summary: str = ""

    # --- Prompt Construction Output ---
    assembled_prompt: list[dict[str, str]] = field(default_factory=list)

    # --- Generation Output ---
    generated_response: str = ""
    raw_llm_output: str = ""

    # --- Post-Check Output ---
    citations: list[Citation] = field(default_factory=list)
    confidence: Confidence = Confidence.MEDIUM
    passed_post_check: bool = False
    regeneration_count: int = 0
    max_regenerations: int = 2

    # --- Final Output ---
    final_response: str = ""
    safety_event: str | None = None
    disclaimer: str = (
        "Disclaimer: MedBot explains medical information for educational purposes. "
        "It does not diagnose conditions or recommend treatment. "
        "Always consult a qualified healthcare professional for medical advice."
    )

    # --- Metadata ---
    error: str | None = None
    timing: dict[str, float] = field(default_factory=dict)
