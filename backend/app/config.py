from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings, loaded from environment variables or .env file.
    """
    # NVIDIA AI Enterprise settings
    NVIDIA_API_KEY: str
    NVIDIA_BASE_URL: str = "https://integrate.api.nvidia.com/v1"
    NVIDIA_MODEL: str = "thinkingmachines/inkling"
    OPENAI_API_KEY: str = ""

    # Supabase settings
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_ROLE_KEY: str
    DATABASE_URL: str

    # Clerk Auth settings
    CLERK_SECRET_KEY: str
    CLERK_JWKS_URL: str = "https://integral-urchin-49.clerk.accounts.dev/.well-known/jwks.json"

    # Langfuse Observability settings
    LANGFUSE_PUBLIC_KEY: str = ""
    LANGFUSE_SECRET_KEY: str = ""
    LANGFUSE_HOST: str = "https://jp.cloud.langfuse.com"

    # Sentry Error Tracking settings
    SENTRY_DSN: str = ""

    # Backend App settings
    BACKEND_PORT: int = 8000
    LOG_LEVEL: str = "INFO"
    CORS_ORIGINS: List[str] = [
        "https://medbot-v2-two.vercel.app",
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8000",
        "*",
    ]

    # Medical Report RAG Pipeline settings (medreport-rag-prd.md §6)
    EMBEDDING_MODEL: str = "BAAI/bge-small-en-v1.5"
    CHUNK_SIZE: int = 1500
    CHUNK_OVERLAP: int = 200
    TOP_K: int = 5
    SIMILARITY_THRESHOLD: float = 0.35
    MAX_UPLOAD_MB: int = 15
    CHROMA_PERSIST_DIR: str = "./chroma_db"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache()
def get_settings() -> Settings:
    """
    Returns a cached instance of the Settings object.
    """
    return Settings()
