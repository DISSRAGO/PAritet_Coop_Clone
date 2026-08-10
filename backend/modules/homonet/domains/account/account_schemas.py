from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field


class DeleteAccountRequest(BaseModel):
    actorUserId: str = Field(..., min_length=1, description="user_id владельца аккаунта")
    reason: Optional[str] = Field(None, max_length=500)


class DeleteAccountResponse(BaseModel):
    message: str
    userId: str
    subjectId: Optional[str] = None
    deletedAt: str
