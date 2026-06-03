"""DEPRECATED shim — subject-роутеры переехали в HomoNet.

Этот модуль остаётся как тонкая обёртка, чтобы старые импорты вида
``from backend.modules.cogiteka.routers.subject import router, subject_app_router``
продолжали работать (фактически они больше нигде не используются, но shim
страхует от внешних потребителей).

Новый канонический путь:

    from backend.modules.homonet.domains.subject.router import (
        router, subject_app_router,
    )

Сам ``subject_router`` и ``subject_app_router`` теперь подключаются в
``backend/modules/homonet/router.py`` (homonet_router), а не в cogi_router.
"""

from backend.modules.homonet.domains.subject.router import (  # noqa: F401
    router,
    subject_app_router,
)
