SET search_path TO homonet, public;

CREATE TABLE IF NOT EXISTS auth_user (
    user_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    person_id uuid REFERENCES person(person_id) ON DELETE SET NULL,
    subject_id uuid REFERENCES subject(subject_id) ON DELETE SET NULL,
    author_id uuid REFERENCES author(author_id) ON DELETE SET NULL,

    login citext NOT NULL UNIQUE,
    email citext UNIQUE,
    phone text UNIQUE,
    password_hash text NOT NULL,

    is_active boolean NOT NULL DEFAULT true,
    is_superuser boolean NOT NULL DEFAULT false,
    is_verified boolean NOT NULL DEFAULT false,

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    CHECK (login <> ''),
    CHECK (password_hash <> '')
);

CREATE INDEX IF NOT EXISTS idx_auth_user_person_id_v1
    ON auth_user(person_id);

CREATE INDEX IF NOT EXISTS idx_auth_user_subject_id_v1
    ON auth_user(subject_id);

CREATE INDEX IF NOT EXISTS idx_auth_user_author_id_v1
    ON auth_user(author_id);

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