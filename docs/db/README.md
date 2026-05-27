# Database layout

Эта директория — единая точка хранения SQL-файлов проекта Clone.

## Структура

- `base/` — полная базовая схема для разворачивания пустой БД с нуля.
- `migrations/` — пошаговые изменения схемы после base.
- `seeds/` — dev/test данные, bootstrap админа, тестовые записи.
- `manual/` — разовые отладочные SQL, не участвующие в автоматическом разворачивании.

## Правила

1. Базовая схема хранится в `base/`.
2. Любое изменение после базовой схемы оформляется отдельным SQL-файлом в `migrations/`.
3. Seed-данные не смешиваются со схемой.
4. Имена migration-файлов — с датой и порядковым номером:
   - `2026_05_26_001_auth_tables.sql`
   - `2026_05_26_002_auth_sessions.sql`

## Разворачивание новой БД

```bash
sudo -u postgres dropdb --if-exists homonet_v051_test
sudo -u postgres createdb homonet_v051_test

sudo -u postgres psql -v ON_ERROR_STOP=1 -d homonet_v051_test \
  -f /srv/clone/docs/db/base/001_homonet_ddl_v051.sql

sudo -u postgres psql -v ON_ERROR_STOP=1 -d homonet_v051_test \
  -f /srv/clone/docs/db/migrations/2026_05_26_001_auth_tables.sql

sudo -u postgres psql -v ON_ERROR_STOP=1 -d homonet_v051_test \
  -f /srv/clone/docs/db/migrations/2026_05_26_002_auth_sessions.sql
```

## Создание dev-admin

```bash
cd /srv/clone
sudo -u postgres env DATABASE_URL='postgresql:///homonet_v051_test?user=postgres' \
  /srv/clone/.venv/bin/python -m backend.scripts.create_admin
```

## Замечания

- `base/` — это снимок полной схемы.
- `migrations/` — история изменений.
- Не редактировать старые migration-файлы после того, как они уже применялись.