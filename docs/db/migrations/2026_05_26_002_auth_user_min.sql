SET search_path TO homonet, public;

CREATE TABLE IF NOT EXISTS auth_user (
    user_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    login citext NOT NULL UNIQUE,
    email citext NOT NULL UNIQUE,
    phone text NOT NULL UNIQUE,
    password_hash text NOT NULL,
    is_confirmed boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
);