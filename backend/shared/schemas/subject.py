"""DEPRECATED shim — subject-схемы переехали в HomoNet.

Этот модуль остаётся как тонкая обёртка, чтобы старые импорты вида
``from backend.shared.schemas.subject import ...`` продолжали работать.

Новый канонический путь:

    from backend.modules.homonet.domains.subject.schemas import (
        CreatePersonalSubjectRequest, ...
    )
"""

from backend.modules.homonet.domains.subject.schemas import (  # noqa: F401
    CreateCollectiveSubjectRequest,
    CreateCollectiveSubjectResponse,
    CreatePersonalSubjectRequest,
    CreatePersonalSubjectResponse,
    SubjectCardResponse,
)
