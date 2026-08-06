import asyncio
from typing import Optional, Any

import asyncpg
from supabase import create_client, Client

from app.config import get_settings


class DatabaseClient:
    """
    Manages database connections including Supabase client and asyncpg pool.
    """
    def __init__(self):
        self._pool: Optional[asyncpg.Pool] = None
        self._supabase_admin: Optional[Client] = None
        self._settings = get_settings()

    async def connect(self):
        """
        Initialize connections to the database.
        """
        if self._pool is None:
            db_url = self._settings.DATABASE_URL
            if db_url.startswith("postgres://"):
                db_url = db_url.replace("postgres://", "postgresql://", 1)

            try:
                # Try connecting with SSL mode required for Supabase Postgres
                self._pool = await asyncpg.create_pool(
                    db_url,
                    min_size=1,
                    max_size=10,
                    ssl="require",
                    timeout=10.0
                )
            except Exception as e:
                try:
                    # Fallback without explicit SSL parameter if SSL is already in query string
                    self._pool = await asyncpg.create_pool(
                        db_url,
                        min_size=1,
                        max_size=10,
                        timeout=10.0
                    )
                except Exception as err2:
                    print(f"Warning: asyncpg pool creation failed ({err2}). Operations requiring raw SQL pool will retry on demand.")

        if self._supabase_admin is None:
            self._supabase_admin = create_client(
                self._settings.SUPABASE_URL,
                self._settings.SUPABASE_SERVICE_ROLE_KEY
            )

    async def close(self):
        """
        Close all database connections.
        """
        if self._pool:
            await self._pool.close()
            self._pool = None

    def get_supabase_admin(self) -> Client:
        """
        Get the Supabase client initialized with the service role key.
        """
        if self._supabase_admin is None:
            self._supabase_admin = create_client(
                self._settings.SUPABASE_URL,
                self._settings.SUPABASE_SERVICE_ROLE_KEY
            )
        return self._supabase_admin

    def get_supabase_user_client(self, auth_token: str) -> Client:
        """
        Get a Supabase client configured with a specific user's auth token for RLS.
        """
        client = create_client(
            self._settings.SUPABASE_URL,
            self._settings.SUPABASE_ANON_KEY
        )
        client.postgrest.auth(auth_token)
        return client

    async def get_pool(self) -> Optional[asyncpg.Pool]:
        """
        Get the asyncpg connection pool.
        """
        if self._pool is None:
            await self.connect()
        return self._pool


# Global database client instance
db_client = DatabaseClient()


async def init_db_pool():
    """Module-level helper to initialize DB pool."""
    await db_client.connect()


async def close_db_pool():
    """Module-level helper to close DB pool."""
    await db_client.close()


async def get_db_pool() -> Optional[asyncpg.Pool]:
    """FastAPI dependency or query helper to get asyncpg pool."""
    return await db_client.get_pool()


async def execute_query(query: str, *args: Any) -> Any:
    """
    Helper function to execute a parameterized SQL query using the connection pool.
    """
    pool = await db_client.get_pool()
    if not pool:
        raise RuntimeError("Database pool not initialized")
    async with pool.acquire() as connection:
        return await connection.fetch(query, *args)
