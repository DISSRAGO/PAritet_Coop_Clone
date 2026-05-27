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
    is_verified boolean NOT NULL DEFAULT true,

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