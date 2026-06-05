from typing import List, Optional

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


# ---------------------------------------------------------------------------
# Subject Resolver — кросс-доменные выборки по subject_id (Stage 3, PR 1)
# ---------------------------------------------------------------------------
# subject_id — единая точка входа для cross-фронтовых выборок: любой фронт
# (cogiteka, будущий магазин, кошелёк) дёргает один и тот же endpoint и
# получает однородный список объектов владельца по нужному домену.
# ---------------------------------------------------------------------------


class SubjectThankaItem(BaseModel):
    """Тханка во владении subject (через author.subject_id)."""

    thankaId: str
    title: str
    status: str
    thankaTypeId: Optional[str] = None
    authorId: Optional[str] = None
    createdAt: Optional[str] = None


class SubjectListingItem(BaseModel):
    """Listing, где subject — продавец."""

    listingId: str
    assetId: str
    price: Optional[float] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    status: str
    createdAt: Optional[str] = None


class SubjectDealItem(BaseModel):
    """Deal, где subject — поставщик или покупатель."""

    dealId: str
    listingId: str
    role: str  # 'supplier' | 'buyer'
    counterpartySubjectId: str
    quantity: float
    price: float
    dealSum: Optional[float] = None
    status: str
    dealDate: Optional[str] = None


class SubjectDecisionItem(BaseModel):
    """Decision, предложенное subject'ом."""

    decisionId: str
    communityId: str
    decisionType: str
    title: str
    status: str
    proposedAt: Optional[str] = None


class SubjectContributionItem(BaseModel):
    """Contribution subject'а в процесс."""

    contributionId: str
    processId: str
    contributionType: str
    description: str
    recordedAt: Optional[str] = None


class SubjectAccountItem(BaseModel):
    """Счёт subject'а (homonet.account.owner_subject_id)."""

    accountId: str
    currency: str
    balance: float
    status: str
    accountType: Optional[str] = None


class PaginatedResponse(BaseModel):
    """Общий враппер для пагинированных списков."""

    total: int
    limit: int
    offset: int


class SubjectThankasResponse(PaginatedResponse):
    items: List[SubjectThankaItem]


class SubjectListingsResponse(PaginatedResponse):
    items: List[SubjectListingItem]


class SubjectDealsResponse(PaginatedResponse):
    items: List[SubjectDealItem]


class SubjectDecisionsResponse(PaginatedResponse):
    items: List[SubjectDecisionItem]


class SubjectContributionsResponse(PaginatedResponse):
    items: List[SubjectContributionItem]


class SubjectAccountsResponse(BaseModel):
    """Список аккаунтов (обычно <=несколько), без пагинации."""

    items: List[SubjectAccountItem]


class SubjectSummaryResponse(BaseModel):
    """Агрегированная сводка по subject — счётчики по каждому домену.

    Используется как «дашборд» владельца: один запрос → понимание масштаба.
    """

    subjectId: str
    displayName: str
    subjectKind: str
    thankas: int
    listings: int
    dealsAsSupplier: int
    dealsAsBuyer: int
    decisionsProposed: int
    contributions: int
    accounts: int


# ---------------------------------------------------------------------------
# Unified objects endpoint (Stage 3, PR 2)
# ---------------------------------------------------------------------------
# Единая ручка GET /app/subjects/{id}/objects?domain=thanka,listing&... .
# Возвращает однородный список объектов разных доменов в одном ответе с
# дискриминатором `domain`. Используется фронтами, которым нужна смешанная
# лента владельца (например, профиль subject с разделом «всё, что я сделал»).
# ---------------------------------------------------------------------------


class SubjectObjectItem(BaseModel):
    """Унифицированный объект subject любого домена.

    Дискриминатор `domain` указывает тип. Полезная нагрузка лежит в `payload`
    в виде словаря — это позволяет фронту разбирать item по domain без
    необходимости тянуть отдельные DTO на каждый случай (TypeScript у фронта
    типизирует union по domain).
    """

    domain: str  # 'thanka' | 'listing' | 'deal' | 'decision' | 'contribution' | 'account'
    objectId: str
    title: str
    status: Optional[str] = None
    sortKey: Optional[str] = None  # ISO datetime для сквозной сортировки
    payload: dict


class SubjectObjectsResponse(BaseModel):
    """Ответ единой ручки /objects: total + per-domain breakdown + items.

    Поле `totals` показывает, сколько объектов в каждом запрошенном домене —
    это удобно для бейджей-счётчиков в UI без дополнительных запросов.
    """

    subjectId: str
    limit: int
    offset: int
    total: int
    totals: dict  # {'thanka': 12, 'listing': 3, ...}
    items: List[SubjectObjectItem]
