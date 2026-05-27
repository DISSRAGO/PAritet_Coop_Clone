SET search_path TO homonet, public;

CREATE TABLE IF NOT EXISTS auth_session (
    session_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth_user(user_id) ON DELETE CASCADE,

    refresh_token_hash text NOT NULL,
    user_agent text,
    ip_address inet,

    created_at timestamptz NOT NULL DEFAULT now(),
    expires_at timestamptz NOT NULL,
    revoked_at timestamptz,

    CHECK (refresh_token_hash <> ''),
    CHECK (expires_at > created_at)
);

CREATE INDEX IF NOT EXISTS idx_auth_session_user_id_v1
    ON auth_session(user_id);

CREATE INDEX IF NOT EXISTS idx_auth_session_expires_at_v1
    ON auth_session(expires_at);

CREATE INDEX IF NOT EXISTS idx_auth_session_revoked_at_v1
    ON auth_session(revoked_at);