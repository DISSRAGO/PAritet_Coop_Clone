# Subject Domain (HomoNet V0.51)

Модуль `subject` — каноническая реализация субъектной модели HomoNet
V0.51. Здесь живёт API создания/чтения `subject`, его карточки и
**Subject Resolver** — кросс-доменные выборки (тханки, листинги, сделки,
решения, вклады, счета), привязанные к одному `subject_id`.

> Архитектурно `subject` — сущность **выше** когитеки и любых других
> фронтов. Когитека — лишь один из фронтов экосистемы; ключ `subject_id`
> позволяет ходить по объектам владельца через любую другую площадку.

## Структура файлов

| Файл | Назначение |
| --- | --- |
| `router.py` | FastAPI APIRouter'ы. Два префикса: legacy `/subject/...` и канонический фасад `/app/subjects/...` (OpenAPI V0.51 §5.2 `subject_app_api`). |
| `service.py` | Бизнес-логика. `SubjectService` владеет таблицами `homonet.person`, `homonet.person_profile`, `homonet.subject`. Resolver-методы — read-only выборки кросс-доменных объектов. |
| `schemas.py` | Pydantic-модели для запросов/ответов. Везде `camelCase` через `Field(alias=...)`. |
| `__init__.py` | Пакетный init с module-docstring. |

## API

Все маршруты доступны под двумя префиксами:
- **legacy:** `/api/subject/...` (исторический, сохранён ради старых фронтов).
- **канонический фасад:** `/api/app/subjects/...` (OpenAPI V0.51 §5.2).

### Запись

| Маршрут (канон) | Запрос | Назначение |
| --- | --- | --- |
| `POST /api/app/subjects/create-personal-subject` | `CreatePersonalSubjectRequest` | UC-03: создать `subject_kind='personal'` для `auth_user` (`login`). Идемпотентен — повторный вызов отдаёт `409` если subject уже привязан. |
| `POST /api/app/subjects/create-collective-subject` | `CreateCollectiveSubjectRequest` | UC-05: создать `subject_kind='collective'` для уже существующей `community`. |

### Чтение

| Маршрут (канон) | Назначение |
| --- | --- |
| `GET /api/app/subjects/{subject_id}/card` | Карточка subject любого `subject_kind`. |
| `GET /api/app/subjects/{subject_id}/summary` | Дашборд: одной поездкой в БД — счётчики по всем доменам (7 субзапросов в один SELECT). |
| `GET /api/app/subjects/{subject_id}/thankas` | Тханки, владелец которых — этот subject (через `author.subject_id`). Поддерживает `?limit`, `?offset`, `?status`. |
| `GET /api/app/subjects/{subject_id}/listings` | Listing'и, где subject — продавец. |
| `GET /api/app/subjects/{subject_id}/deals` | Deal'ы, где subject — `supplier` или `buyer`. Параметр `?role=supplier|buyer` фильтрует. |
| `GET /api/app/subjects/{subject_id}/decisions` | Decision'ы, предложенные subject'ом (`proposed_by_subject_id`). |
| `GET /api/app/subjects/{subject_id}/contributions` | Contribution'ы (`contributor_subject_id`). |
| `GET /api/app/subjects/{subject_id}/accounts` | Счета (`account.owner_subject_id`). Без пагинации — обычно у subject их единицы. |
| `GET /api/app/subjects/{subject_id}/objects?domain=thanka,listing,...` | Сводный лента-вью cross-доменных объектов (Stage 3 PR 2). Параметр `domain` — список через запятую; пустой — все домены. Сквозная сортировка `DESC` по дате создания. |

### Пагинация

Все списочные методы возвращают `PaginatedResponse`:
- `limit` ∈ [1, 200] (default 50, hard cap 200).
- `offset` ≥ 0 (default 0).
- Поля ответа: `items`, `total`, `limit`, `offset`.

### Ошибки

- `404 Subject not found` — любые resolver-методы валидируют существование
  subject через `_ensure_subject_exists` (один запрос). Без него фронт
  получал бы пустой список на опечатку в UUID и не догадывался бы об ошибке.
- `400 Unknown domain` — `?domain=...` содержит неизвестное значение.
- `403 Auth user is inactive / not verified` — при создании personal subject.
- `409 Subject is already linked to this auth user` — повторный
  `create-personal-subject` для того же `auth_user`.

## Канонические инварианты

1. Один subject = ровно один источник: `person_id`, `community_id` или
   `organization_id`. На уровне БД — `UNIQUE` на каждом из FK; на уровне
   сервиса — pre-check + `409`.
2. `subject_kind` ∈ `{personal, collective, organizational}` соответствует
   заполненному FK.
3. `auth_user.subject_id` — каноническая связь "пользователь → subject".
   После создания personal subject связь устанавливается в одной
   транзакции (вместе с INSERT в `homonet.subject`).

## Связь с другими модулями

- **`cogiteka` (один из фронтов):** SOAP-адаптер `local_adapter.py`
  использует `auth_user.subject_id` для определения автора и кабинета
  тханки (Stage 3 PR 4). Если поле NULL — fallback на `login`.
- **`auth`:** при логине JWT-payload содержит `user_id` и `login`.
  `subject_id` подтягивается отдельным резолвом в
  `cogiteka.routers.users._resolve_subject_id` (`/user/header_info`)
  и пробрасывается фронтом в SOAP как `SubjectId`.
- **Frontend `cogitor-ui`:** `SubjectService.ts` (TypeScript-аналог)
  ходит ровно в эти же endpoint'ы (Stage 3 PR 3).
  `PersonalSubjectPage` рендерит 8 вкладок поверх resolver-методов.

## История изменений (Stage 3)

| PR | Что |
| --- | --- |
| #20 | Subject Resolver и канонические маршруты (resolver-методы + 14 endpoints). |
| #21 | Параметризованный `/objects?domain=...` со сквозной DESC-сортировкой и единой пагинацией. |
| #22 | Frontend `SubjectService.ts` + `PersonalSubjectPage` (relative paths, 8 вкладок). |
| #23 | Cogiteka использует `SubjectId` приоритетно над `Login` во внутренних SOAP-контрактах. |
| #24 | Документация: docstrings + этот README. |

## Локальная проверка

```bash
# create personal subject
curl -X POST http://127.0.0.1:8000/api/app/subjects/create-personal-subject \
  -H "Content-Type: application/json" \
  -d '{"authUserLogin": "kami", "surname": "Sama", "firstName": "Kami"}'

# card
curl http://127.0.0.1:8000/api/app/subjects/<subject_id>/card

# объекты по доменам
curl "http://127.0.0.1:8000/api/app/subjects/<subject_id>/objects?domain=thanka,listing&limit=20"
```
