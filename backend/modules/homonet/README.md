# HomoNet — каноническое ядро (V0.51)

> **Subject — сущность выше Cogiteka.** Cogiteka — лишь один из фронтов
> поверх HomoNet. Оркестратор управляет несколькими беками разных фронтов,
> данные стекаются через него в общую БД (в т.ч. в `subject`).

## Структура

```
backend/modules/homonet/
├── domains/              # low-level CRUD per домен
│   ├── subject/          # personal/collective/organizational subject
│   ├── community/        # сообщества
│   ├── membership/       # участие subject в community
│   ├── role/             # роли в membership/process/case
│   └── representation/   # представления (доверенности)
├── facade/               # /api/app/* — высокоуровневые сценарии
├── migrations/           # idempotent backfill-скрипты
├── tests/                # AC-01 e2e: Person → Subject → Community → Membership → Role
└── router.py             # homonet_router (включается в backend/main.py)
```

## URL-карта

**Low-level (domains/):**
- `GET/POST/PATCH /api/subjects[/{id}]`
- `GET/POST/PATCH /api/communities[/{id}]`
- `GET/POST/PATCH /api/memberships[/{id}]`
- `GET/POST/PATCH /api/roles[/{id}]`
- `GET/POST/PATCH /api/representations[/{id}]`

**Facade (facade/):**
- `POST /api/app/subjects/create-personal-subject` (UC-03)
- `POST /api/app/subjects/create-collective-subject` (UC-05)
- `GET  /api/app/subjects/{id}/card`
- `POST /api/app/communities/create-with-subject`

## Канонические инварианты (уже в DDL)

- `subject`: ровно один из `person_id|organization_id|community_id` NOT NULL
- `subject.subject_kind` ↔ заполненный FK согласованы
- `subject` UNIQUE на каждый источник (нельзя 2 subject для одного person)
- `membership` partial UNIQUE `WHERE status='active'`
- `role`: `scope_type` ↔ один из `(membership_id|process_id|pirda_case_id)`

## Cogiteka как потребитель

`Thanka.author_subject_id` → `homonet.subject.subject_id`. Старая колонка
`Thanka.Author` (UUID тханки-аватара) переводится постепенно: добавляем
новую колонку рядом, backfill, переключение чтения, потом удаление старой.

## Поэтапная сборка

| PR | Содержание |
|----|-----------|
| A  | Скелет модуля (этот PR) |
| B  | Перенос subject из cogiteka → homonet/domains/subject (рефакторинг) |
| C  | Backfill: person + personal subject для auth_user без них |
| D  | Thanka.author_subject_id (колонка + backfill + чтение) |

Документация: `260423-DDL-V051-3`, `260423ER-V051-10`,
`260424-Runnable-Slice1-V051-15`, `260430-HomoNet-V051-16`.
