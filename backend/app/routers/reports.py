"""
Reports Router — Handles report uploads, status polling, and short-TTL download URLs.
"""

from __future__ import annotations

import logging
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, UploadFile, status

from app.dependencies import get_current_user, get_db_pool, get_supabase_client
from app.models.schemas import ReportStatusResponse, ReportUploadResponse
from app.rag.ingestion import ingest_report

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/reports", tags=["Reports"])


@router.post("", response_model=ReportUploadResponse, status_code=status.HTTP_202_ACCEPTED)
async def upload_report(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user),
    pool=Depends(get_db_pool),
    supabase=Depends(get_supabase_client),
):
    """
    Upload a medical report (PDF) for RAG processing.
    """
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    content = await file.read()
    if len(content) > 25 * 1024 * 1024:  # 25 MB limit
        raise HTTPException(status_code=400, detail="File size exceeds 25 MB limit")

    try:
        # 1. Upload raw PDF to Supabase Storage
        storage_path = f"reports/{user_id}/{file.filename}"
        supabase.storage.from_("reports").upload(
            path=storage_path,
            file=content,
            file_options={"content-type": "application/pdf", "upsert": "true"},
        )

        # 2. Insert metadata record in Postgres via asyncpg pool
        from app.db.queries import insert_report
        report_id = await insert_report(
            pool=pool,
            user_id=user_id,
            storage_path=storage_path,
            report_type="lab_panel",
        )

        # 3. Schedule async RAG ingestion job
        background_tasks.add_task(
            ingest_report,
            report_id=str(report_id),
            file_bytes=content,
            user_id=user_id,
            pool=pool,
        )

        logger.info("Report %s uploaded and queued for processing for user %s", report_id, user_id)

        return ReportUploadResponse(report_id=str(report_id), status="processing")

    except Exception as e:
        logger.exception("Upload failed")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.get("/{report_id}", response_model=ReportStatusResponse)
async def get_report_status(
    report_id: str,
    user_id: str = Depends(get_current_user),
    pool=Depends(get_db_pool),
):
    """
    Poll ingestion status for a report.
    """
    from app.db.queries import get_report

    report = await get_report(pool, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    return ReportStatusResponse(
        id=str(report["id"]),
        status=report["status"],
        report_type=report.get("report_type"),
        created_at=report["created_at"],
    )
