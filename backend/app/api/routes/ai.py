from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.models.user import User
from app.schemas import AIAnalyzeRequest, ScrapeRequest
from app.services.ai_rag import analyze_threat
from app.services.scraping import scrape_dynamic, scrape_static

router = APIRouter(tags=["ai", "scrape"])


@router.post("/ai/analyze")
async def ai_analyze(body: AIAnalyzeRequest, _user: Annotated[User, Depends(get_current_user)]):
    return await analyze_threat(body.context, body.question)


@router.post("/scrape")
async def scrape_url(body: ScrapeRequest, _user: Annotated[User, Depends(get_current_user)]):
    if body.dynamic:
        return await scrape_dynamic(body.url)
    return await scrape_static(body.url)
