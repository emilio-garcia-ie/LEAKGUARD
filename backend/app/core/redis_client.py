import json
from typing import Any

import redis.asyncio as redis

from app.core.config import settings

class MockRedis:
    def __init__(self):
        self.store = {}
        
    async def get(self, key: str) -> Any | None:
        return self.store.get(key)
        
    async def set(self, key: str, value: Any, ex: int = None) -> None:
        self.store[key] = value
        
    async def ping(self) -> bool:
        return True

_pool: redis.Redis | MockRedis | None = None


async def get_redis() -> redis.Redis | MockRedis:
    global _pool
    if _pool is None:
        if settings.redis_url.lower() == "mock":
            print("Using In-Memory Mock Redis client.")
            _pool = MockRedis()
        else:
            try:
                client = redis.from_url(settings.redis_url, decode_responses=True)
                await client.ping()
                _pool = client
                print("Successfully connected to Redis server.")
            except Exception as e:
                print(f"Warning: Could not connect to Redis at {settings.redis_url} ({e}). Falling back to In-Memory Mock Redis.")
                _pool = MockRedis()
    return _pool


async def cache_get(key: str) -> Any | None:
    client = await get_redis()
    raw = await client.get(key)
    if raw is None:
        return None
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return raw


async def cache_set(key: str, value: Any, ttl_seconds: int = 3600) -> None:
    client = await get_redis()
    await client.set(key, json.dumps(value, default=str), ex=ttl_seconds)


async def session_set(session_id: str, data: dict[str, Any], ttl_seconds: int = 86400) -> None:
    await cache_set(f"session:{session_id}", data, ttl_seconds)


async def session_get(session_id: str) -> dict[str, Any] | None:
    data = await cache_get(f"session:{session_id}")
    return data if isinstance(data, dict) else None
