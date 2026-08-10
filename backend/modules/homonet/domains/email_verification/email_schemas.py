from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, EmailStr


class RequestEmailCode(BaseModel):
    """Запрос на отправку кода на почту текущего субъекта."""
    actorSubjectId: str


class EmailCodeRequestResponse(BaseModel):
    """Ответ на запрос кода: что, кому и до какого времени отправлено."""
    subjectId: str
    status: Literal["pending"]
    email: EmailStr
    sentAt: datetime
    expiresAt: datetime


class ConfirmEmailCodeRequest(BaseModel):
    """Запрос на подтверждение кода."""
    actorSubjectId: str
    code: str


class ConfirmEmailCodeResponse(BaseModel):
    """Ответ на успешное подтверждение кода."""
    subjectId: str
    status: Literal["verified"]
    email: EmailStr
    verifiedAt: datetime


class EmailVerificationMeta(BaseModel):
    """Метаданные (можно расширять по мере надобности)."""
    attempts: int
    maxAttempts: int
    ttlMinutes: int
    resendCooldownMinutes: int