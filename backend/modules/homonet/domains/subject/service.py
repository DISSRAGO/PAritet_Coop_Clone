from __future__ import annotations

import re
from typing import Optional

from fastapi import HTTPException, status

from backend.modules.homonet.domains.subject.schemas import (
    CreateCollectiveSubjectRequest,
    CreateCollectiveSubjectResponse,
    CreatePersonalSubjectRequest,
    CreatePersonalSubjectResponse,
    SubjectAccountItem,
    SubjectAccountsResponse,
    SubjectCardResponse,
    SubjectContributionItem,
    SubjectContributionsResponse,
    SubjectDealItem,
    SubjectDealsResponse,
    SubjectDecisionItem,
    SubjectDecisionsResponse,
    SubjectListingItem,
    SubjectListingsResponse,
    SubjectObjectItem,
    SubjectObjectsResponse,
    SubjectSummaryResponse,
    SubjectThankaItem,
    SubjectThankasResponse,
)
from backend.shared.db import get_conn

PHONE_CLEAN_RE = re.compile(r"[^\d+]")


def normalize_email(email: Optional[str]) -> Optional[str]:
    if email is None:
        return None
    value = email.strip().lower()
    return value or None


def normalize_phone(phone: Optional[str]) -> Optional[str]:
    if phone is None:
        return None

    value = PHONE_CLEAN_RE.sub("", phone.strip())
    if not value:
        return None

    if value.startswith("8") and len(value) == 11:
        value = "+7" + value[1:]
    elif value.startswith("7") and len(value) == 11:
        value = "+" + value

    return value or None


def build_display_name(surname: str, first_name: str, second_name: Optional[str]) -> str:
    parts = [surname.strip(), first_name.strip()]
    if second_name and second_name.strip():
        parts.append(second_name.strip())
    return " ".join(parts)


class SubjectService:
    """Сервис subject-слоя (HomoNet V0.51).

    Владеет таблицами: person, person_profile, subject.
    Канонические проверки:
      * subject имеет ровно один источник (person/organization/community);
      * subject_kind соответствует заполненному FK;
      * нельзя создать второй subject для того же person/community/organization
        (на уровне БД — UNIQUE на FK, на уровне сервиса — pre-check + 409).
    """

    # ---------- helpers --------------------------------------------------

    # Пагинация — жёсткие рамки. limit=0 и limit>200 обрезаем, чтобы
    # никто случайным LIMIT 1_000_000 не положил базу.
    _MAX_PAGE_SIZE = 200
    _DEFAULT_PAGE_SIZE = 50

    def _clamp_paging(self, limit: int, offset: int) -> tuple[int, int]:
        lim = limit if limit and limit > 0 else self._DEFAULT_PAGE_SIZE
        lim = min(lim, self._MAX_PAGE_SIZE)
        off = max(offset, 0)
        return lim, off

    async def _fetch_one(self, query: str, *args):
        async with get_conn() as conn:
            async with conn.cursor() as cur:
                await cur.execute(query, args)
                return await cur.fetchone()

    async def _fetch_all(self, query: str, *args) -> list[dict]:
        async with get_conn() as conn:
            async with conn.cursor() as cur:
                await cur.execute(query, args)
                return await cur.fetchall()

    async def _ensure_subject_exists(self, subject_id: str) -> dict:
        """Гарантирует что subject существует. Иначе — 404.

        Используется всеми resolver-методами: без этого проверочного
        хопа фронт бы получал 200 с пустым списком на случайно вымышленный
        UUID — и никогда не узнал бы, что опечатался.
        """
        row = await self._fetch_one(
            """
            SELECT subject_id, display_name, subject_kind
            FROM homonet.subject
            WHERE subject_id = %s
            """,
            subject_id,
        )
        if not row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Subject not found",
            )
        return row

    # ---------- UC-03: create personal subject ---------------------------

    async def create_personal_subject(
        self,
        payload: CreatePersonalSubjectRequest,
    ) -> CreatePersonalSubjectResponse:
        auth_user = await self._fetch_one(
            """
            SELECT
                user_id,
                person_id,
                subject_id,
                email,
                phone,
                is_verified,
                is_active,
                login
            FROM homonet.auth_user
            WHERE login = %s
            """,
            payload.authUserLogin.strip(),
        )

        if not auth_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Auth user not found",
            )

        if not auth_user["is_active"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Auth user is inactive",
            )

        if not auth_user["is_verified"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Auth user is not verified",
            )

        if auth_user["subject_id"] is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Subject is already linked to this auth user",
            )

        surname = payload.surname.strip()
        first_name = payload.firstName.strip()
        second_name = (payload.secondName or "").strip()
        display_name = build_display_name(surname, first_name, second_name)

        async with get_conn() as conn:
            async with conn.cursor() as cur:
                person_id = auth_user["person_id"]

                if person_id is None:
                    await cur.execute(
                        """
                        INSERT INTO homonet.person
                            (display_name, status)
                        VALUES
                            (%s, 'draft')
                        RETURNING person_id
                        """,
                        (display_name,),
                    )
                    person_row = await cur.fetchone()
                    person_id = person_row["person_id"]

                    await cur.execute(
                        """
                        UPDATE homonet.auth_user
                        SET
                            person_id = %s,
                            updated_at = now()
                        WHERE user_id = %s
                        """,
                        (person_id, auth_user["user_id"]),
                    )
                else:
                    # дополнительная защита: если у person уже есть subject —
                    # вернём 409 заранее, не дожидаясь UNIQUE violation
                    existing = await self._fetch_one(
                        "SELECT subject_id FROM homonet.subject WHERE person_id = %s",
                        person_id,
                    )
                    if existing:
                        raise HTTPException(
                            status_code=status.HTTP_409_CONFLICT,
                            detail="Personal subject already exists for this person",
                        )

                await cur.execute(
                    """
                    INSERT INTO homonet.subject
                        (subject_kind, person_id, display_name, status)
                    VALUES
                        ('personal', %s, %s, 'active')
                    RETURNING subject_id
                    """,
                    (person_id, display_name),
                )
                subject_row = await cur.fetchone()
                subject_id = subject_row["subject_id"]

                await cur.execute(
                    """
                    UPDATE homonet.auth_user
                    SET
                        subject_id = %s,
                        updated_at = now()
                    WHERE user_id = %s
                    """,
                    (subject_id, auth_user["user_id"]),
                )

        return CreatePersonalSubjectResponse(
            subjectId=str(subject_id),
            message="Personal subject created",
        )

    # ---------- UC-05: create collective subject -------------------------

    async def create_collective_subject(
        self,
        payload: CreateCollectiveSubjectRequest,
    ) -> CreateCollectiveSubjectResponse:
        community = await self._fetch_one(
            """
            SELECT community_id, name, status
            FROM homonet.community
            WHERE community_id = %s
            """,
            payload.communityId.strip(),
        )
        if not community:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Community not found",
            )

        existing = await self._fetch_one(
            "SELECT subject_id FROM homonet.subject WHERE community_id = %s",
            community["community_id"],
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Collective subject already exists for this community",
            )

        display_name = (payload.displayName or community["name"]).strip()
        if not display_name:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="displayName is empty",
            )

        async with get_conn() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    """
                    INSERT INTO homonet.subject
                        (subject_kind, community_id, display_name, status)
                    VALUES
                        ('collective', %s, %s, 'active')
                    RETURNING subject_id
                    """,
                    (community["community_id"], display_name),
                )
                row = await cur.fetchone()
                subject_id = row["subject_id"]

        return CreateCollectiveSubjectResponse(
            subjectId=str(subject_id),
            message="Collective subject created",
        )

    # ---------- get subject card -----------------------------------------

    async def get_subject_card(self, subject_id: str) -> SubjectCardResponse:
        row = await self._fetch_one(
            """
            SELECT
                s.subject_id,
                s.subject_kind,
                s.display_name,
                s.status,
                s.person_id,
                s.organization_id,
                s.community_id,
                au.login   AS auth_user_login,
                au.email   AS auth_user_email,
                au.phone   AS auth_user_phone
            FROM homonet.subject s
            LEFT JOIN homonet.auth_user au
                ON au.subject_id = s.subject_id
            WHERE s.subject_id = %s
            """,
            subject_id,
        )

        if not row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Subject not found",
            )

        return SubjectCardResponse(
            id=str(row["subject_id"]),
            subjectKind=str(row["subject_kind"]),
            displayName=row["display_name"],
            status=str(row["status"]),
            personId=str(row["person_id"]) if row["person_id"] else None,
            organizationId=str(row["organization_id"]) if row["organization_id"] else None,
            communityId=str(row["community_id"]) if row["community_id"] else None,
            authUserLogin=row["auth_user_login"],
            email=row["auth_user_email"],
            phone=row["auth_user_phone"],
        )

    # ---------- Resolver: кросс-доменные выборки (Stage 3 / PR 1) ----------
    #
    # Каждый метод обязан вызывать _ensure_subject_exists() первым действием,
    # чтобы 404 на несуществующий UUID был единообразным — иначе фронт
    # получает 200/[] и не видит опечатку.

    async def list_thankas(
        self,
        subject_id: str,
        *,
        limit: int = 50,
        offset: int = 0,
        status_filter: Optional[str] = None,
    ) -> SubjectThankasResponse:
        """Тханки, владелец которых — subject (через author.subject_id).

        Один субъект может иметь несколько author-записей (это разные
        аватары/роли), но владение контентом всё равно схлопывается к subject —
        их все выводим одним списком.
        """
        await self._ensure_subject_exists(subject_id)
        lim, off = self._clamp_paging(limit, offset)

        where_status = ""
        params: list = [subject_id]
        if status_filter:
            where_status = "AND t.status = %s"
            params.append(status_filter)

        total_row = await self._fetch_one(
            f"""
            SELECT COUNT(*) AS cnt
            FROM homonet.thanka t
            JOIN homonet.author a ON a.author_id = t.author_id
            WHERE a.subject_id = %s {where_status}
            """,
            *params,
        )
        total = int(total_row["cnt"]) if total_row else 0

        rows = await self._fetch_all(
            f"""
            SELECT
                t.thanka_id::text          AS thanka_id,
                t.title                    AS title,
                t.status::text             AS status,
                t.thanka_type_id::text     AS thanka_type_id,
                t.author_id::text          AS author_id,
                t.created_at               AS created_at
            FROM homonet.thanka t
            JOIN homonet.author a ON a.author_id = t.author_id
            WHERE a.subject_id = %s {where_status}
            ORDER BY t.created_at DESC
            LIMIT %s OFFSET %s
            """,
            *params,
            lim,
            off,
        )

        items = [
            SubjectThankaItem(
                thankaId=r["thanka_id"],
                title=r["title"],
                status=r["status"],
                thankaTypeId=r["thanka_type_id"],
                authorId=r["author_id"],
                createdAt=r["created_at"].isoformat() if r["created_at"] else None,
            )
            for r in rows
        ]
        return SubjectThankasResponse(total=total, limit=lim, offset=off, items=items)

    async def list_listings(
        self,
        subject_id: str,
        *,
        limit: int = 50,
        offset: int = 0,
        status_filter: Optional[str] = None,
    ) -> SubjectListingsResponse:
        """Listing'и, где subject — продавец.

        По DDL listing имеет ровно один из (seller_subject_id, seller_community_id);
        эдесь нас интересует вариант subject — community-owned listing'и будут
        выводиться через collective subject этого community.
        """
        await self._ensure_subject_exists(subject_id)
        lim, off = self._clamp_paging(limit, offset)

        where_status = ""
        params: list = [subject_id]
        if status_filter:
            where_status = "AND status = %s"
            params.append(status_filter)

        total_row = await self._fetch_one(
            f"""
            SELECT COUNT(*) AS cnt
            FROM homonet.listing
            WHERE seller_subject_id = %s {where_status}
            """,
            *params,
        )
        total = int(total_row["cnt"]) if total_row else 0

        rows = await self._fetch_all(
            f"""
            SELECT
                listing_id::text   AS listing_id,
                asset_id::text     AS asset_id,
                price,
                quantity,
                unit,
                status::text       AS status,
                created_at
            FROM homonet.listing
            WHERE seller_subject_id = %s {where_status}
            ORDER BY created_at DESC
            LIMIT %s OFFSET %s
            """,
            *params,
            lim,
            off,
        )

        items = [
            SubjectListingItem(
                listingId=r["listing_id"],
                assetId=r["asset_id"],
                price=float(r["price"]) if r["price"] is not None else None,
                quantity=float(r["quantity"]) if r["quantity"] is not None else None,
                unit=r["unit"],
                status=r["status"],
                createdAt=r["created_at"].isoformat() if r["created_at"] else None,
            )
            for r in rows
        ]
        return SubjectListingsResponse(total=total, limit=lim, offset=off, items=items)

    async def list_deals(
        self,
        subject_id: str,
        *,
        limit: int = 50,
        offset: int = 0,
        role: Optional[str] = None,  # 'supplier' | 'buyer' | None (обе роли)
        status_filter: Optional[str] = None,
    ) -> SubjectDealsResponse:
        """Deal'ы, где subject — supplier или buyer.

        По DDL supplier_subject_id <> buyer_subject_id (CHECK), так что UNION
        без дубликатов. role-поле в ответе говорит фронту, как именно
        subject участвовал в конкретной сделке — без этого UI бы пришлось
        равнять свой subject_id с обоими полями.
        """
        await self._ensure_subject_exists(subject_id)
        lim, off = self._clamp_paging(limit, offset)

        # WHERE-сборка по role: без role — OR, иначе строго по одной стороне.
        role_norm = (role or "").lower().strip() or None
        if role_norm == "supplier":
            role_where = "supplier_subject_id = %s"
            role_params = [subject_id]
        elif role_norm == "buyer":
            role_where = "buyer_subject_id = %s"
            role_params = [subject_id]
        else:
            role_where = "(supplier_subject_id = %s OR buyer_subject_id = %s)"
            role_params = [subject_id, subject_id]

        where_status = ""
        status_params: list = []
        if status_filter:
            where_status = "AND status = %s"
            status_params = [status_filter]

        total_row = await self._fetch_one(
            f"""
            SELECT COUNT(*) AS cnt
            FROM homonet.deal
            WHERE {role_where} {where_status}
            """,
            *role_params,
            *status_params,
        )
        total = int(total_row["cnt"]) if total_row else 0

        rows = await self._fetch_all(
            f"""
            SELECT
                deal_id::text                 AS deal_id,
                listing_id::text              AS listing_id,
                supplier_subject_id::text     AS supplier_subject_id,
                buyer_subject_id::text        AS buyer_subject_id,
                quantity,
                price,
                deal_sum,
                status::text                  AS status,
                deal_date
            FROM homonet.deal
            WHERE {role_where} {where_status}
            ORDER BY deal_date DESC
            LIMIT %s OFFSET %s
            """,
            *role_params,
            *status_params,
            lim,
            off,
        )

        items: list[SubjectDealItem] = []
        for r in rows:
            is_supplier = r["supplier_subject_id"] == subject_id
            item_role = "supplier" if is_supplier else "buyer"
            counterparty = (
                r["buyer_subject_id"] if is_supplier else r["supplier_subject_id"]
            )
            items.append(
                SubjectDealItem(
                    dealId=r["deal_id"],
                    listingId=r["listing_id"],
                    role=item_role,
                    counterpartySubjectId=counterparty,
                    quantity=float(r["quantity"]),
                    price=float(r["price"]),
                    dealSum=float(r["deal_sum"]) if r["deal_sum"] is not None else None,
                    status=r["status"],
                    dealDate=r["deal_date"].isoformat() if r["deal_date"] else None,
                )
            )
        return SubjectDealsResponse(total=total, limit=lim, offset=off, items=items)

    async def list_decisions(
        self,
        subject_id: str,
        *,
        limit: int = 50,
        offset: int = 0,
        status_filter: Optional[str] = None,
    ) -> SubjectDecisionsResponse:
        """Decision'ы, предложенные subject'ом (proposed_by_subject_id)."""
        await self._ensure_subject_exists(subject_id)
        lim, off = self._clamp_paging(limit, offset)

        where_status = ""
        params: list = [subject_id]
        if status_filter:
            where_status = "AND status = %s"
            params.append(status_filter)

        total_row = await self._fetch_one(
            f"""
            SELECT COUNT(*) AS cnt
            FROM homonet.decision
            WHERE proposed_by_subject_id = %s {where_status}
            """,
            *params,
        )
        total = int(total_row["cnt"]) if total_row else 0

        rows = await self._fetch_all(
            f"""
            SELECT
                decision_id::text  AS decision_id,
                community_id::text AS community_id,
                decision_type,
                title,
                status::text       AS status,
                proposed_at
            FROM homonet.decision
            WHERE proposed_by_subject_id = %s {where_status}
            ORDER BY proposed_at DESC
            LIMIT %s OFFSET %s
            """,
            *params,
            lim,
            off,
        )

        items = [
            SubjectDecisionItem(
                decisionId=r["decision_id"],
                communityId=r["community_id"],
                decisionType=r["decision_type"],
                title=r["title"],
                status=r["status"],
                proposedAt=r["proposed_at"].isoformat() if r["proposed_at"] else None,
            )
            for r in rows
        ]
        return SubjectDecisionsResponse(total=total, limit=lim, offset=off, items=items)

    async def list_contributions(
        self,
        subject_id: str,
        *,
        limit: int = 50,
        offset: int = 0,
    ) -> SubjectContributionsResponse:
        """Contribution'ы subject'а (contributor_subject_id)."""
        await self._ensure_subject_exists(subject_id)
        lim, off = self._clamp_paging(limit, offset)

        total_row = await self._fetch_one(
            """
            SELECT COUNT(*) AS cnt
            FROM homonet.contribution
            WHERE contributor_subject_id = %s
            """,
            subject_id,
        )
        total = int(total_row["cnt"]) if total_row else 0

        rows = await self._fetch_all(
            """
            SELECT
                contribution_id::text  AS contribution_id,
                process_id::text       AS process_id,
                contribution_type::text AS contribution_type,
                description,
                recorded_at
            FROM homonet.contribution
            WHERE contributor_subject_id = %s
            ORDER BY recorded_at DESC
            LIMIT %s OFFSET %s
            """,
            subject_id,
            lim,
            off,
        )

        items = [
            SubjectContributionItem(
                contributionId=r["contribution_id"],
                processId=r["process_id"],
                contributionType=r["contribution_type"],
                description=r["description"],
                recordedAt=r["recorded_at"].isoformat() if r["recorded_at"] else None,
            )
            for r in rows
        ]
        return SubjectContributionsResponse(total=total, limit=lim, offset=off, items=items)

    async def list_accounts(self, subject_id: str) -> SubjectAccountsResponse:
        """Счета subject'а (homonet.account.owner_subject_id).

        Без пагинации — обычно у subject единицы счетов.
        """
        await self._ensure_subject_exists(subject_id)

        rows = await self._fetch_all(
            """
            SELECT
                account_id::text   AS account_id,
                currency,
                balance,
                status::text       AS status,
                account_type
            FROM homonet.account
            WHERE owner_subject_id = %s
            ORDER BY currency
            """,
            subject_id,
        )

        items = [
            SubjectAccountItem(
                accountId=r["account_id"],
                currency=r["currency"],
                balance=float(r["balance"]),
                status=r["status"],
                accountType=r["account_type"],
            )
            for r in rows
        ]
        return SubjectAccountsResponse(items=items)

    async def get_summary(self, subject_id: str) -> SubjectSummaryResponse:
        """Дашборд-ответ: по одному запросу общие счётчики по всем доменам.

        Делаем одним роунд-трипом в БД через субзапросы — это дешевле чем 7 отдельных
        SELECT'ов и проще в обработке ошибок.
        """
        subj = await self._ensure_subject_exists(subject_id)

        # 7 позиционных %s — по одному на каждый субзапрос. _fetch_one передаёт
        # параметры туплом в cur.execute, так что названные параметры здесь не подходят.
        row = await self._fetch_one(
            """
            SELECT
                (SELECT COUNT(*) FROM homonet.thanka t
                   JOIN homonet.author a ON a.author_id = t.author_id
                  WHERE a.subject_id = %s)                              AS thankas,
                (SELECT COUNT(*) FROM homonet.listing
                  WHERE seller_subject_id = %s)                         AS listings,
                (SELECT COUNT(*) FROM homonet.deal
                  WHERE supplier_subject_id = %s)                       AS deals_as_supplier,
                (SELECT COUNT(*) FROM homonet.deal
                  WHERE buyer_subject_id = %s)                          AS deals_as_buyer,
                (SELECT COUNT(*) FROM homonet.decision
                  WHERE proposed_by_subject_id = %s)                    AS decisions_proposed,
                (SELECT COUNT(*) FROM homonet.contribution
                  WHERE contributor_subject_id = %s)                    AS contributions,
                (SELECT COUNT(*) FROM homonet.account
                  WHERE owner_subject_id = %s)                          AS accounts
            """,
            subject_id,
            subject_id,
            subject_id,
            subject_id,
            subject_id,
            subject_id,
            subject_id,
        )

        return SubjectSummaryResponse(
            subjectId=str(subj["subject_id"]),
            displayName=subj["display_name"],
            subjectKind=str(subj["subject_kind"]),
            thankas=int(row["thankas"]),
            listings=int(row["listings"]),
            dealsAsSupplier=int(row["deals_as_supplier"]),
            dealsAsBuyer=int(row["deals_as_buyer"]),
            decisionsProposed=int(row["decisions_proposed"]),
            contributions=int(row["contributions"]),
            accounts=int(row["accounts"]),
        )

    # -----------------------------------------------------------------
    # Unified objects endpoint (Stage 3, PR 2)
    # -----------------------------------------------------------------
    # Один endpoint /objects?domain=thanka,listing,...&limit&offset с
    # унифицированным ответом. Под капотом — те же выборки из БД, но
    # отображённые в общий формат SubjectObjectItem с дискриминатором.
    # -----------------------------------------------------------------

    # Все поддерживаемые домены (в порядке отображения по умолчанию).
    SUPPORTED_DOMAINS = (
        "thanka",
        "listing",
        "deal",
        "decision",
        "contribution",
        "account",
    )

    @staticmethod
    def _parse_domains(domain_param: Optional[str]) -> list[str]:
        """Парсит query-параметр ?domain=thanka,listing.

        - Пустая/None строка → все поддерживаемые домены.
        - Неизвестные значения → 400 (явная ошибка лучше тихого пропуска).
        - Дубликаты убираются с сохранением порядка.
        """
        if not domain_param:
            return list(SubjectService.SUPPORTED_DOMAINS)

        raw = [d.strip().lower() for d in domain_param.split(",") if d.strip()]
        if not raw:
            return list(SubjectService.SUPPORTED_DOMAINS)

        seen: set[str] = set()
        result: list[str] = []
        for d in raw:
            if d in seen:
                continue
            if d not in SubjectService.SUPPORTED_DOMAINS:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"unknown domain '{d}'. Supported: {', '.join(SubjectService.SUPPORTED_DOMAINS)}",
                )
            seen.add(d)
            result.append(d)
        return result

    async def list_objects(
        self,
        subject_id: str,
        domain_param: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> SubjectObjectsResponse:
        """Единая ручка cross-доменной выборки.

        Стратегия:
        1. Парсим список запрошенных доменов.
        2. Для каждого домена считаем COUNT (для `totals`).
        3. Тянем по каждому домену top-N последних объектов (N = limit) и
           кладём в общий список, сортируем DESC по `sortKey`.
        4. Применяем offset/limit к объединённому списку.

        Такой подход даёт честный смешанный feed без N+1: при K доменах
        получается K COUNT'ов + K SELECT'ов с лимитом limit, что приемлемо
        для типичного limit=50 и 6 доменов. Если в будущем понадобится
        строгая глобальная пагинация — заменим на UNION ALL с одним сортом.
        """
        await self._ensure_subject_exists(subject_id)
        limit, offset = self._clamp_paging(limit, offset)
        domains = self._parse_domains(domain_param)

        totals: dict[str, int] = {}
        all_items: list[SubjectObjectItem] = []

        # --- thanka --------------------------------------------------
        if "thanka" in domains:
            cnt = await self._fetch_one(
                """
                SELECT COUNT(*) AS c
                  FROM homonet.thanka t
                  JOIN homonet.author a ON a.author_id = t.author_id
                 WHERE a.subject_id = %s
                """,
                subject_id,
            )
            totals["thanka"] = int(cnt["c"])

            rows = await self._fetch_all(
                """
                SELECT
                    t.thanka_id::text   AS thanka_id,
                    t.title             AS title,
                    t.status::text      AS status,
                    t.thanka_type_id::text AS thanka_type_id,
                    t.author_id::text   AS author_id,
                    t.created_at        AS created_at
                FROM homonet.thanka t
                JOIN homonet.author a ON a.author_id = t.author_id
                WHERE a.subject_id = %s
                ORDER BY t.created_at DESC NULLS LAST, t.thanka_id DESC
                LIMIT %s
                """,
                subject_id,
                limit,
            )
            for r in rows:
                all_items.append(SubjectObjectItem(
                    domain="thanka",
                    objectId=r["thanka_id"],
                    title=r["title"] or "",
                    status=r["status"],
                    sortKey=str(r["created_at"]) if r["created_at"] else None,
                    payload={
                        "thankaTypeId": r["thanka_type_id"],
                        "authorId": r["author_id"],
                        "createdAt": str(r["created_at"]) if r["created_at"] else None,
                    },
                ))

        # --- listing -------------------------------------------------
        if "listing" in domains:
            cnt = await self._fetch_one(
                "SELECT COUNT(*) AS c FROM homonet.listing WHERE seller_subject_id = %s",
                subject_id,
            )
            totals["listing"] = int(cnt["c"])

            rows = await self._fetch_all(
                """
                SELECT
                    listing_id::text   AS listing_id,
                    asset_id::text     AS asset_id,
                    price              AS price,
                    quantity           AS quantity,
                    unit::text         AS unit,
                    status::text       AS status,
                    created_at         AS created_at
                FROM homonet.listing
                WHERE seller_subject_id = %s
                ORDER BY created_at DESC NULLS LAST, listing_id DESC
                LIMIT %s
                """,
                subject_id,
                limit,
            )
            for r in rows:
                all_items.append(SubjectObjectItem(
                    domain="listing",
                    objectId=r["listing_id"],
                    title=f"Listing {r['asset_id']}",
                    status=r["status"],
                    sortKey=str(r["created_at"]) if r["created_at"] else None,
                    payload={
                        "assetId": r["asset_id"],
                        "price": float(r["price"]) if r["price"] is not None else None,
                        "quantity": float(r["quantity"]) if r["quantity"] is not None else None,
                        "unit": r["unit"],
                        "createdAt": str(r["created_at"]) if r["created_at"] else None,
                    },
                ))

        # --- deal ----------------------------------------------------
        if "deal" in domains:
            cnt = await self._fetch_one(
                """
                SELECT COUNT(*) AS c
                  FROM homonet.deal
                 WHERE supplier_subject_id = %s OR buyer_subject_id = %s
                """,
                subject_id,
                subject_id,
            )
            totals["deal"] = int(cnt["c"])

            rows = await self._fetch_all(
                """
                SELECT
                    deal_id::text                                          AS deal_id,
                    listing_id::text                                       AS listing_id,
                    CASE WHEN supplier_subject_id = %s THEN 'supplier'
                         ELSE 'buyer' END                                  AS role,
                    CASE WHEN supplier_subject_id = %s THEN buyer_subject_id::text
                         ELSE supplier_subject_id::text END                AS counterparty_subject_id,
                    quantity                                               AS quantity,
                    price                                                  AS price,
                    deal_sum                                               AS deal_sum,
                    status::text                                           AS status,
                    deal_date                                              AS deal_date
                FROM homonet.deal
                WHERE supplier_subject_id = %s OR buyer_subject_id = %s
                ORDER BY deal_date DESC NULLS LAST, deal_id DESC
                LIMIT %s
                """,
                subject_id,
                subject_id,
                subject_id,
                subject_id,
                limit,
            )
            for r in rows:
                all_items.append(SubjectObjectItem(
                    domain="deal",
                    objectId=r["deal_id"],
                    title=f"Deal ({r['role']})",
                    status=r["status"],
                    sortKey=str(r["deal_date"]) if r["deal_date"] else None,
                    payload={
                        "listingId": r["listing_id"],
                        "role": r["role"],
                        "counterpartySubjectId": r["counterparty_subject_id"],
                        "quantity": float(r["quantity"]),
                        "price": float(r["price"]),
                        "dealSum": float(r["deal_sum"]) if r["deal_sum"] is not None else None,
                        "dealDate": str(r["deal_date"]) if r["deal_date"] else None,
                    },
                ))

        # --- decision ------------------------------------------------
        if "decision" in domains:
            cnt = await self._fetch_one(
                "SELECT COUNT(*) AS c FROM homonet.decision WHERE proposed_by_subject_id = %s",
                subject_id,
            )
            totals["decision"] = int(cnt["c"])

            rows = await self._fetch_all(
                """
                SELECT
                    decision_id::text  AS decision_id,
                    community_id::text AS community_id,
                    decision_type::text AS decision_type,
                    title              AS title,
                    status::text       AS status,
                    proposed_at        AS proposed_at
                FROM homonet.decision
                WHERE proposed_by_subject_id = %s
                ORDER BY proposed_at DESC NULLS LAST, decision_id DESC
                LIMIT %s
                """,
                subject_id,
                limit,
            )
            for r in rows:
                all_items.append(SubjectObjectItem(
                    domain="decision",
                    objectId=r["decision_id"],
                    title=r["title"] or "",
                    status=r["status"],
                    sortKey=str(r["proposed_at"]) if r["proposed_at"] else None,
                    payload={
                        "communityId": r["community_id"],
                        "decisionType": r["decision_type"],
                        "proposedAt": str(r["proposed_at"]) if r["proposed_at"] else None,
                    },
                ))

        # --- contribution --------------------------------------------
        if "contribution" in domains:
            cnt = await self._fetch_one(
                "SELECT COUNT(*) AS c FROM homonet.contribution WHERE contributor_subject_id = %s",
                subject_id,
            )
            totals["contribution"] = int(cnt["c"])

            rows = await self._fetch_all(
                """
                SELECT
                    contribution_id::text   AS contribution_id,
                    process_id::text        AS process_id,
                    contribution_type::text AS contribution_type,
                    description             AS description,
                    recorded_at             AS recorded_at
                FROM homonet.contribution
                WHERE contributor_subject_id = %s
                ORDER BY recorded_at DESC NULLS LAST, contribution_id DESC
                LIMIT %s
                """,
                subject_id,
                limit,
            )
            for r in rows:
                all_items.append(SubjectObjectItem(
                    domain="contribution",
                    objectId=r["contribution_id"],
                    title=(r["description"] or "")[:120] or r["contribution_type"],
                    status=None,
                    sortKey=str(r["recorded_at"]) if r["recorded_at"] else None,
                    payload={
                        "processId": r["process_id"],
                        "contributionType": r["contribution_type"],
                        "description": r["description"],
                        "recordedAt": str(r["recorded_at"]) if r["recorded_at"] else None,
                    },
                ))

        # --- account -------------------------------------------------
        if "account" in domains:
            cnt = await self._fetch_one(
                "SELECT COUNT(*) AS c FROM homonet.account WHERE owner_subject_id = %s",
                subject_id,
            )
            totals["account"] = int(cnt["c"])

            rows = await self._fetch_all(
                """
                SELECT
                    account_id::text   AS account_id,
                    currency           AS currency,
                    balance            AS balance,
                    status::text       AS status,
                    account_type       AS account_type
                FROM homonet.account
                WHERE owner_subject_id = %s
                ORDER BY currency
                LIMIT %s
                """,
                subject_id,
                limit,
            )
            for r in rows:
                all_items.append(SubjectObjectItem(
                    domain="account",
                    objectId=r["account_id"],
                    title=f"{r['currency']} account",
                    status=r["status"],
                    sortKey=None,  # счета сортируем по currency, не по дате
                    payload={
                        "currency": r["currency"],
                        "balance": float(r["balance"]),
                        "accountType": r["account_type"],
                    },
                ))

        # --- сортировка и пагинация смешанного списка ----------------
        # Сначала items с sortKey (DESC по дате/времени в ISO-строке — верно
        # сортируется лексикографически), затем items без sortKey (например account).
        dated = sorted(
            [it for it in all_items if it.sortKey],
            key=lambda it: it.sortKey or "",
            reverse=True,
        )
        undated = [it for it in all_items if not it.sortKey]
        ordered = dated + undated

        total = sum(totals.values())
        page = ordered[offset : offset + limit]

        return SubjectObjectsResponse(
            subjectId=subject_id,
            limit=limit,
            offset=offset,
            total=total,
            totals=totals,
            items=page,
        )
