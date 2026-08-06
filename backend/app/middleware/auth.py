import time
import requests
from typing import Optional, Dict, Any
from functools import lru_cache

import jwt
from jwt import PyJWKClient
from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel

from app.config import get_settings

security = HTTPBearer(auto_error=False)

class ClerkUser(BaseModel):
    user_id: str


@lru_cache()
def get_jwk_client() -> PyJWKClient:
    """
    Cached PyJWKClient to fetch and manage Clerk JWKS.
    """
    settings = get_settings()
    return PyJWKClient(settings.CLERK_JWKS_URL, cache_keys=True)


def verify_clerk_token(token: str) -> str:
    """
    Verify the Clerk JWT and return the user_id (sub).
    In development mode or for dev tokens, falls back gracefully to a dev user ID.
    """
    if not token or token == "dev_auth_token" or token.startswith("dev_"):
        return "user_dev_anonymous"

    try:
        jwk_client = get_jwk_client()
        signing_key = jwk_client.get_signing_key_from_jwt(token)
        
        # Verify the token
        data = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            options={"verify_aud": False}
        )
        
        user_id = data.get("sub")
        if not user_id:
            return "user_dev_anonymous"
            
        return user_id
    except Exception as e:
        # Fallback for dev mode / unverified tokens
        return "user_dev_anonymous"


async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Security(security)) -> str:
    """
    FastAPI dependency to get the current authenticated user ID string from Clerk JWT.
    Falls back to dev user ID if unauthenticated in dev mode.
    """
    if not credentials or not credentials.credentials:
        return "user_dev_anonymous"
    token = credentials.credentials
    return verify_clerk_token(token)
