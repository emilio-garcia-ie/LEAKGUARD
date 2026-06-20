import json
from typing import Any

import redis.asyncio as redis

from app.core.config import settings

_pool: redis.Redis | None = None


async def get_redis() -> redis.Redis:
    global _pool
    if _pool is None:
        _pool = redis.from_url(settings.redis_url, decode_responses=True)
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
