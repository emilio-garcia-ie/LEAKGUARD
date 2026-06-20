import httpx

from app.core.config import settings

UPSTREAM = "https://leakosintapi.com/"


async def query_osint(request: str, limit: int = 500, lang: str = "es") -> dict:
    if not settings.osint_token:
        raise ValueError("OSINT_TOKEN no configurado en backend/.env")

    safe_limit = min(10000, max(10, limit))

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            UPSTREAM,
            json={
                "token": settings.osint_token,
                "request": request.strip(),
                "limit": safe_limit,
                "lang": lang,
            },
        )
        response.raise_for_status()
        return response.json()
