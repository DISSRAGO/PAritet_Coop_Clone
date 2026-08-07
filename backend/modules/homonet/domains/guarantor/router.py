from __future__ import annotations

from fastapi import APIRouter, Query

from .schemas import (
    GuarantorResponse,
    GuaranteedSubjectsResponse,
    RequestGuarantorRequest,
    ConfirmGuarantorRequest,
    RejectGuarantorRequest,
)
from .service import GuarantorService

router = APIRouter(prefix="/profile/guarantor", tags=["profile-guarantor"])
svc = GuarantorService()


@router.get("", response_model=GuarantorResponse)
async def get_guarantor(subject_id: str = Query(...)):
    return await svc.get_guarantor(subject_id)


@router.post("/request", response_model=GuarantorResponse)
async def request_guarantor(payload: RequestGuarantorRequest):
    return await svc.request_guarantor(payload)


@router.post("/confirm", response_model=GuarantorResponse)
async def confirm_guarantor(payload: ConfirmGuarantorRequest):
    return await svc.confirm_guarantor(payload)


@router.post("/reject", response_model=GuarantorResponse)
async def reject_guarantor(payload: RejectGuarantorRequest):
    return await svc.reject_guarantor(payload)


@router.get("/subjects", response_model=GuaranteedSubjectsResponse)
async def list_guaranteed_subjects(guarantor_subject_id: str = Query(...)):
    return await svc.list_guaranteed_subjects(guarantor_subject_id)