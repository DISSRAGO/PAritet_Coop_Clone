"""HomoNet root router.

Собирает low-level domain-роутеры (/subjects, /communities, /memberships,
/roles, /representations) и facade-роутер (/app/*).

В этом скелетном PR роутер пустой — наполнение идёт следующими PR-ами:
- PR B: перенос /api/subject и /api/app/subjects из cogiteka
- PR C: миграция auth_user → person + personal subject
- PR D: Thanka.author_subject_id

Канон: 260424-Runnable-Slice1-V051-15 §6.1, OpenAPI §4-5.
"""

from fastapi import APIRouter

homonet_router = APIRouter(prefix="/api", tags=["homonet"])


@homonet_router.get("/homonet/health", tags=["health"])
def health() -> dict:
    """Heartbeat homonet-слоя.

    Отдельный от /api/health (cogiteka) — позволяет фронтам разных доменов
    проверять доступность ядра HomoNet независимо.
    """
    return {"status": "ok", "module": "homonet"}
