"""
Retrieval Node — pgvector cosine-similarity search with optional tsvector hybrid boost.

This node retrieves relevant document chunks from the user's uploaded reports.
Access control is enforced at the SQL level — every query is hard-filtered on
user_id and report_id. A retrieval bug returning another user's chunk is a
DATA-BREACH-CLASS incident, not a relevance bug.
"""

from __future__ import annotations

import logging
import time
from uuid import UUID

import asyncpg

from app.langgraph.state import GraphState, RetrievedChunk

logger = logging.getLogger(__name__)

# SQL for pure vector search (cosine similarity)
VECTOR_SEARCH_SQL = """
SELECT
    rc.id::text AS chunk_id,
    rc.content,
    rc.chunk_type,
    rc.section,
    rc.page_number,
    rc.is_abnormal,
    rc.loinc_code,
    1 - (rc.embedding <=> $1::vector) AS score,
    parent.content AS parent_content
FROM report_chunks rc
LEFT JOIN report_chunks parent ON rc.parent_chunk_id = parent.id
JOIN reports r ON rc.report_id = r.id
WHERE r.user_id = $2::uuid
  AND ($3::uuid IS NULL OR rc.report_id = $3::uuid)
ORDER BY rc.embedding <=> $1::vector
LIMIT $4;
"""

# SQL for hybrid search: combines vector similarity with full-text tsvector matching
HYBRID_SEARCH_SQL = """
WITH vector_results AS (
    SELECT
        rc.id,
        rc.content,
        rc.chunk_type,
        rc.section,
        rc.page_number,
        rc.is_abnormal,
        rc.loinc_code,
        rc.parent_chunk_id,
        1 - (rc.embedding <=> $1::vector) AS vector_score,
        0.0 AS text_score
    FROM report_chunks rc
    JOIN reports r ON rc.report_id = r.id
    WHERE r.user_id = $2::uuid
      AND ($3::uuid IS NULL OR rc.report_id = $3::uuid)
    ORDER BY rc.embedding <=> $1::vector
    LIMIT $4
),
text_results AS (
    SELECT
        rc.id,
        rc.content,
        rc.chunk_type,
        rc.section,
        rc.page_number,
        rc.is_abnormal,
        rc.loinc_code,
        rc.parent_chunk_id,
        0.0 AS vector_score,
        ts_rank_cd(rc.content_tsv, plainto_tsquery('english', $5)) AS text_score
    FROM report_chunks rc
    JOIN reports r ON rc.report_id = r.id
    WHERE r.user_id = $2::uuid
      AND ($3::uuid IS NULL OR rc.report_id = $3::uuid)
      AND rc.content_tsv @@ plainto_tsquery('english', $5)
    ORDER BY text_score DESC
    LIMIT $4
),
combined AS (
    SELECT * FROM vector_results
    UNION ALL
    SELECT * FROM text_results
),
ranked AS (
    SELECT DISTINCT ON (id)
        id,
        content,
        chunk_type,
        section,
        page_number,
        is_abnormal,
        loinc_code,
        parent_chunk_id,
        GREATEST(vector_score, 0) * 0.7 + GREATEST(text_score, 0) * 0.3 AS combined_score
    FROM combined
    ORDER BY id, (GREATEST(vector_score, 0) * 0.7 + GREATEST(text_score, 0) * 0.3) DESC
)
SELECT
    r.id::text AS chunk_id,
    r.content,
    r.chunk_type,
    r.section,
    r.page_number,
    r.is_abnormal,
    r.loinc_code,
    r.combined_score AS score,
    parent.content AS parent_content
FROM ranked r
LEFT JOIN report_chunks parent ON r.parent_chunk_id = parent.id
ORDER BY r.combined_score DESC
LIMIT $4;
"""


async def retrieve_chunks(
    pool: asyncpg.Pool,
    query_embedding: list[float],
    user_id: str,
    report_id: str | None = None,
    query_text: str | None = None,
    limit: int = 10,
) -> list[RetrievedChunk]:
    """
    Retrieve relevant chunks using vector search with optional hybrid text boost.
    """
    embedding_str = f"[{','.join(str(v) for v in query_embedding)}]"
    report_uuid = report_id if report_id else None

    try:
        async with pool.acquire() as conn:
            if query_text:
                rows = await conn.fetch(
                    HYBRID_SEARCH_SQL,
                    embedding_str,
                    user_id,
                    report_uuid,
                    limit,
                    query_text,
                )
            else:
                rows = await conn.fetch(
                    VECTOR_SEARCH_SQL,
                    embedding_str,
                    user_id,
                    report_uuid,
                    limit,
                )

        chunks = []
        for row in rows:
            chunks.append(
                RetrievedChunk(
                    chunk_id=str(row["chunk_id"]),
                    content=row["content"],
                    score=float(row["score"]),
                    chunk_type=row.get("chunk_type"),
                    section=row.get("section"),
                    page_number=row.get("page_number"),
                    is_abnormal=row.get("is_abnormal"),
                    loinc_code=row.get("loinc_code"),
                    parent_content=row.get("parent_content"),
                )
            )

        return chunks
    except Exception as e:
        logger.warning("Vector search query on database pool failed (report_chunks table may be empty or uninitialized): %s", e)
        return []


async def retrieval_node(state: GraphState, pool: asyncpg.Pool) -> GraphState:
    """
    LangGraph node: Retrieval.

    Uses state.rewritten_query (from Query Rewriter) if present for optimal search recall.
    """
    start = time.time()
    search_query = state.rewritten_query or state.query

    if not search_query or not state.user_id:
        state.error = "Missing query or user_id for retrieval"
        logger.error(state.error)
        state.timing["retrieval"] = time.time() - start
        return state

    try:
        from app.rag.embeddings import generate_embeddings

        embeddings = await generate_embeddings([search_query], input_type="query")
        if not embeddings:
            state.error = "Failed to generate query embedding"
            logger.error(state.error)
            state.timing["retrieval"] = time.time() - start
            return state

        query_embedding = embeddings[0]

        chunks = await retrieve_chunks(
            pool=pool,
            query_embedding=query_embedding,
            user_id=state.user_id,
            report_id=state.report_id,
            query_text=search_query,
            limit=10,
        )

        state.retrieved_chunks = chunks
        logger.info(
            "Retrieved %d chunks using search_query='%s' for user=%s, report=%s, top_score=%.4f",
            len(chunks),
            search_query,
            state.user_id,
            state.report_id,
            chunks[0].score if chunks else 0.0,
        )

    except Exception as e:
        state.error = f"Retrieval error: {e}"
        logger.exception("Retrieval failed")

    state.timing["retrieval"] = time.time() - start
    return state
