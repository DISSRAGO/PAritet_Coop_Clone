# PAritet_Coop_Clone (HomoNet / Cogiteka)

Монорепозиторий гибридного стенда **HomoNet / Cogiteka** — клона платформы Paritet Coop.
Содержит backend на FastAPI, frontend на React + TypeScript, инфраструктуру Docker
(PostgreSQL, Redis, Nginx) и SQL-схему БД.

Стенд запускается одной командой и поднимает локально:

- **Backend API** — http://127.0.0.1:8000
- **Frontend (UI)** — http://127.0.0.1:3001

---

## Содержание

- [Архитектура](#архитектура)
- [Стек технологий](#стек-технологий)
- [Структура репозитория](#структура-репозитория)
- [Требования](#требования)
- [Быстрый старт](#быстрый-старт)
- [Развёртывание БД](#развёртывание-бд)
- [Запуск через Docker Compose](#запуск-через-docker-compose)
- [Переменные окружения](#переменные-окружения)
- [API](#api)
- [Frontend](#frontend)
- [Разработка](#разработка)
- [Логи и отладка](#логи-и-отладка)
- [Остановка стенда](#остановка-стенда)

---

## Архитектура

```
                ┌──────────────────────────┐
                │   Frontend (React/TS)    │
                │   cogitor-ui  :3001      │
                └─────────────┬────────────┘
                              │ REST (axios)
                              ▼
                ┌──────────────────────────┐
                │   Backend (FastAPI)      │
                │   backend.main:app :8000 │
                │   /api/* , /data/*       │
                └───┬──────────┬───────┬───┘
                    │          │       │
              ┌─────▼──┐  ┌────▼───┐ ┌─▼──────────────┐
              │Postgres│  │ Redis  │ │ Portmonet SOAP │
              │  :5432 │  │ :6379  │ │ (внешний)      │
              └────────┘  └────────┘ └────────────────┘
```

- Backend — это **shared API** (`HomoNet API - Shared Server`), внутри которого живёт
  модуль `cogiteka` (под префиксом `/api`) и legacy site-роутер.
- Часть данных backend получает из внешнего SOAP-сервиса
  Portmonet (`backend/modules/cogiteka/integrations/portmonet/`).
- Статика (стили страниц, PDF, изображения) монтируется из каталога `data/` под
  URL `/data/...`.

---

## Стек технологий

### Backend
- **Python 3.13**
- **FastAPI** + Uvicorn
- **SQLModel / psycopg (v3)** — работа с PostgreSQL
- **PyJWT**, **bcrypt** — аутентификация
- **Pillow** — обработка изображений
- Внешние интеграции: SOAP API Portmonet

### Frontend (`frontends/cogitor-ui`)
- **React 18 + TypeScript 4**
- **Webpack 5** (dev-server и production-сборка)
- **Redux Toolkit + react-redux**, **react-router-dom v6**
- **Ant Design 4** (`antd`, `@ant-design/icons`, `antd-img-crop`)
- **Konva / react-konva / @react-spring/konva** — canvas-редактор
- **Formik + Yup** — формы и валидация
- **axios**, **jwt-decode**, **moment-timezone**
- **Jodit React** — WYSIWYG-редактор
- **react-cropper / cropperjs** — обрезка изображений

### Инфраструктура
- **Docker / Docker Compose** — `postgres:16`, `redis:alpine`, `nginx:alpine`
- **Bash-скрипты** — гибридный запуск (venv + npm + Docker)

---

## Структура репозитория

```
.
├── backend/                       # FastAPI приложение
│   ├── main.py                    # точка входа, FastAPI app, CORS, /data mount
│   ├── core/                      # cache, config, exceptions, logger, security
│   ├── modules/
│   │   └── cogiteka/              # основной бизнес-модуль (под /api)
│   │       ├── router.py          # агрегатор роутеров cogiteka
│   │       ├── site_router.py     # legacy site-эндпоинты
│   │       ├── core/              # config, cache модуля
│   │       ├── integrations/
│   │       │   ├── media/         # image_utils
│   │       │   └── portmonet/     # SOAP-адаптер, portmonet_api, request_api
│   │       ├── routers/           # auth, users, community, location,
│   │       │                      # members, payment, site, story, thanka,
│   │       │                      # files, address, request
│   │       └── services/          # бизнес-логика (auth/users/payment/address)
│   ├── routers/                   # верхнеуровневые роутеры (site и т.п.)
│   ├── scripts/
│   │   └── create_admin.py        # bootstrap dev-админа
│   ├── shared/                    # db, security, schemas, utils
│   ├── tests/                     # тесты (integrations/media, portmonet)
│   └── requirements.txt
│
├── frontends/
│   └── cogitor-ui/                # React + TS + webpack
│       ├── src/
│       │   ├── api/               # HTTP-клиенты к backend
│       │   ├── components/        # UI-компоненты (Editor, Viewer, EventCalendar, ...)
│       │   ├── pages/             # SignIn/SignUp/Profile/Admin/Editor/Viewer/...
│       │   ├── store/             # Redux Toolkit
│       │   ├── routes/, hooks/, context/, services/,
│       │   │   layout/, themes/, models/, utils/, locales/
│       │   └── index.tsx, app.tsx
│       ├── public/
│       ├── webpack.config.ts
│       ├── tsconfig.json
│       ├── package.json
│       └── Dockerfile
│
├── infra/
│   ├── docker/
│   │   ├── backend.Dockerfile             # образ backend (python:3.13-slim)
│   │   ├── docker-compose.yml             # postgres + redis + nginx
│   │   └── docker-compose.cogiteka.yml    # cogiteka-api + cogiteka-ui
│   ├── nginx/nginx.conf
│   └── scripts/
│       ├── bootstrap/generate_docker_project.py
│       ├── start_cogiteka_hybrid.sh       # запуск стенда
│       └── stop_cogiteka_hybrid.sh        # остановка стенда
│
├── docs/
│   └── db/
│       ├── README.md                      # инструкция по развёртыванию БД
│       ├── base/                          # базовая схема (homonet_ddl, ...)
│       ├── migrations/                    # пошаговые миграции (даты + №)
│       └── seeds/                         # dev-данные (dev_admin.sql)
│
├── services/                      # вспомогательные сервисы (по проекту)
├── .gitignore
└── README.md
```

---

## Требования

Для гибридного запуска (рекомендуемый локальный режим):

- **Python 3.13** + `python3-venv`
- **Node.js 18+** (тестировался Node 20) и **npm**
- **Docker** и **Docker Compose** v2 — для PostgreSQL и Redis
- **PostgreSQL 16** — если запускаешь БД не в Docker, а локально
- Linux / WSL2 (скрипты `bash`); путь по умолчанию — `/srv/clone`

Для полного Docker-режима достаточно только Docker и Docker Compose.

---

## Быстрый старт

> По умолчанию скрипты ожидают, что репозиторий лежит в `/srv/clone`.
> Если кладёшь в другое место — задай `ROOT` в окружении:
> `ROOT=/path/to/repo bash infra/scripts/start_cogiteka_hybrid.sh`.

### 1. Клонировать репозиторий

```bash
git clone https://github.com/DISSRAGO/PAritet_Coop_Clone.git /srv/clone
cd /srv/clone
```

### 2. Развернуть БД

См. раздел [Развёртывание БД](#развёртывание-бд).

### 3. Запустить стенд одной командой

```bash
bash /srv/clone/infra/scripts/start_cogiteka_hybrid.sh
```

Скрипт сам:

1. (опционально) поднимает Postgres и Redis в Docker — флагом `WITH_INFRA=1`.
2. Создаёт `.venv`, ставит Python-зависимости из `backend/requirements.txt`
   (кеш по `sha256` хешу `requirements.txt`).
3. Запускает backend через Uvicorn с `--reload` на `:8000`,
   PID пишет в `backend/.uvicorn.pid`, лог — в `backend/uvicorn.log`.
4. Ставит npm-зависимости фронта (кеш по `package-lock.json`).
5. Запускает webpack dev-server на `:3001`,
   PID — `frontends/cogitor-ui/.npm.pid`, лог — `frontends/cogitor-ui/npm-start.log`.
6. Проверяет, что порты слушаются и `GET /` отвечает.

После запуска:

- Backend: http://127.0.0.1:8000
- Frontend: http://127.0.0.1:3001
- Список всех роутов FastAPI: http://127.0.0.1:8000/debug/routes
- Swagger UI: http://127.0.0.1:8000/docs

### 4. Запуск с инфраструктурой в Docker

```bash
WITH_INFRA=1 bash /srv/clone/infra/scripts/start_cogiteka_hybrid.sh
```

---

## Развёртывание БД

Полная инструкция — в [`docs/db/README.md`](docs/db/README.md). Кратко:

```bash
sudo -u postgres dropdb --if-exists homonet_v051_test
sudo -u postgres createdb homonet_v051_test

# Базовая схема
sudo -u postgres psql -v ON_ERROR_STOP=1 -d homonet_v051_test \
  -f /srv/clone/docs/db/base/homonet_ddl.sql

# Миграции (применять по порядку)
for f in /srv/clone/docs/db/migrations/*.sql; do
  sudo -u postgres psql -v ON_ERROR_STOP=1 -d homonet_v051_test -f "$f"
done
```

Создание dev-админа (логин `admin`, пароль `ChangeMe123!` — поменяй после первого входа):

```bash
cd /srv/clone
sudo -u postgres env DATABASE_URL='postgresql:///homonet_v051_test?user=postgres' \
  /srv/clone/.venv/bin/python -m backend.scripts.create_admin
```

Правила работы с SQL-файлами:

- `base/` — снимок схемы для разворачивания с нуля.
- `migrations/` — пошаговые изменения с датой и порядковым номером
  (`2026_05_26_001_auth_tables.sql`).
- `seeds/` — dev/test данные, не смешиваются со схемой.
- Старые migration-файлы **не редактируются** после применения.

---

## Запуск через Docker Compose

Альтернатива bash-скриптам — полный запуск в контейнерах.

```bash
# Инфраструктура: Postgres + Redis + Nginx
docker compose -f infra/docker/docker-compose.yml up -d

# Приложения: cogiteka-api (:8000) + cogiteka-ui (:3001)
docker compose -f infra/docker/docker-compose.cogiteka.yml up -d --build
```

Compose использует общую сеть `clone_shared`. Контексты сборки:

- `cogiteka-api` — `./backend` (Dockerfile: `infra/docker/backend.Dockerfile`,
  либо `backend/Dockerfile` при наличии).
- `cogiteka-ui` — `./frontends/cogitor-ui` (Dockerfile в каталоге фронта).

Каталог `./data` монтируется в `/app/data` контейнера backend — там лежат
стили страниц (`data/styles`), PDF (`data/pdf`) и прочая статика.

---

## Переменные окружения

### Backend (`backend.main`, `backend/core/config.py`, `backend/modules/cogiteka/core/config.py`)

| Переменная | По умолчанию | Назначение |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres:postgres@127.0.0.1:5432/homonet_v051_test` | Строка подключения к Postgres (`backend/shared/db.py`). Скрипт запуска подставляет `clone_app:clone_app_dev`. |
| `DATA_DIR` | `/srv/clone/data` | Каталог статики, монтируемый под `/data/*`. |
| `COGI_PROJECT_DIR` | корень репо | Корень проекта для модуля cogiteka. |
| `COGI_DATA_DIR` | `$COGI_PROJECT_DIR/data` | Data-каталог cogiteka. |
| `COGI_STYLE_PATH` | `http://localhost:8000/cogi/data/styles/` | Публичный URL стилей страниц. |
| `COGI_PDF_PATH` | `http://localhost:8000/cogi/data/pdf/` | Публичный URL PDF. |
| `COGI_SITE_NAVIGATOR_URL` | `http://localhost:3000/navigator/` | URL фронтового навигатора (в скриптах — 3001). |
| `COGI_START_THANKA_ID` | `18352` | Стартовый ID thanka для cogiteka. |
| `COGI_SOAP_HOST` | `https://stend.portmonet.ru` | Хост внешнего SOAP-сервиса Portmonet. |
| `JWT_SECRET` | `dev-very-secret-change-me` | Секрет подписи JWT. **Обязательно** переопределить вне dev. |
| `ACCESS_TTL_SECONDS` | `43200` (12 ч) | TTL access-токена. |
| `REFRESH_TTL_SECONDS` | `2592000` (30 д) | TTL refresh-токена. |

### Скрипт `start_cogiteka_hybrid.sh`

| Переменная | По умолчанию | Назначение |
|---|---|---|
| `ROOT` | `/srv/clone` | Корень репозитория на хосте. |
| `API_PORT` | `8000` | Порт backend. |
| `UI_PORT` | `3001` | Порт frontend. |
| `WITH_INFRA` | `0` | `1` — поднимать Postgres/Redis в Docker. |

Секреты (`.env`, `*.key`, `*.pem`) и каталог `data/` исключены из git (см. `.gitignore`).

---

## API

Все cogiteka-эндпоинты префиксованы `/api`. Базовые служебные:

- `GET /` — корень shared-API, возвращает список проектов.
- `GET /cogi/status` — статус cogi-API.
- `GET /api/health` — health-check модуля cogiteka.
- `GET /debug/routes` — список всех зарегистрированных маршрутов FastAPI.
- `GET /docs` — Swagger UI.
- `GET /redoc` — ReDoc.

Группы роутеров (`backend/modules/cogiteka/routers/`):

- **auth** — `POST /api/auth/login | logout | refresh | signUp | confirm`,
  `POST /api/auth/validate/{login,email,phone}`
- **users**, **community**, **location**, **members**, **payment**,
  **site**, **story**, **thanka**, **files**, **address**, **request**
- Legacy-роуты совместимости с PHP-клиентом — например
  `/api/community/community.php`, `/api/thanka/getThanka.php`,
  `/api/thanka/setThanka.php` и т.д.

Аутентификация — Bearer JWT в заголовке `Authorization`.

---

## Frontend

Каталог: `frontends/cogitor-ui`. SPA на React 18 + TypeScript, собирается Webpack 5.

NPM-скрипты:

```bash
npm install              # установка зависимостей
npm start                # webpack-dev-server (dev), порт берётся из PORT (3001 в скриптах)
npm run build            # production-сборка в ./build
npm run start1           # pm2 serve build 8082 --spa (раздача собранного билда)
npm test                 # react-scripts test
```

Ключевые точки:

- `src/index.tsx`, `src/app.tsx` — корень приложения.
- `src/api/` — клиенты к backend (`axios`).
- `src/store/` — Redux Toolkit (slices, store).
- `src/pages/` — страницы: `SignInPage`, `SignUpPage`, `ConfirmSignUp`,
  `ProfilePage`, `Admin`, `EditorPage`, `ViewerPage`, `BillingPage`,
  `CommentPage`, `ThankaStory`, `Errors`.
- `src/components/` — Editor (Jodit, Konva), Viewer, EventCalendar/EventList,
  Iconostas, IntroductoryBlock/Editor, Logo, PdfTemplate, Society,
  StoryPage, Table, TextEditor, формы (`forms/`) и др.
- CORS на стороне backend разрешает `http://localhost:3001`,
  `http://127.0.0.1:3001` и `http://172.27.64.22:3001`.

---

## Разработка

### Backend

```bash
cd /srv/clone
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt

export DATABASE_URL="postgresql://clone_app:clone_app_dev@127.0.0.1:5432/homonet_v051_test"
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

Тесты (pytest):

```bash
cd /srv/clone
source .venv/bin/activate
pytest backend/tests
```

### Frontend

```bash
cd /srv/clone/frontends/cogitor-ui
npm install
PORT=3001 HOST=0.0.0.0 npm start
```

### Соглашения по БД

- Любое изменение схемы — отдельным файлом в `docs/db/migrations/`
  с именем `YYYY_MM_DD_NNN_description.sql`.
- Seed-данные — только в `docs/db/seeds/`.
- Базовая схема `docs/db/base/` обновляется как снимок, не как diff.

---

## Логи и отладка

- Backend: `tail -f /srv/clone/backend/uvicorn.log`
- Frontend: `tail -f /srv/clone/frontends/cogitor-ui/npm-start.log`
- Контейнеры Postgres/Redis (если запущены через Docker):

  ```bash
  cd /srv/clone
  docker compose -f infra/docker/docker-compose.yml logs -f postgres redis
  ```

- Список всех маршрутов FastAPI: `GET http://127.0.0.1:8000/debug/routes`.

---

## Остановка стенда

```bash
bash /srv/clone/infra/scripts/stop_cogiteka_hybrid.sh
```

Скрипт корректно гасит backend (`backend/.uvicorn.pid` + `pkill uvicorn`),
frontend (`.npm.pid` + `pkill react-scripts start`) и — при `WITH_INFRA=1` —
останавливает Postgres/Redis в Docker.

---

## Лицензия

Лицензия не задана. Если репозиторий публикуется наружу — добавь `LICENSE`
(MIT/Apache-2.0/проприетарную) и укажи её здесь.
