"""
MedBot API — FastAPI Application Entry Point.
"""

from __future__ import annotations

from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.db.client import close_db_pool, init_db_pool
from app.routers import conversations, exercises, health, messages, reports

settings = get_settings()

logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Suppress verbose low-level network debug chatter
for noisy_logger in ["hpack", "httpcore", "httpx", "sse_starlette"]:
    logging.getLogger(noisy_logger).setLevel(logging.WARNING)


from fastapi import Request
import time

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    App lifespan context manager for startup & shutdown events.
    """
    logger.info("Starting MedBot API v0.1.0...")

    # Initialize Sentry if DSN provided
    if settings.SENTRY_DSN and "example" not in settings.SENTRY_DSN:
        try:
            import sentry_sdk
            sentry_sdk.init(
                dsn=settings.SENTRY_DSN,
                environment=settings.SENTRY_ENVIRONMENT,
                traces_sample_rate=settings.SENTRY_TRACES_SAMPLE_RATE,
            )
            logger.info("Sentry initialized")
        except Exception as e:
            logger.warning("Failed to initialize Sentry: %s", e)

    # Initialize DB pool
    try:
        await init_db_pool()
        logger.info("Database connection pool initialized")
    except Exception as e:
        logger.error("Database connection pool failed: %s", e)

    yield

    logger.info("Shutting down MedBot API...")
    await close_db_pool()


app = FastAPI(
    title="MedBot API",
    description="Medical Understanding Platform RAG API",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# HTTP Request & Response Logging Middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration_ms = (time.time() - start_time) * 1000
    logger.info(
        "➡️  [%s %s] Status: %d %s | Duration: %.2fms",
        request.method,
        request.url.path,
        response.status_code,
        "OK" if response.status_code < 400 else "ERROR",
        duration_ms
    )
    return response

# Register Routers
app.include_router(health.router)
app.include_router(reports.router)
app.include_router(conversations.router)
app.include_router(messages.router)
app.include_router(exercises.router)


@app.get("/")
async def root():
    return {
        "service": "medbot-api",
        "version": "0.1.0",
        "status": "healthy",
    }
