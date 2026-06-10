#!/bin/bash
# Диагностика: где живёт MPG в дереве, кто её родитель, видит ли её Warhammer.
# Запускать на сервере: bash scripts/diag/check_mpg_parent.sh
#
# DSN берётся из переменной окружения DATABASE_URL либо из .env проекта.

set -e

if [ -z "${DATABASE_URL:-}" ] && [ -f ".env" ]; then
  # shellcheck disable=SC1091
  set -a; . ./.env; set +a
fi

DB="${DATABASE_URL:?DATABASE_URL не задан (export DATABASE_URL=postgresql://...)}"

# Таблицы живут в схеме homonet (см. backend/shared/db.py:56),
# а не в public. Пробрасываем search_path всем psql-вызовам ниже.
export PGOPTIONS="--search_path=homonet,public"

echo "=== 1. Сама MPG ==="
psql "$DB" -c "
SELECT t.thanka_id::text AS id,
       t.title,
       t.author_id::text AS author_id,
       t.status,
       co.current_content->>'custom_url' AS custom_url,
       co.current_content->>'parent_id'  AS parent_id,
       co.current_content->>'type'       AS type
FROM thanka t
LEFT JOIN cogobject co ON co.thanka_id = t.thanka_id
WHERE co.current_content->>'custom_url' = 'MPG'
   OR t.title ILIKE '%matched plat guide%';"

echo "=== 2. Warhammer (parent-кандидат) ==="
psql "$DB" -c "
SELECT t.thanka_id::text AS id,
       t.title,
       t.author_id::text AS author_id,
       co.current_content->>'custom_url' AS custom_url,
       co.current_content->>'parent_id'  AS parent_id,
       co.current_content->>'is_cabinet' AS is_cabinet
FROM thanka t
LEFT JOIN cogobject co ON co.thanka_id = t.thanka_id
WHERE co.current_content->>'custom_url' = 'WarhammerTheOldWorld'
   OR t.title ILIKE '%warhammer%';"

echo "=== 3. Кабинет test_login_001 ==="
psql "$DB" -c "
SELECT t.thanka_id::text AS cabinet_id,
       t.title,
       a.author_id::text AS author_id,
       a.subject_id::text AS subject_id
FROM thanka t
JOIN author a ON a.author_id = t.author_id
JOIN avatar av ON av.author_id = a.author_id
JOIN cogobject co ON co.thanka_id = t.thanka_id
WHERE av.login = 'test_login_001'
  AND (co.current_content->>'is_cabinet')::boolean IS TRUE;"

echo "=== 4. Все тханки test_login_001 со ссылкой на parent ==="
psql "$DB" -c "
SELECT t.thanka_id::text AS id,
       t.title,
       co.current_content->>'custom_url' AS custom_url,
       co.current_content->>'parent_id'  AS parent_id,
       co.current_content->>'is_cabinet' AS is_cabinet,
       t.created_at::text AS created
FROM thanka t
JOIN author a ON a.author_id = t.author_id
JOIN avatar av ON av.author_id = a.author_id
LEFT JOIN cogobject co ON co.thanka_id = t.thanka_id
WHERE av.login = 'test_login_001'
  AND t.status <> 'deleted'
ORDER BY t.created_at ASC;"
