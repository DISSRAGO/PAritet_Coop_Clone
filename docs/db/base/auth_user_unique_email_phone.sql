-- /srv/clone/docs/db/base/auth_user_unique_email_phone.sql

DO $$
BEGIN
    IF NOT has_schema_privilege(current_user, 'homonet', 'USAGE') THEN
        RAISE EXCEPTION 'Current user (%) has no USAGE privilege on schema homonet', current_user;
    END IF;

    IF NOT has_table_privilege(current_user, 'homonet.auth_user', 'SELECT') THEN
        RAISE EXCEPTION 'Current user (%) has no SELECT privilege on homonet.auth_user', current_user;
    END IF;

    IF NOT has_table_privilege(current_user, 'homonet.auth_user', 'UPDATE') THEN
        RAISE EXCEPTION 'Current user (%) has no UPDATE privilege on homonet.auth_user', current_user;
    END IF;
END $$;

BEGIN;

UPDATE homonet.auth_user
SET email = lower(trim(email))
WHERE email IS NOT NULL
  AND email <> lower(trim(email));

CREATE OR REPLACE FUNCTION homonet.normalize_phone(raw_phone text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    value text;
BEGIN
    IF raw_phone IS NULL THEN
        RETURN NULL;
    END IF;

    value := regexp_replace(trim(raw_phone), '[^0-9+]', '', 'g');

    IF value ~ '^8[0-9]{10}$' THEN
        value := '+7' || substr(value, 2);
    ELSIF value ~ '^7[0-9]{10}$' THEN
        value := '+' || value;
    END IF;

    RETURN NULLIF(value, '');
END;
$$;

UPDATE homonet.auth_user
SET phone = homonet.normalize_phone(phone)
WHERE phone IS NOT NULL
  AND phone IS DISTINCT FROM homonet.normalize_phone(phone);

DO $$
BEGIN
    IF EXISTS (
        SELECT email
        FROM homonet.auth_user
        WHERE email IS NOT NULL
        GROUP BY email
        HAVING count(*) > 1
    ) THEN
        RAISE EXCEPTION 'Duplicate email values exist in homonet.auth_user';
    END IF;

    IF EXISTS (
        SELECT phone
        FROM homonet.auth_user
        WHERE phone IS NOT NULL
        GROUP BY phone
        HAVING count(*) > 1
    ) THEN
        RAISE EXCEPTION 'Duplicate phone values exist in homonet.auth_user';
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS ux_auth_user_login_v051
    ON homonet.auth_user (login);

CREATE UNIQUE INDEX IF NOT EXISTS ux_auth_user_email_v051
    ON homonet.auth_user (email)
    WHERE email IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ux_auth_user_phone_v051
    ON homonet.auth_user (phone)
    WHERE phone IS NOT NULL;

COMMIT;