"""
Langfuse Cloud Client — Tracing and prompt management hooks.
"""

from __future__ import annotations

import logging
from typing import Any

from app.config import get_settings

logger = logging.getLogger(__name__)

_langfuse_instance = None


def get_langfuse() -> Any:
    """Get singleton Langfuse client instance if credentials are set."""
    global _langfuse_instance
    if _langfuse_instance is not None:
        return _langfuse_instance

    settings = get_settings()
    if settings.LANGFUSE_PUBLIC_KEY and settings.LANGFUSE_SECRET_KEY:
        try:
            from langfuse import Langfuse
            _langfuse_instance = Langfuse(
                public_key=settings.LANGFUSE_PUBLIC_KEY,
                secret_key=settings.LANGFUSE_SECRET_KEY,
                host=settings.LANGFUSE_HOST,
            )
            logger.info("Langfuse Cloud tracing initialized")
        except Exception as e:
            logger.warning("Failed to initialize Langfuse: %s", e)
    return _langfuse_instance
