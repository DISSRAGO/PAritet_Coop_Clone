"""HomoNet root router.

Собирает low-level domain-роутеры (/subjects, /communities, /memberships,
/roles, /representations) и facade-роутер (/app/*).

Наполнение по этапам:
- PR A: скелет
- PR B: subject (legacy /api/subject/* + facade /api/app/subjects/*)
- PR C: миграция auth_user → person + personal subject
- PR D: Thanka.author_subject_id
- PR E (текущий): reclamation (сервис модерации V0.51)

Канон: 260424-Runnable-Slice1-V051-15 §6.1, OpenAPI §4-5, 260611-OpenAPI-REKL-V0.51-14.
"""

from fastapi import APIRouter

from backend.modules.homonet.domains.subject.router import (
    router as subject_router,
    subject_app_router,
)
from backend.modules.homonet.domains.reclamation.router import (
    reclamation_router,
    panel_router,
)
from backend.modules.homonet.domains.thanka.router import thanka_router

from backend.modules.homonet.domains.guarantor.router import router as guarantor_router

from backend.modules.homonet.domains.email_verification.email_router import router as email_verification_router

from backend.modules.homonet.domains.account.account_router import router as account_router


homonet_router = APIRouter(prefix="/api", tags=["homonet"])

homonet_router.include_router(subject_router)
homonet_router.include_router(subject_app_router)
homonet_router.include_router(reclamation_router)
homonet_router.include_router(panel_router)
homonet_router.include_router(thanka_router)
homonet_router.include_router(guarantor_router)
homonet_router.include_router(email_verification_router)
homonet_router.include_router(account_router)

@homonet_router.get("/homonet/health", tags=["health"])
def health() -> dict:
    """Heartbeat homonet-слоя."""
    return {"status": "ok", "module": "homonet"}
