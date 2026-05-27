BEGIN;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'homonet_owner') THEN
        CREATE ROLE homonet_owner LOGIN PASSWORD 'CHANGE_ME_OWNER_STRONG';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'homonet_app_auth') THEN
        CREATE ROLE homonet_app_auth LOGIN PASSWORD 'CHANGE_ME_APP_STRONG';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'homonet_master_admin') THEN
        CREATE ROLE homonet_master_admin LOGIN PASSWORD 'CHANGE_ME_ADMIN_STRONG';
    END IF;
END $$;

REVOKE ALL ON DATABASE homonet_v051_test FROM PUBLIC;
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM PUBLIC;

GRANT CONNECT ON DATABASE homonet_v051_test TO homonet_owner;
GRANT CONNECT ON DATABASE homonet_v051_test TO homonet_app_auth;
GRANT CONNECT ON DATABASE homonet_v051_test TO homonet_master_admin;

GRANT USAGE ON SCHEMA homonet TO homonet_app_auth;
GRANT USAGE ON SCHEMA homonet TO homonet_master_admin;
GRANT USAGE, CREATE ON SCHEMA homonet TO homonet_owner;

ALTER SCHEMA homonet OWNER TO homonet_owner;

GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA homonet TO homonet_app_auth;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA homonet TO homonet_master_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA homonet TO homonet_owner;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA homonet TO homonet_app_auth;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA homonet TO homonet_master_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA homonet TO homonet_owner;

ALTER DEFAULT PRIVILEGES FOR ROLE homonet_owner IN SCHEMA homonet
GRANT SELECT, INSERT, UPDATE ON TABLES TO homonet_app_auth;

ALTER DEFAULT PRIVILEGES FOR ROLE homonet_owner IN SCHEMA homonet
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO homonet_master_admin;

ALTER DEFAULT PRIVILEGES FOR ROLE homonet_owner IN SCHEMA homonet
GRANT USAGE, SELECT ON SEQUENCES TO homonet_app_auth;

ALTER DEFAULT PRIVILEGES FOR ROLE homonet_owner IN SCHEMA homonet
GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO homonet_master_admin;

COMMIT;