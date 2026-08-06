from typing import Optional
import asyncpg
from supabase import Client
from fastapi import Depends

from app.db.client import db_client
from app.middleware.auth import get_current_user, verify_clerk_token


def get_supabase_client() -> Client:
    """
    Get the Supabase client initialized with the service role key.
    """
    return db_client.get_supabase_admin()


def get_supabase_user_client(user_id: str = Depends(get_current_user)) -> Client:
    """
    Get a Supabase client configured with a specific user's auth token for RLS.
    """
    return db_client.get_supabase_user_client(user_id)


async def get_db_pool() -> Optional[asyncpg.Pool]:
    """
    Get the asyncpg connection pool.
    """
    return await db_client.get_pool()
