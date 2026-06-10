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

# Хелпер: psql с ON_ERROR_STOP, search_path внутри SQL (надёжнее чем PGOPTIONS),
# и подсветкой stderr.
psql_q() {
  local sql="$1"
  PGCLIENTENCODING=UTF8 psql "$DB" -v ON_ERROR_STOP=1 --pset=footer=off -c "
    SET search_path TO homonet, public;
    $sql
  "
}

echo "=== 0. Sanity: список схем и наличие таблицы thanka ==="
psql_q "
SELECT current_database() AS db, current_schema() AS schema;
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_name IN ('thanka','cogobject','author','avatar','auth_user')
ORDER BY table_schema, table_name;
"

echo
echo "=== 1. Сама MPG (по custom_url и по title) ==="
psql_q "
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
   OR t.title ILIKE '%matched plat guide%'
   OR t.title ILIKE '%MPG%';
"

echo
echo "=== 2. Warhammer (parent-кандидат) ==="
psql_q "
SELECT t.thanka_id::text AS id,
       t.title,
       t.author_id::text AS author_id,
       co.current_content->>'custom_url' AS custom_url,
       co.current_content->>'parent_id'  AS parent_id,
       co.current_content->>'is_cabinet' AS is_cabinet
FROM thanka t
LEFT JOIN cogobject co ON co.thanka_id = t.thanka_id
WHERE co.current_content->>'custom_url' ILIKE '%warhammer%'
   OR t.title ILIKE '%warhammer%';
"

echo
echo "=== 3. Кабинет test_login_001 ==="
psql_q "
SELECT t.thanka_id::text AS cabinet_id,
       t.title,
       a.author_id::text AS author_id,
       a.subject_id::text AS subject_id
FROM thanka t
JOIN author a ON a.author_id = t.author_id
JOIN avatar av ON av.author_id = a.author_id
JOIN cogobject co ON co.thanka_id = t.thanka_id
WHERE av.login = 'test_login_001'
  AND (co.current_content->>'is_cabinet')::boolean IS TRUE;
"

echo
echo "=== 4. Все тханки test_login_001 со ссылкой на parent ==="
psql_q "
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
ORDER BY t.created_at ASC;
"

echo
echo "=== 5. Поиск MPG/Warhammer ШИРОКО (без фильтра по схеме/автору) ==="
psql_q "
SELECT t.thanka_id::text AS id,
       t.title,
       a.author_id::text AS author_id,
       (SELECT av.login FROM avatar av WHERE av.author_id = a.author_id LIMIT 1) AS login,
       co.current_content->>'custom_url' AS custom_url,
       co.current_content->>'parent_id'  AS parent_id,
       t.created_at::text AS created
FROM thanka t
LEFT JOIN author a ON a.author_id = t.author_id
LEFT JOIN cogobject co ON co.thanka_id = t.thanka_id
WHERE (co.current_content->>'custom_url') IN ('MPG','WarhammerTheOldWorld','Warhammer','warhammer','mpg')
   OR t.title ILIKE '%warhammer%'
   OR t.title ILIKE '%matched%'
ORDER BY t.created_at DESC
LIMIT 50;
"
