"""DEPRECATED shim — Subject переехал в HomoNet.

Этот модуль остаётся как тонкая обёртка, чтобы старые импорты вида
``from backend.modules.cogiteka.services.subject_service import SubjectService``
продолжали работать. Новый канонический путь:

    from backend.modules.homonet.domains.subject.service import SubjectService

Удалить shim можно, когда все внутренние и внешние потребители переедут на
новый путь (отдельный PR в Этапе 2).
"""

from backend.modules.homonet.domains.subject.service import (  # noqa: F401
    PHONE_CLEAN_RE,
    SubjectService,
    build_display_name,
    normalize_email,
    normalize_phone,
)
