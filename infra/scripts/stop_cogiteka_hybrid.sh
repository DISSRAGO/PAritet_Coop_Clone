#!/usr/bin/env bash
set -euo pipefail

ROOT="/srv/clone"
API_DIR="$ROOT/backend"
UI_DIR="$ROOT/frontends/cogitor-ui"
COMPOSE_FILE="$ROOT/infra/docker/docker-compose.yml"

API_PORT=8000
WITH_INFRA="${WITH_INFRA:-0}"

echo "[1/3] Stopping backend process..."
if [ -f "$API_DIR/.uvicorn.pid" ]; then
  kill "$(cat "$API_DIR/.uvicorn.pid")" 2>/dev/null || true
  rm -f "$API_DIR/.uvicorn.pid"
fi
pkill -f "uvicorn backend.main:app --host 0.0.0.0 --port $API_PORT --reload" 2>/dev/null || true

echo "[2/3] Stopping frontend process..."
if [ -f "$UI_DIR/.npm.pid" ]; then
  kill "$(cat "$UI_DIR/.npm.pid")" 2>/dev/null || true
  rm -f "$UI_DIR/.npm.pid"
fi
pkill -f "react-scripts start" 2>/dev/null || true

if [ "$WITH_INFRA" = "1" ]; then
  echo "[3/3] Stopping infrastructure containers (postgres, redis)..."
  docker compose -f "$COMPOSE_FILE" stop postgres redis || true
else
  echo "[3/3] Skipping docker infrastructure shutdown (WITH_INFRA=0)."
fi

echo "Done."
echo "Stopped backend and UI."