from __future__ import annotations

from fastapi import APIRouter

from backend.modules.homonet.domains.account.account_schemas import (
    DeleteAccountRequest,
    DeleteAccountResponse,
)
from backend.modules.homonet.domains.account.account_service import AccountService

router = APIRouter(prefix="/profile/account", tags=["account"])

svc = AccountService()


@router.post("/delete", response_model=DeleteAccountResponse)
async def delete_account(payload: DeleteAccountRequest):
    return await svc.delete_account(payload)
