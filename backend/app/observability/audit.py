"""
Audit Logging — Append-only audit logger writing sensitive events to audit_log table.
"""

from __future__ import annotations

import logging
from typing import Any
from uuid import UUID

from app.db.queries import insert_audit_log

logger = logging.getLogger(__name__)


async def log_audit_event(
    pool: Any,
    user_id: str | UUID | None,
    action: str,
    resource_type: str | None = None,
    resource_id: str | UUID | None = None,
    metadata: dict[str, Any] | None = None,
) -> None:
    """
    Write an append-only audit event to the audit_log table.
    """
    try:
        if pool:
            await insert_audit_log(
                pool=pool,
                user_id=user_id,
                action=action,
                resource_type=resource_type,
                resource_id=resource_id,
                metadata=metadata,
            )
        logger.info("Audit log: action=%s, user=%s, resource=%s", action, user_id, resource_id)
    except Exception as e:
        logger.error("Failed to write audit log: %s", e)
