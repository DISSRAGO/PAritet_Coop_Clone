from __future__ import annotations

from typing import Optional
from pydantic import BaseModel, Field


class GuarantorInfo(BaseModel):
    subjectId: str
    guarantorSubjectId: str
    guarantorDisplayName: Optional[str] = None
    status: str
    isDefault: bool = False
    requestedAt: Optional[str] = None
    confirmedAt: Optional[str] = None
    rejectedAt: Optional[str] = None
    revokedAt: Optional[str] = None


class GuaranteedSubjectItem(BaseModel):
    subjectId: str
    displayName: Optional[str] = None
    status: str
    isDefault: bool = False
    requestedAt: Optional[str] = None
    confirmedAt: Optional[str] = None


class RequestGuarantorRequest(BaseModel):
    actorSubjectId: str
    guarantorLoginOrEmail: str = Field(..., min_length=1)


class ConfirmGuarantorRequest(BaseModel):
    actorSubjectId: str
    subjectId: str


class RejectGuarantorRequest(BaseModel):
    actorSubjectId: str
    subjectId: str


class GuarantorResponse(BaseModel):
    data: Optional[GuarantorInfo] = None


class GuaranteedSubjectsResponse(BaseModel):
    data: list[GuaranteedSubjectItem]