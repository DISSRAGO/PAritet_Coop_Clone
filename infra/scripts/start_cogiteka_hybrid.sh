#!/usr/bin/env bash
set -euo pipefail

ROOT="${ROOT:-/srv/clone}"
API_DIR="$ROOT/backend"
UI_DIR="$ROOT/frontends/cogitor-ui"
PY_VENV="$ROOT/.venv"
COMPOSE_FILE="$ROOT/infra/docker/docker-compose.yml"

REQ_FILE="$API_DIR/requirements.txt"
REQ_HASH_FILE="$API_DIR/.requirements.sha256"
PKG_LOCK_FILE="$UI_DIR/package-lock.json"
PKG_HASH_FILE="$UI_DIR/.package-lock.sha256"

API_PORT="${API_PORT:-8000}"
UI_PORT="${UI_PORT:-3001}"
WITH_INFRA="${WITH_INFRA:-0}"

export COGI_PROJECT_DIR="${COGI_PROJECT_DIR:-$ROOT}"
export COGI_DATA_DIR="${COGI_DATA_DIR:-$ROOT/data}"
export COGI_STYLE_PATH="${COGI_STYLE_PATH:-http://127.0.0.1:$API_PORT/data/styles/}"
export COGI_PDF_PATH="${COGI_PDF_PATH:-http://127.0.0.1:$API_PORT/data/pdf/}"
export COGI_SITE_NAVIGATOR_URL="${COGI_SITE_NAVIGATOR_URL:-http://127.0.0.1:$UI_PORT/navigator/}"
export COGI_START_THANKA_ID="${COGI_START_THANKA_ID:-18352}"
ENV_FILE="$ROOT/.env"

if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck source=/dev/null
  . "$ENV_FILE"
  set +a
fi

: "${DATABASE_URL:?ERROR: DATABASE_URL is not set. Put it into $ENV_FILE}"

cd "$ROOT"

if [ "$WITH_INFRA" = "1" ]; then
  echo "[1/6] Starting infrastructure containers (postgres, redis)..."
  docker compose -f "$COMPOSE_FILE" up -d postgres redis
else
  echo "[1/6] Skipping docker infrastructure startup (WITH_INFRA=0)."
fi

echo "[2/6] Preparing Python virtual environment..."
if [ ! -d "$PY_VENV" ]; then
  echo "Creating Python virtual environment in $PY_VENV ..."
  python3 -m venv "$PY_VENV"
fi

# shellcheck source=/dev/null
source "$PY_VENV/bin/activate"

if [ ! -f "$REQ_FILE" ]; then
  echo "ERROR: requirements file not found: $REQ_FILE"
  exit 1
fi

NEW_REQ_HASH="$(sha256sum "$REQ_FILE" | awk '{print $1}')"
OLD_REQ_HASH="$(cat "$REQ_HASH_FILE" 2>/dev/null || true)"

if [ ! -f "$PY_VENV/bin/uvicorn" ] || [ "$NEW_REQ_HASH" != "$OLD_REQ_HASH" ]; then
  echo "Installing/updating Python dependencies..."
  python -m pip install --upgrade pip
  pip install -r "$REQ_FILE"
  echo "$NEW_REQ_HASH" > "$REQ_HASH_FILE"
else
  echo "Python dependencies are up to date."
fi

echo "[3/6] Starting backend on :$API_PORT ..."
# uvicorn --reload плодит worker'ы через multiprocessing.spawn,
# которые при kill мастера отделяются в init и держат порт.
# Поэтому убиваем всё по PID, по паттерну и по порту.
if [ -f "$API_DIR/.uvicorn.pid" ]; then
  kill "$(cat "$API_DIR/.uvicorn.pid")" 2>/dev/null || true
  rm -f "$API_DIR/.uvicorn.pid"
fi
pkill -9 -f "uvicorn backend.main:app" 2>/dev/null || true
# контрольный выстрел: zombie-worker'ы от --reload и любые .venv-процессы
pkill -9 -f "$PY_VENV/bin/python" 2>/dev/null || true
# последний рубеж — всё, что всё ещё слушает порт
if command -v fuser >/dev/null 2>&1; then
  fuser -k -9 "${API_PORT}/tcp" 2>/dev/null || true
fi
sleep 1

nohup env \
COGI_PROJECT_DIR="$COGI_PROJECT_DIR" \
COGI_DATA_DIR="$COGI_DATA_DIR" \
COGI_STYLE_PATH="$COGI_STYLE_PATH" \
COGI_PDF_PATH="$COGI_PDF_PATH" \
COGI_SITE_NAVIGATOR_URL="$COGI_SITE_NAVIGATOR_URL" \
COGI_START_THANKA_ID="$COGI_START_THANKA_ID" \
DATABASE_URL="$DATABASE_URL" \
"$PY_VENV/bin/python" -m uvicorn backend.main:app --host 0.0.0.0 --port "$API_PORT" --reload \
> "$API_DIR/uvicorn.log" 2>&1 &
echo $! > "$API_DIR/.uvicorn.pid"

echo "[4/6] Preparing UI dependencies..."
if [ ! -f "$UI_DIR/package.json" ]; then
  echo "ERROR: frontend package.json not found in $UI_DIR"
  exit 1
fi

cd "$UI_DIR"

if [ -f "$PKG_LOCK_FILE" ]; then
  NEW_PKG_HASH="$(sha256sum "$PKG_LOCK_FILE" | awk '{print $1}')"
else
  NEW_PKG_HASH=""
fi
OLD_PKG_HASH="$(cat "$PKG_HASH_FILE" 2>/dev/null || true)"

if [ ! -d node_modules ] || [ "$NEW_PKG_HASH" != "$OLD_PKG_HASH" ]; then
  echo "Installing/updating npm dependencies..."
  npm install
  if [ -n "$NEW_PKG_HASH" ]; then
    echo "$NEW_PKG_HASH" > "$PKG_HASH_FILE"
  fi
else
  echo "UI dependencies are up to date."
fi

echo "[5/6] Starting UI on :$UI_PORT ..."
# webpack-dev-server тоже может оставлять зомби-процессы,
# поэтому чистим аналогично backend'у.
if [ -f "$UI_DIR/.npm.pid" ]; then
  kill "$(cat "$UI_DIR/.npm.pid")" 2>/dev/null || true
  rm -f "$UI_DIR/.npm.pid"
fi
pkill -9 -f "react-scripts start" 2>/dev/null || true
pkill -9 -f "webpack" 2>/dev/null || true
if command -v fuser >/dev/null 2>&1; then
  fuser -k -9 "${UI_PORT}/tcp" 2>/dev/null || true
fi
sleep 1

nohup env PORT="$UI_PORT" HOST=0.0.0.0 npm start \
  > "$UI_DIR/npm-start.log" 2>&1 &
echo $! > "$UI_DIR/.npm.pid"

echo "[6/6] Checking ports and health..."
sleep 5

if ! ss -ltn | grep -q ":$API_PORT "; then
  echo "ERROR: Backend is not listening on port $API_PORT. See $API_DIR/uvicorn.log"
  exit 1
fi

if ! ss -ltn | grep -q ":$UI_PORT "; then
  echo "ERROR: UI is not listening on port $UI_PORT. See $UI_DIR/npm-start.log"
  exit 1
fi

if command -v curl >/dev/null 2>&1; then
  if curl -sf "http://127.0.0.1:$API_PORT/" >/dev/null 2>&1; then
    echo "Backend root check OK."
  else
    echo "WARNING: Backend root endpoint returned error."
  fi

  if curl -sf "http://127.0.0.1:$API_PORT/data/empty.jpg" >/dev/null 2>&1; then
    echo "Backend /data check OK."
  else
    echo "WARNING: Backend /data/empty.jpg returned error."
  fi
fi

echo
echo "Done."
echo "Backend: http://127.0.0.1:$API_PORT"
echo "UI : http://127.0.0.1:$UI_PORT"
echo "DATA_DIR: $COGI_DATA_DIR"
echo "Backend log: $API_DIR/uvicorn.log"
echo "UI log : $UI_DIR/npm-start.log"