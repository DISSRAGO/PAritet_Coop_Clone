#!/bin/bash
# Диагностика: к каким author_id привязаны MPG, Warhammer, WoC;
# совпадают ли их subject_id; есть ли дубли author-рядов у одного subject.

set -e

if [ -z "${DATABASE_URL:-}" ] && [ -f ".env" ]; then
  # shellcheck disable=SC1091
  set -a; . ./.env; set +a
fi

DB="${DATABASE_URL:?DATABASE_URL не задан}"

psql_q() {
  PGCLIENTENCODING=UTF8 psql "$DB" -v ON_ERROR_STOP=1 --pset=footer=off -c "
    SET search_path TO homonet, public;
    $1
  "
}

echo "=== 1. Авторы, на которых ссылаются три тханки ==="
psql_q "
SELECT t.thanka_id::text       AS thanka_id,
       t.title,
       a.author_id::text       AS author_id,
       a.subject_id::text      AS subject_id,
       a.display_name           AS display_name,
       a.created_at::text       AS author_created
FROM thanka t
LEFT JOIN author a ON a.author_id = t.author_id
WHERE t.thanka_id::text IN (
    'd2a2ab11-3244-48ae-be74-ba85ba80f6f2',   -- MPG
    'b743a1ea-72ac-476b-b0b9-bf9dbc919863',   -- Warhammer
    '70c2015f-2d03-4f7d-aad8-3b96e4b1d7de',   -- WoC
    'c24d417d-3f62-4521-b19e-e8eaf4d10fb0'    -- кабинет
)
ORDER BY t.created_at;
"

echo
echo "=== 2. Все author-ряды для subject_id юзера test_login_001 ==="
psql_q "
SELECT a.author_id::text   AS author_id,
       a.subject_id::text  AS subject_id,
       a.display_name       AS display_name,
       a.created_at::text   AS created
FROM author a
WHERE a.subject_id::text = '3419135c-6d74-4f7c-8e31-00b719e12578'
ORDER BY a.created_at;
"

echo
echo "=== 3. Avatar test_login_001 — на какой author_id ссылается ==="
psql_q "
SELECT av.avatar_id::text       AS avatar_id,
       av.login,
       av.author_id::text       AS author_id,
       av.status,
       av.created_at::text       AS created
FROM avatar av
WHERE av.login = 'test_login_001';
"

echo
echo "=== 4. auth_user.subject_id юзера ==="
psql_q "
SELECT user_id::text         AS user_id,
       login,
       subject_id::text       AS subject_id,
       is_active,
       created_at::text       AS created
FROM auth_user
WHERE login = 'test_login_001';
"

echo
echo "=== 5. Все тханки этого subject_id (через JOIN на author.subject_id) ==="
psql_q "
SELECT t.thanka_id::text         AS id,
       t.title,
       t.author_id::text          AS author_id,
       co.current_content->>'custom_url' AS custom_url,
       co.current_content->>'parent_id'  AS parent_id,
       co.current_content->>'is_cabinet' AS is_cabinet,
       t.status,
       t.created_at::text         AS created
FROM thanka t
JOIN author a ON a.author_id = t.author_id
LEFT JOIN cogobject co ON co.thanka_id = t.thanka_id
WHERE a.subject_id::text = '3419135c-6d74-4f7c-8e31-00b719e12578'
  AND t.status <> 'deleted'
ORDER BY t.created_at ASC;
"
