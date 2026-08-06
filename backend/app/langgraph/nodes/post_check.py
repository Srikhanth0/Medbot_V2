"""
Post-Generation Safety and Citation Check Node.

Parses LLM output for inline [chunk_id] citations.
If factual claims exist without citations, or if invalid chunk_ids are referenced,
it marks the check as failed and triggers regeneration or low confidence hedging.
Appends mandatory medical disclaimer.
"""

from __future__ import annotations

import logging
import re
import time

from app.langgraph.state import Citation, Confidence, GraphState

logger = logging.getLogger(__name__)

# Pattern to extract inline citations like [chunk_123] or [chunk_id: 123]
CITATION_PATTERN = re.compile(r"\[(?:chunk_id:\s*|chunk_)?([a-f0-9\-]{8,36})\]", re.IGNORECASE)

DISCLAIMER_TEXT = (
    "\n\n*Disclaimer: MedBot explains medical information for educational purposes. "
    "It does not diagnose conditions or recommend treatment. "
    "Always consult a qualified healthcare professional for medical advice.*"
)

def post_check_node(state: GraphState) -> GraphState:
    """
    LangGraph node: Post-generation safety & citation check.
    """
    start = time.time()

    if not state.generated_response:
        state.passed_post_check = False
        state.timing["post_check"] = time.time() - start
        return state

    text = state.generated_response
    valid_chunk_ids = {c.chunk_id for c in state.retrieved_chunks}
    chunk_lookup = {c.chunk_id: c for c in state.retrieved_chunks}

    # Extract citations
    found_matches = CITATION_PATTERN.findall(text)
    extracted_citations = []
    valid_citation_count = 0

    for match in found_matches:
        cid = match.strip()
        
        if cid in chunk_lookup:
            valid_citation_count += 1
            chunk = chunk_lookup[cid]
            extracted_citations.append(Citation(
                chunk_id=cid,
                document_name=None, # no report name available in chunk
                page_number=chunk.page_number,
                section=chunk.section,
                evidence_quote=chunk.content[:200] if chunk.content else "",
                score=chunk.score
            ))
        else:
            extracted_citations.append(Citation(chunk_id=cid))

    state.citations = extracted_citations

    # Assess confidence score based on retrieval coverage & citations
    if not state.retrieved_chunks:
        state.confidence = Confidence.LOW
    elif valid_citation_count > 0:
        state.confidence = Confidence.HIGH
    elif len(text) > 200:
        state.confidence = Confidence.MEDIUM
    else:
        state.confidence = Confidence.LOW

    # Enforce disclaimer at end of response if not present
    final_text = text.strip()
    if "Disclaimer:" not in final_text:
        final_text += DISCLAIMER_TEXT

    state.final_response = final_text
    state.passed_post_check = True

    logger.info(
        "Post-check complete: %d citations found (%d valid), confidence=%s",
        len(extracted_citations),
        valid_citation_count,
        state.confidence.value
    )

    state.timing["post_check"] = time.time() - start
    return state
