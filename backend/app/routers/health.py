import logging
import httpx
from fastapi import APIRouter, Depends, HTTPException

from app.dependencies import get_db_pool
from app.models.schemas import HealthResponse
from app.config import get_settings

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/health",
    tags=["Health"]
)


@router.get("", response_model=HealthResponse)
async def liveness():
    """
    Liveness check. Always returns 200 if the app is running.
    """
    return HealthResponse(status="ok", checks={})


@router.get("/ready", response_model=HealthResponse)
async def readiness(pool=Depends(get_db_pool)):
    """
    Readiness check. Validates DB connection and NVIDIA API reachability.
    """
    checks = {}
    status = "ok"

    # 1. Check Database
    try:
        async with pool.acquire() as connection:
            await connection.fetchval("SELECT 1")
        checks["database"] = "ok"
    except Exception as e:
        logger.error(f"Database readiness check failed: {e}")
        checks["database"] = "error"
        status = "error"

    # 2. Check NVIDIA API
    settings = get_settings()
    try:
        # We perform a simple GET to the models endpoint or base URL to check reachability
        # Note: Actual auth might be required for /models, so we just check network reachability
        async with httpx.AsyncClient(timeout=5.0) as client:
            # We just ping the base URL domain
            base_url = settings.NVIDIA_BASE_URL
            response = await client.get(f"{base_url}/models", headers={"Authorization": f"Bearer {settings.NVIDIA_API_KEY}"})
            # It's reachable even if it returns 401 or 404, we just want to ensure no network error
            if response.status_code in (200, 401, 404, 403):
                checks["nvidia_api"] = "ok"
            else:
                checks["nvidia_api"] = f"unexpected_status_{response.status_code}"
                status = "error"
    except Exception as e:
        logger.error(f"NVIDIA API readiness check failed: {e}")
        checks["nvidia_api"] = "error"
        status = "error"

    if status == "error":
        raise HTTPException(
            status_code=503, 
            detail={"status": "error", "checks": checks}
        )

    return HealthResponse(status=status, checks=checks)
