from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import decode_token
from app.models.user import User

security = HTTPBearer(auto_error=False)


async def get_current_user_optional(
    creds: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User | None:
    if not creds:
        return None
    payload = decode_token(creds.credentials)
    if not payload or "sub" not in payload:
        return None
    result = await db.execute(select(User).where(User.email == payload["sub"]))
    return result.scalar_one_or_none()


async def get_current_user(user: Annotated[User | None, Depends(get_current_user_optional)]) -> User:
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No autenticado")
    return user
