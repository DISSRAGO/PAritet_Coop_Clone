#!/usr/bin/env bash
# Диагностика: у test_login_001 в БД найдены ДВА разных subject_id.
# v3: используем stdin вместо `-c` потому что psql при многострочном `-c`
# выводит только результат ПОСЛЕДНЕГО statement. SET search_path в начале
# работает, но результаты SELECT'ов которые шли после SET — теряются.

set -euo pipefail

DB="${DB:-postgresql://homonet_app_auth:REMOVED@127.0.0.1:5432/homonet_v051_test}"
LOGIN="${LOGIN:-test_login_001}"
SUBJ_A="3419135c-ee62-4567-94b9-d83c3c812578"
SUBJ_B="dac9c63a-1ee1-4168-8717-500da7985ac7"

psql_q() {
  PGCLIENTENCODING=UTF8 psql "$DB" -v ON_ERROR_STOP=1 --pset=footer=off <<SQL
SET search_path TO homonet, public;
$1
SQL
}

echo "=== 1. auth_user для логина '$LOGIN' (ОДИН РЯД ИЛИ НЕСКОЛЬКО?) ==="
psql_q "
SELECT user_id::text, login, person_id::text, subject_id::text, is_active, created_at
FROM auth_user
WHERE login = '$LOGIN'
ORDER BY created_at;
"

echo ""
echo "=== 2. Все author-ряды для логина (через avatar.login) ==="
psql_q "
SELECT a.author_id::text, a.subject_id::text, a.display_name, a.created_at AS author_created, av.login, av.status AS avatar_status
FROM author a
LEFT JOIN avatar av ON av.author_id = a.author_id
WHERE av.login = '$LOGIN'
ORDER BY a.created_at;
"

echo ""
echo "=== 3. Все subject где login совпадает (через auth_user.subject_id и через author.subject_id) ==="
psql_q "
SELECT DISTINCT s.subject_id::text, s.subject_kind, s.display_name, s.person_id::text, s.created_at
FROM subject s
WHERE s.subject_id::text IN (
   SELECT subject_id::text FROM auth_user WHERE login = '$LOGIN' AND subject_id IS NOT NULL
   UNION
   SELECT a.subject_id::text FROM author a JOIN avatar av ON av.author_id = a.author_id WHERE av.login = '$LOGIN' AND a.subject_id IS NOT NULL
   UNION
   SELECT '$SUBJ_A'::text UNION SELECT '$SUBJ_B'::text
)
ORDER BY s.created_at;
"

echo ""
echo "=== 4. Кабинет для каждого из двух subject ==="
psql_q "
SELECT t.thanka_id::text, t.title, a.subject_id::text,
       (co.current_content->>'is_cabinet')::text AS is_cab,
       co.current_content->>'parent_id' AS parent_id
FROM thanka t
JOIN author a ON a.author_id = t.author_id
LEFT JOIN cogobject co ON co.thanka_id = t.thanka_id
WHERE a.subject_id::text IN ('$SUBJ_A', '$SUBJ_B')
  AND (co.current_content->>'is_cabinet')::boolean IS TRUE
ORDER BY a.subject_id, t.created_at;
"

echo ""
echo "=== 5. ВСЕ тханки для каждого subject (Warhammer/MPG/etc) ==="
psql_q "
SELECT t.thanka_id::text, t.title, a.subject_id::text, a.author_id::text,
       co.current_content->>'parent_id' AS parent_id,
       (co.current_content->>'is_cabinet')::text AS is_cab
FROM thanka t
JOIN author a ON a.author_id = t.author_id
LEFT JOIN cogobject co ON co.thanka_id = t.thanka_id
WHERE a.subject_id::text IN ('$SUBJ_A', '$SUBJ_B')
ORDER BY a.subject_id, t.created_at;
"

echo ""
echo "=== 6. Avatar-ряды для двух subject ==="
psql_q "
SELECT av.avatar_id::text, av.author_id::text, av.login, av.status AS av_status, a.subject_id::text
FROM avatar av
JOIN author a ON a.author_id = av.author_id
WHERE a.subject_id::text IN ('$SUBJ_A', '$SUBJ_B')
ORDER BY a.subject_id;
"

echo ""
echo "=== 7. Subject-ряды для двух subject (personal/community/organization) ==="
psql_q "
SELECT s.subject_id::text, s.subject_kind, s.person_id::text, s.organization_id::text, s.community_id::text,
       p.display_name AS person_name, s.display_name AS subj_name, s.created_at
FROM subject s
LEFT JOIN person p ON p.person_id = s.person_id
WHERE s.subject_id::text IN ('$SUBJ_A', '$SUBJ_B');
"

echo ""
echo "=== 8. ВЫВОД ==="
echo "  - Если в (1) ровно один auth_user — то 'правильный' subject_id это тот что в auth_user.subject_id."
echo "  - Если в (4) есть кабинет ТОЛЬКО для одного subject — второй subject это сирота."
echo "  - Если в (7) у обоих subject один и тот же person_id — нарушение UNIQUE (по идее невозможно)."
echo "  - Если subject_kind у второго subject != 'personal' — это organization или community subject."
