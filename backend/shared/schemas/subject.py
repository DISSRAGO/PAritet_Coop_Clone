from typing import Optional

from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# Subject schemas (HomoNet V0.51)
# ---------------------------------------------------------------------------
# Каноническая модель: subject связан ровно с одним источником субъектности —
# person | organization | community. subject_kind должен соответствовать FK.
# Источник: DDL V0.51 / Runnable Slice V0.51 / Use Case UC-03..UC-05.
# ---------------------------------------------------------------------------


# ----- Personal subject (UC-03) --------------------------------------------

class CreatePersonalSubjectRequest(BaseModel):
    """Заявка на создание personal subject через локальный фасад.

    Локальное отклонение от канона V0.51: вместо явного person_id мы
    используем authUserLogin как мост к таблице homonet.auth_user
    (HTTP-уровень аутентификации). Если у auth_user ещё нет person_id —
    сервис создаёт person автоматически.
    """

    authUserLogin: str = Field(..., min_length=1)
    surname: str = Field(..., min_length=1)
    firstName: str = Field(..., min_length=1)
    secondName: Optional[str] = None


class CreatePersonalSubjectResponse(BaseModel):
    subjectId: str
    message: str


# ----- Collective subject (UC-05) ------------------------------------------

class CreateCollectiveSubjectRequest(BaseModel):
    """Заявка на создание collective subject для уже существующей community."""

    communityId: str = Field(..., min_length=1)
    displayName: Optional[str] = None  # если не задан — берётся community.name


class CreateCollectiveSubjectResponse(BaseModel):
    subjectId: str
    message: str


# ----- Subject card (UC + Runnable Slice §5.1) -----------------------------

class SubjectCardResponse(BaseModel):
    """Карточка subject для любого subject_kind.

    Возвращает идентификаторы источника субъектности (ровно один из
    personId / organizationId / communityId не None — гарантируется
    CHECK-ограничением в БД).
    """

    id: str
    subjectKind: str  # 'personal' | 'organizational' | 'collective'
    displayName: str
    status: str

    # источники субъектности (ровно один заполнен)
    personId: Optional[str] = None
    organizationId: Optional[str] = None
    communityId: Optional[str] = None

    # удобный кеш для UI: где это уместно
    authUserLogin: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
