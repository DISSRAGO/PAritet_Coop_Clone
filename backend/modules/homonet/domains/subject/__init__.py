"""Subject Domain (HomoNet V0.51).

Каноническая реализация субъектной модели HomoNet V0.51. Здесь живёт API
создания/чтения ``subject``, его карточки и **Subject Resolver** —
кросс-доменные выборки (тханки, листинги, сделки, решения, вклады, счета),
привязанные к одному ``subject_id``.

Архитектурно ``subject`` — сущность **выше** когитеки и любых других
фронтов. Когитека — лишь один из фронтов экосистемы; ключ ``subject_id``
позволяет ходить по объектам владельца через любую другую площадку.

Структура модуля
================

* ``router.py``   — FastAPI APIRouter'ы. Два префикса: legacy
  ``/subject/...`` и канонический фасад ``/app/subjects/...``
  (OpenAPI V0.51 §5.2 ``subject_app_api``). Маршруты read-only
  resolver'а полностью продублированы под оба префикса.
* ``service.py``  — бизнес-логика. ``SubjectService`` владеет таблицами
  ``homonet.person``, ``homonet.person_profile``, ``homonet.subject``.
  Resolver-методы — read-only выборки кросс-доменных объектов.
* ``schemas.py``  — Pydantic-модели для запросов/ответов. Везде
  ``camelCase`` через ``Field(alias=...)``; поэтому TS-фронт получает
  ровно такие же ключи (``subjectId``, ``subjectKind`` и т.д.).

Канонические инварианты
=======================

1. Один ``subject`` = ровно один источник: ``person_id``,
   ``community_id`` или ``organization_id``. На уровне БД — ``UNIQUE``
   на каждом из FK; на уровне сервиса — pre-check + ``409``.
2. ``subject_kind ∈ {personal, collective, organizational}``
   соответствует заполненному FK.
3. ``auth_user.subject_id`` — каноническая связь
   «пользователь → subject». После создания personal subject связь
   устанавливается в одной транзакции (вместе с INSERT в
   ``homonet.subject``).

Связь с другими модулями
========================

* ``cogiteka`` (один из фронтов): SOAP-адаптер ``local_adapter.py``
  использует ``auth_user.subject_id`` для определения автора и
  кабинета тханки (Stage 3 PR 4). Если поле NULL — fallback на login.
* ``auth``: при логине JWT-payload содержит ``user_id`` и ``login``.
  ``subject_id`` подтягивается резолвом в
  ``cogiteka.routers.users._resolve_subject_id``
  (endpoint ``/user/header_info``) и пробрасывается фронтом
  в SOAP как ``SubjectId``.
* Frontend ``cogitor-ui``: ``SubjectService.ts`` (TS-аналог) ходит
  ровно в эти же endpoint'ы (Stage 3 PR 3). ``PersonalSubjectPage``
  рендерит 8 вкладок поверх resolver-методов.

Пагинация и ошибки
==================

* Все списочные методы — ``PaginatedResponse`` (``items``, ``total``,
  ``limit``, ``offset``). ``limit ∈ [1, 200]`` (default 50, hard cap 200),
  ``offset ≥ 0``.
* ``404 Subject not found`` — все resolver-методы валидируют
  существование ``subject`` через ``_ensure_subject_exists``. Без
  этого хопа фронт получал бы пустой список на опечатку в UUID
  и не догадывался бы об ошибке.
* ``400 Unknown domain`` — ``?domain=...`` содержит неизвестное значение.
* ``403 Auth user is inactive / not verified`` — при создании personal subject.
* ``409 Subject is already linked to this auth user`` — повторный
  ``create-personal-subject`` для того же ``auth_user``.

Stage 3 — история изменений
===========================

* PR #20 — Subject Resolver: resolver-методы + 14 endpoints
  (legacy + canonical).
* PR #21 — параметризованный ``/objects?domain=...`` со сквозной
  DESC-сортировкой и единой пагинацией.
* PR #22 — frontend ``SubjectService.ts`` + ``PersonalSubjectPage``
  (relative paths, 8 вкладок).
* PR #23 — cogiteka использует ``SubjectId`` приоритетно над ``Login``
  во внутренних SOAP-контрактах (fallback на login сохранён).
* PR #24 — docstrings/module-doc (этот файл).
"""
