#!/usr/bin/env bash
# Фикс data inconsistency: у test_login_001 в БД два разных subject_id.
# Правильный: dac9c63a (в auth_user.subject_id).
# Сирота:    3419135c (от старой регистрации / миграции).
#
# Старые тханки (Warhammer/Cabinet/WoC) НЕ удаляем, переносим author_id на
# правильный author. Старый author/avatar/subject/person — сносим.
#
# Запуск:
#   bash scripts/diag/fix_two_subjects.sh         # dry-run, печатает план
#   APPLY=1 bash scripts/diag/fix_two_subjects.sh # реально применяет в транзакции

set -euo pipefail

# DB: для READ хватает homonet_app_auth, но для WRITE на avatar/author/subject/person
# нужен владелец схемы. Используем sudo -u postgres для apply.
DB_READ="${DB_READ:-postgresql://homonet_app_auth:73prKjwu952@127.0.0.1:5432/homonet_v051_test}"
APPLY="${APPLY:-0}"

# Правильные (из auth_user)
NEW_SUBJ="dac9c63a-1ee1-4168-8717-500da7985ac7"
NEW_AUTHOR="b16eb45b-5ae9-47b0-9bc9-314ab084b6f6"
NEW_PERSON="9b95f77f-e21c-45e2-bbcd-6d2a40aa62e3"

# Сироты (от старой регистрации)
OLD_SUBJ="3419135c-6d74-4f7c-8e31-00b719e12578"
OLD_AUTHOR="d7da7179-3fc3-4326-bca1-c1afcbe27996"
OLD_PERSON="1d4eb42f-cc4b-4cac-a2a3-643e97612904"

LOGIN="test_login_001"

psql_q() {
  PGCLIENTENCODING=UTF8 psql "$DB_READ" -v ON_ERROR_STOP=1 --pset=footer=off <<SQL
SET search_path TO homonet, public;
$1
SQL
}

echo "=== ШАГ 0. Pre-flight: посчитать что переносим ==="
psql_q "
SELECT 'thanka на старом author' AS what, count(*) AS cnt
FROM thanka WHERE author_id::text = '$OLD_AUTHOR'
UNION ALL
SELECT 'avatar старого author', count(*) FROM avatar WHERE author_id::text = '$OLD_AUTHOR'
UNION ALL
SELECT 'avatar нового author',  count(*) FROM avatar WHERE author_id::text = '$NEW_AUTHOR'
UNION ALL
SELECT 'auth_user.author_id ссылается на старого?', count(*)
FROM auth_user WHERE author_id::text = '$OLD_AUTHOR';
"

echo ""
echo "=== ПЛАН (SQL который будет выполнен) ==="
cat <<'PLAN'
BEGIN;
SET search_path TO homonet, public;

-- 1. Перенос тханок со старого author на новый.
UPDATE thanka SET author_id = :'NEW_AUTHOR'::uuid
WHERE author_id = :'OLD_AUTHOR'::uuid;

-- 2. Снять FK auth_user.author_id со старого (если ссылается).
UPDATE auth_user SET author_id = :'NEW_AUTHOR'::uuid, updated_at = now()
WHERE author_id = :'OLD_AUTHOR'::uuid AND login = :'LOGIN';

-- 3. Удалить старый avatar (он держит UNIQUE по login и мешает новому появиться).
DELETE FROM avatar WHERE author_id = :'OLD_AUTHOR'::uuid;

-- 4. Если у нового author нет avatar — создать.
INSERT INTO avatar (author_id, person_id, login, status)
SELECT :'NEW_AUTHOR'::uuid, :'NEW_PERSON'::uuid, :'LOGIN', 'active'
WHERE NOT EXISTS (
   SELECT 1 FROM avatar WHERE author_id = :'NEW_AUTHOR'::uuid
);

-- 5. Удалить старого author (теперь без тханок и avatar).
DELETE FROM author WHERE author_id = :'OLD_AUTHOR'::uuid;

-- 6. Удалить старый subject (если на него больше никто не ссылается).
DELETE FROM subject
WHERE subject_id = :'OLD_SUBJ'::uuid
  AND NOT EXISTS (
    SELECT 1 FROM author  WHERE subject_id = :'OLD_SUBJ'::uuid UNION ALL
    SELECT 1 FROM auth_user WHERE subject_id = :'OLD_SUBJ'::uuid
  );

-- 7. Удалить старого person (если на него больше никто не ссылается).
DELETE FROM person
WHERE person_id = :'OLD_PERSON'::uuid
  AND NOT EXISTS (
    SELECT 1 FROM subject    WHERE person_id = :'OLD_PERSON'::uuid UNION ALL
    SELECT 1 FROM auth_user  WHERE person_id = :'OLD_PERSON'::uuid UNION ALL
    SELECT 1 FROM avatar     WHERE person_id = :'OLD_PERSON'::uuid
  );

COMMIT;
PLAN

echo ""
if [ "$APPLY" != "1" ]; then
  echo "=== DRY-RUN ==="
  echo "Чтобы применить: APPLY=1 bash scripts/diag/fix_two_subjects.sh"
  exit 0
fi

echo "=== ПРИМЕНЯЮ В ТРАНЗАКЦИИ (через sudo -u postgres) ==="
if ! command -v sudo >/dev/null; then
  echo "ОШИБКА: sudo не найден. Запусти скрипт от имени postgres вручную."
  exit 1
fi
sudo -u postgres env PGCLIENTENCODING=UTF8 psql \
  "postgresql:///homonet_v051_test?user=postgres" \
  -v ON_ERROR_STOP=1 --pset=footer=off \
  -v NEW_AUTHOR="$NEW_AUTHOR" -v OLD_AUTHOR="$OLD_AUTHOR" \
  -v NEW_PERSON="$NEW_PERSON" -v OLD_PERSON="$OLD_PERSON" \
  -v OLD_SUBJ="$OLD_SUBJ" -v LOGIN="$LOGIN" <<'SQL'
BEGIN;
SET search_path TO homonet, public;

-- 1. Перенос тханок
UPDATE thanka SET author_id = :'NEW_AUTHOR'::uuid
WHERE author_id = :'OLD_AUTHOR'::uuid;

-- 2. auth_user.author_id, если ссылался на старого
UPDATE auth_user SET author_id = :'NEW_AUTHOR'::uuid, updated_at = now()
WHERE author_id = :'OLD_AUTHOR'::uuid AND login = :'LOGIN';

-- 3. Удалить старый avatar
DELETE FROM avatar WHERE author_id = :'OLD_AUTHOR'::uuid;

-- 4. Создать avatar для нового author, если нет
INSERT INTO avatar (author_id, person_id, login, status)
SELECT :'NEW_AUTHOR'::uuid, :'NEW_PERSON'::uuid, :'LOGIN', 'active'
WHERE NOT EXISTS (
   SELECT 1 FROM avatar WHERE author_id = :'NEW_AUTHOR'::uuid
);

-- 5. Удалить старого author
DELETE FROM author WHERE author_id = :'OLD_AUTHOR'::uuid;

-- 6. Удалить старый subject
DELETE FROM subject
WHERE subject_id = :'OLD_SUBJ'::uuid
  AND NOT EXISTS (
    SELECT 1 FROM author    WHERE subject_id = :'OLD_SUBJ'::uuid UNION ALL
    SELECT 1 FROM auth_user WHERE subject_id = :'OLD_SUBJ'::uuid
  );

-- 7. Удалить старого person
DELETE FROM person
WHERE person_id = :'OLD_PERSON'::uuid
  AND NOT EXISTS (
    SELECT 1 FROM subject   WHERE person_id = :'OLD_PERSON'::uuid UNION ALL
    SELECT 1 FROM auth_user WHERE person_id = :'OLD_PERSON'::uuid UNION ALL
    SELECT 1 FROM avatar    WHERE person_id = :'OLD_PERSON'::uuid
  );

COMMIT;
SQL

echo ""
echo "=== POST-CHECK: всё ли сошлось ==="
psql_q "
SELECT 'thanka на новом author' AS what, count(*) AS cnt
FROM thanka WHERE author_id::text = '$NEW_AUTHOR'
UNION ALL
SELECT 'старый author остался?', count(*) FROM author WHERE author_id::text = '$OLD_AUTHOR'
UNION ALL
SELECT 'старый subject остался?', count(*) FROM subject WHERE subject_id::text = '$OLD_SUBJ'
UNION ALL
SELECT 'старый person остался?', count(*) FROM person WHERE person_id::text = '$OLD_PERSON'
UNION ALL
SELECT 'avatar для нового author', count(*) FROM avatar WHERE author_id::text = '$NEW_AUTHOR';
"
