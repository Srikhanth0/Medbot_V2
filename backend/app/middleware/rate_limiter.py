import time
import asyncio
from typing import Dict, Tuple
from fastapi import HTTPException, Request, Depends
from dataclasses import dataclass

from app.middleware.auth import get_current_user, ClerkUser


@dataclass
class TokenBucket:
    tokens: float
    last_updated: float


class RateLimiter:
    """
    In-memory token bucket rate limiter for per-user rate limiting.
    """
    def __init__(self, capacity: int, refill_rate: float):
        """
        capacity: Maximum tokens in the bucket
        refill_rate: Tokens added per second
        """
        self.capacity = capacity
        self.refill_rate = refill_rate
        self.buckets: Dict[str, TokenBucket] = {}
        self.lock = asyncio.Lock()
        
        # Start cleanup task (requires event loop to be running)
        self._cleanup_task = None

    def _start_cleanup(self):
        if self._cleanup_task is None:
            self._cleanup_task = asyncio.create_task(self._cleanup_loop())

    async def _cleanup_loop(self):
        while True:
            await asyncio.sleep(300)  # Cleanup every 5 minutes
            async with self.lock:
                now = time.time()
                # Remove buckets that haven't been updated in 10 minutes
                stale_keys = [
                    k for k, v in self.buckets.items() 
                    if now - v.last_updated > 600
                ]
                for k in stale_keys:
                    del self.buckets[k]

    async def consume(self, user_id: str, tokens: int = 1) -> bool:
        """
        Consume tokens from a user's bucket. Returns True if successful, False if rate limited.
        """
        self._start_cleanup()
        
        async with self.lock:
            now = time.time()
            if user_id not in self.buckets:
                self.buckets[user_id] = TokenBucket(tokens=self.capacity, last_updated=now)

            bucket = self.buckets[user_id]
            
            # Refill tokens based on time elapsed
            time_passed = now - bucket.last_updated
            new_tokens = time_passed * self.refill_rate
            bucket.tokens = min(self.capacity, bucket.tokens + new_tokens)
            bucket.last_updated = now
            
            if bucket.tokens >= tokens:
                bucket.tokens -= tokens
                return True
            return False


# 30 requests per minute = 1 request every 2 seconds
chat_rate_limiter = RateLimiter(capacity=30, refill_rate=30 / 60)

# 5 uploads per minute = 1 upload every 12 seconds
upload_rate_limiter = RateLimiter(capacity=5, refill_rate=5 / 60)


async def check_chat_rate_limit(user: ClerkUser = Depends(get_current_user)):
    """
    FastAPI dependency for chat rate limiting.
    """
    allowed = await chat_rate_limiter.consume(user.user_id)
    if not allowed:
        raise HTTPException(status_code=429, detail="Too many chat requests. Please try again later.")
    return user


async def check_upload_rate_limit(user: ClerkUser = Depends(get_current_user)):
    """
    FastAPI dependency for upload rate limiting.
    """
    allowed = await upload_rate_limiter.consume(user.user_id)
    if not allowed:
        raise HTTPException(status_code=429, detail="Too many upload requests. Please try again later.")
    return user
