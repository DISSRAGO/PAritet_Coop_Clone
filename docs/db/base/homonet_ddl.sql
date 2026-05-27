-- ============================================================
-- DDL V0.51 — КЛОН HomoNet
-- Канонический PostgreSQL-слой для ER V0.51
-- Единая версия без внешнего патча
-- Интегрировано в мастер-чат: добавлены отсутствующие таблицы
-- contribution и recognition, которые были заявлены в DDL canvas
-- и уже имели индексы в исходном SQL.
-- ============================================================

CREATE SCHEMA IF NOT EXISTS homonet;
SET search_path TO homonet, public;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

-- ============================================================
-- 0. ENUMS / DOMAINS
-- ============================================================

DO $$ BEGIN
  CREATE TYPE subject_kind_enum AS ENUM ('personal','organizational','collective');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE person_status_enum AS ENUM ('draft','active','paused','left','blocked');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE organization_status_enum AS ENUM ('draft','active','paused','closed','archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE community_type_enum AS ENUM ('KLUB','KOOP','KUST','DELO','SOYUZ','INFO');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE community_status_enum AS ENUM ('draft','active','paused','closed','archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE membership_status_enum AS ENUM ('active','paused','left');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE role_scope_enum AS ENUM ('community','process','pirda_case');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE role_status_enum AS ENUM ('active','revoked','expired');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE process_status_enum AS ENUM ('draft','active','paused','done','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE contribution_type_enum AS ENUM ('labor','money','asset','knowledge','organization','reputation','service','time');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE contribution_status_enum AS ENUM ('proposed','recognized','rejected','disputed','submitted','accepted','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE recognition_type_enum AS ENUM ('rating','payment','reputation','right','share_allocation','trust','privilege');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE decision_status_enum AS ENUM ('draft','open','closed','approved','rejected','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE vote_choice_enum AS ENUM ('yes','no','abstain','veto');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE rule_status_enum AS ENUM ('draft','active','deprecated','archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE protocol_status_enum AS ENUM ('draft','active','deprecated','archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE conflict_status_enum AS ENUM ('open','in_review','resolved','closed','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE account_status_enum AS ENUM ('active','blocked','closed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE asset_type_enum AS ENUM ('thing','service','right','digital','knowledge','infrastructure','money_equivalent');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE owner_mode_enum AS ENUM ('personal','community','cooperative','functional','mixed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE listing_status_enum AS ENUM ('draft','published','reserved','closed','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE deal_status_enum AS ENUM ('draft','agreed','paid','fulfilled','disputed','cancelled','closed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE thanka_status_enum AS ENUM ('draft','active','archived','deleted');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE cogobject_state_enum AS ENUM ('draft','published','frozen','archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE pirda_case_status_enum AS ENUM ('new','active','paused','closed','archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE pirda_step_code_enum AS ENUM ('P','I','R','N','D','V','O','A');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE pirda_step_status_enum AS ENUM ('planned','active','done','skipped','reopened');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE skp_profile_status_enum AS ENUM ('draft','active','archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE skp_alert_status_enum AS ENUM ('new','acknowledged','in_progress','resolved','ignored');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 1. PLATFORM / GENOTYPE / MEMORY ROOT
-- ============================================================

CREATE TABLE IF NOT EXISTS platform (
    platform_id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_version  text NOT NULL,
    genotype_profile  text NOT NULL,
    created_at        timestamptz NOT NULL DEFAULT now(),
    CHECK (platform_version <> ''),
    CHECK (genotype_profile <> '')
);

CREATE TABLE IF NOT EXISTS genotype (
    genotype_id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code              text NOT NULL UNIQUE,
    name              text NOT NULL,
    description       text,
    status            text NOT NULL DEFAULT 'draft',
    created_at        timestamptz NOT NULL DEFAULT now(),
    CHECK (code <> ''),
    CHECK (name <> '')
);

CREATE TABLE IF NOT EXISTS genotype_version (
    genotype_version_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    genotype_id         uuid NOT NULL REFERENCES genotype(genotype_id) ON DELETE CASCADE,
    version             text NOT NULL,
    published_at        timestamptz,
    changelog           text,
    is_current          boolean NOT NULL DEFAULT false,
    UNIQUE (genotype_id, version),
    CHECK (version <> '')
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_genotype_version_current_v051
    ON genotype_version(genotype_id)
    WHERE is_current;

CREATE TABLE IF NOT EXISTS principle (
    principle_id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code              text NOT NULL UNIQUE,
    name              text NOT NULL,
    definition        text NOT NULL,
    source_note       text,
    CHECK (code <> ''),
    CHECK (name <> ''),
    CHECK (definition <> '')
);

CREATE TABLE IF NOT EXISTS invariant (
    invariant_id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code              text NOT NULL UNIQUE,
    statement         text NOT NULL,
    severity          text NOT NULL DEFAULT 'must',
    rationale         text,
    CHECK (code <> ''),
    CHECK (statement <> '')
);

CREATE TABLE IF NOT EXISTS institutional_event (
    event_id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type        text NOT NULL,
    entity_type       text,
    entity_id         uuid,
    actor_subject_id  uuid,
    payload           jsonb NOT NULL DEFAULT '{}'::jsonb,
    recorded_at       timestamptz NOT NULL DEFAULT now(),
    CHECK (event_type <> '')
);

CREATE TABLE IF NOT EXISTS change_control (
    change_id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    change_type       text NOT NULL,
    target_type       text NOT NULL,
    target_id         uuid,
    description       text NOT NULL,
    requested_by_subject_id uuid,
    status            text NOT NULL DEFAULT 'draft',
    created_at        timestamptz NOT NULL DEFAULT now(),
    applied_at        timestamptz,
    CHECK (change_type <> ''),
    CHECK (target_type <> ''),
    CHECK (description <> '')
);

CREATE TABLE IF NOT EXISTS klon (
    klon_id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_id        uuid NOT NULL REFERENCES platform(platform_id) ON DELETE RESTRICT,
    name               text NOT NULL,
    scope              text NOT NULL,
    status             text NOT NULL DEFAULT 'draft',
    owner_community_id uuid,
    created_at         timestamptz NOT NULL DEFAULT now(),
    CHECK (name <> ''),
    CHECK (scope <> '')
);

-- ============================================================
-- 2. SUBJECT MODEL
-- ============================================================

CREATE TABLE IF NOT EXISTS person (
    person_id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    display_name    text NOT NULL,
    status          person_status_enum NOT NULL DEFAULT 'draft',
    created_at      timestamptz NOT NULL DEFAULT now(),
    CHECK (display_name <> '')
);

CREATE TABLE IF NOT EXISTS person_profile (
    profile_id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id       uuid NOT NULL UNIQUE REFERENCES person(person_id) ON DELETE CASCADE,
    birth_date      date,
    address         text,
    phone           text,
    email           citext,
    meta_json       jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS organization (
    organization_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name            text NOT NULL,
    owner_person_id uuid REFERENCES person(person_id) ON DELETE SET NULL,
    status          organization_status_enum NOT NULL DEFAULT 'draft',
    registration_ref text,
    created_at      timestamptz NOT NULL DEFAULT now(),
    CHECK (name <> '')
);

CREATE TABLE IF NOT EXISTS community (
    community_id     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    home_klon_id     uuid NOT NULL REFERENCES klon(klon_id) ON DELETE RESTRICT,
    community_type   community_type_enum NOT NULL,
    name             text NOT NULL,
    purpose          text,
    status           community_status_enum NOT NULL DEFAULT 'draft',
    created_at       timestamptz NOT NULL DEFAULT now(),
    CHECK (name <> '')
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_klon_owner_community_v051'
    ) THEN
        ALTER TABLE klon
        ADD CONSTRAINT fk_klon_owner_community_v051
        FOREIGN KEY (owner_community_id)
        REFERENCES community(community_id)
        ON DELETE SET NULL;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS subject (
    subject_id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_kind     subject_kind_enum NOT NULL,
    person_id        uuid UNIQUE REFERENCES person(person_id) ON DELETE CASCADE,
    organization_id  uuid UNIQUE REFERENCES organization(organization_id) ON DELETE CASCADE,
    community_id     uuid UNIQUE REFERENCES community(community_id) ON DELETE CASCADE,
    display_name     text NOT NULL,
    status           text NOT NULL DEFAULT 'active',
    created_at       timestamptz NOT NULL DEFAULT now(),
    CHECK (display_name <> ''),
    CHECK (((person_id IS NOT NULL)::int + (organization_id IS NOT NULL)::int + (community_id IS NOT NULL)::int) = 1),
    CHECK (
        (subject_kind = 'personal' AND person_id IS NOT NULL) OR
        (subject_kind = 'organizational' AND organization_id IS NOT NULL) OR
        (subject_kind = 'collective' AND community_id IS NOT NULL)
    )
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_institutional_event_actor_subject_v051'
    ) THEN
        ALTER TABLE institutional_event
        ADD CONSTRAINT fk_institutional_event_actor_subject_v051
        FOREIGN KEY (actor_subject_id)
        REFERENCES subject(subject_id)
        ON DELETE SET NULL;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_change_control_requested_by_subject_v051'
    ) THEN
        ALTER TABLE change_control
        ADD CONSTRAINT fk_change_control_requested_by_subject_v051
        FOREIGN KEY (requested_by_subject_id)
        REFERENCES subject(subject_id)
        ON DELETE SET NULL;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS subject_representative (
    subject_representative_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id                uuid NOT NULL REFERENCES subject(subject_id) ON DELETE CASCADE,
    person_id                 uuid NOT NULL REFERENCES person(person_id) ON DELETE CASCADE,
    representation_role       text NOT NULL,
    authority_basis           text,
    authority_document_ref    text,
    starts_at                 timestamptz NOT NULL DEFAULT now(),
    ends_at                   timestamptz,
    status                    text NOT NULL DEFAULT 'active',
    created_at                timestamptz NOT NULL DEFAULT now(),
    CHECK (representation_role <> ''),
    CHECK (ends_at IS NULL OR ends_at > starts_at)
);

CREATE TABLE IF NOT EXISTS membership (
    membership_id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id       uuid NOT NULL REFERENCES person(person_id) ON DELETE CASCADE,
    community_id    uuid NOT NULL REFERENCES community(community_id) ON DELETE CASCADE,
    joined_at       timestamptz NOT NULL DEFAULT now(),
    status          membership_status_enum NOT NULL DEFAULT 'active',
    left_at         timestamptz,
    CHECK (left_at IS NULL OR left_at >= joined_at)
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_membership_active_person_community_v051
    ON membership(person_id, community_id)
    WHERE status = 'active';

-- ============================================================
-- 3. GOVERNANCE / PROCESS / CONFLICT
-- ============================================================

CREATE TABLE IF NOT EXISTS process (
    process_id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id          uuid NOT NULL REFERENCES community(community_id) ON DELETE CASCADE,
    name                  text NOT NULL,
    goal                  text NOT NULL,
    process_type          text,
    status                process_status_enum NOT NULL DEFAULT 'draft',
    created_at            timestamptz NOT NULL DEFAULT now(),
    CHECK (name <> ''),
    CHECK (goal <> '')
);

CREATE TABLE IF NOT EXISTS decision_procedure (
    procedure_id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id          uuid NOT NULL REFERENCES community(community_id) ON DELETE CASCADE,
    name                  text NOT NULL,
    stages                jsonb NOT NULL DEFAULT '[]'::jsonb,
    quorum_rule           jsonb NOT NULL DEFAULT '{}'::jsonb,
    passing_rule          jsonb NOT NULL DEFAULT '{}'::jsonb,
    visibility            text,
    CHECK (name <> '')
);

CREATE TABLE IF NOT EXISTS decision (
    decision_id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id          uuid NOT NULL REFERENCES community(community_id) ON DELETE CASCADE,
    decision_type         text NOT NULL,
    title                 text NOT NULL,
    body                  text,
    status                decision_status_enum NOT NULL DEFAULT 'draft',
    proposed_by_subject_id uuid NOT NULL REFERENCES subject(subject_id) ON DELETE RESTRICT,
    procedure_id          uuid REFERENCES decision_procedure(procedure_id) ON DELETE SET NULL,
    proposed_at           timestamptz NOT NULL DEFAULT now(),
    accepted_at           timestamptz,
    effective_from        timestamptz,
    expires_at            timestamptz,
    supersedes_decision_id uuid REFERENCES decision(decision_id) ON DELETE SET NULL,
    CHECK (decision_type <> ''),
    CHECK (title <> ''),
    CHECK (expires_at IS NULL OR effective_from IS NULL OR expires_at > effective_from)
);

-- ------------------------------------------------------------
-- 3.1A. CONTRIBUTIONS / RECOGNITION
-- Добавлено при интеграции с canvas DDL V0.51:
-- в исходном SQL были индексы на contribution/recognition,
-- но сами таблицы отсутствовали.
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS contribution (
    contribution_id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    process_id               uuid NOT NULL REFERENCES process(process_id) ON DELETE CASCADE,
    contributor_subject_id   uuid NOT NULL REFERENCES subject(subject_id) ON DELETE RESTRICT,
    contribution_type        contribution_type_enum NOT NULL,
    description              text NOT NULL,
    evidence_ref             text,
    occurred_at              timestamptz,
    recorded_at              timestamptz NOT NULL DEFAULT now(),
    status                   contribution_status_enum NOT NULL DEFAULT 'submitted',
    value_estimate           numeric(18,6),
    recognition_decision_id  uuid REFERENCES decision(decision_id) ON DELETE SET NULL,
    CHECK (description <> ''),
    CHECK (value_estimate IS NULL OR value_estimate >= 0)
);

CREATE TABLE IF NOT EXISTS recognition (
    recognition_id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    contribution_id           uuid NOT NULL REFERENCES contribution(contribution_id) ON DELETE CASCADE,
    recognized_by_subject_id  uuid REFERENCES subject(subject_id) ON DELETE SET NULL,
    recognized_by_decision_id uuid REFERENCES decision(decision_id) ON DELETE SET NULL,
    recognition_type          recognition_type_enum NOT NULL,
    value                     numeric(18,6),
    unit                      text,
    created_at                timestamptz NOT NULL DEFAULT now(),
    CHECK (value IS NULL OR value >= 0),
    CHECK (
        recognized_by_subject_id IS NOT NULL
        OR recognized_by_decision_id IS NOT NULL
    )
);

CREATE TABLE IF NOT EXISTS vote (
    vote_id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    decision_id           uuid NOT NULL REFERENCES decision(decision_id) ON DELETE CASCADE,
    voter_subject_id      uuid NOT NULL REFERENCES subject(subject_id) ON DELETE RESTRICT,
    choice                vote_choice_enum NOT NULL,
    cast_at               timestamptz NOT NULL DEFAULT now(),
    weight                numeric(18,6) NOT NULL DEFAULT 1,
    comment               text,
    UNIQUE (decision_id, voter_subject_id),
    CHECK (weight >= 0)
);

CREATE TABLE IF NOT EXISTS rule (
    rule_id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id          uuid NOT NULL REFERENCES community(community_id) ON DELETE CASCADE,
    rule_key              text NOT NULL,
    version               integer NOT NULL CHECK (version >= 1),
    title                 text NOT NULL,
    rule_text             text NOT NULL,
    status                rule_status_enum NOT NULL DEFAULT 'draft',
    effective_from        timestamptz,
    effective_to          timestamptz,
    UNIQUE (community_id, rule_key, version),
    CHECK (rule_key <> ''),
    CHECK (title <> ''),
    CHECK (rule_text <> ''),
    CHECK (effective_to IS NULL OR effective_from IS NULL OR effective_to > effective_from)
);

CREATE TABLE IF NOT EXISTS protocol (
    protocol_id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id          uuid NOT NULL REFERENCES community(community_id) ON DELETE CASCADE,
    protocol_key          text NOT NULL,
    version               integer NOT NULL CHECK (version >= 1),
    name                  text NOT NULL,
    steps                 jsonb NOT NULL DEFAULT '[]'::jsonb,
    inputs                jsonb NOT NULL DEFAULT '{}'::jsonb,
    outputs               jsonb NOT NULL DEFAULT '{}'::jsonb,
    status                protocol_status_enum NOT NULL DEFAULT 'draft',
    UNIQUE (community_id, protocol_key, version),
    CHECK (protocol_key <> ''),
    CHECK (name <> '')
);

CREATE TABLE IF NOT EXISTS decision_effect (
    decision_effect_id    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    decision_id           uuid NOT NULL REFERENCES decision(decision_id) ON DELETE CASCADE,
    target_type           text NOT NULL,
    target_id             uuid,
    effect_type           text NOT NULL,
    recorded_at           timestamptz NOT NULL DEFAULT now(),
    CHECK (target_type <> ''),
    CHECK (effect_type <> '')
);

CREATE TABLE IF NOT EXISTS conflict (
    conflict_id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id            uuid NOT NULL REFERENCES community(community_id) ON DELETE CASCADE,
    opened_by_subject_id    uuid NOT NULL REFERENCES subject(subject_id) ON DELETE RESTRICT,
    conflict_type           text NOT NULL,
    summary                 text NOT NULL,
    opened_at               timestamptz NOT NULL DEFAULT now(),
    status                  conflict_status_enum NOT NULL DEFAULT 'open',
    resolution_protocol_id  uuid REFERENCES protocol(protocol_id) ON DELETE SET NULL,
    resolution_decision_id  uuid REFERENCES decision(decision_id) ON DELETE SET NULL,
    closed_at               timestamptz,
    CHECK (conflict_type <> ''),
    CHECK (summary <> '')
);

CREATE TABLE IF NOT EXISTS conflict_link (
    conflict_link_id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    conflict_id             uuid NOT NULL REFERENCES conflict(conflict_id) ON DELETE CASCADE,
    object_type             text NOT NULL,
    object_id               uuid,
    CHECK (object_type <> '')
);

-- ============================================================
-- 4. ECONOMY
-- ============================================================

CREATE TABLE IF NOT EXISTS account (
    account_id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_subject_id        uuid REFERENCES subject(subject_id) ON DELETE CASCADE,
    owner_community_id      uuid REFERENCES community(community_id) ON DELETE CASCADE,
    owner_fund_id           uuid,
    currency                text NOT NULL DEFAULT 'UNIT',
    balance                 numeric(18,6) NOT NULL DEFAULT 0,
    status                  account_status_enum NOT NULL DEFAULT 'active',
    clone_code              text,
    account_type            text,
    created_at              timestamptz NOT NULL DEFAULT now(),
    CHECK (((owner_subject_id IS NOT NULL)::int + (owner_community_id IS NOT NULL)::int + (owner_fund_id IS NOT NULL)::int) = 1)
);

CREATE TABLE IF NOT EXISTS asset (
    asset_id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_type              asset_type_enum NOT NULL,
    title                   text NOT NULL,
    owner_mode              owner_mode_enum NOT NULL,
    created_at              timestamptz NOT NULL DEFAULT now(),
    CHECK (title <> '')
);

CREATE TABLE IF NOT EXISTS listing (
    listing_id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id                uuid NOT NULL REFERENCES asset(asset_id) ON DELETE CASCADE,
    seller_subject_id       uuid REFERENCES subject(subject_id) ON DELETE SET NULL,
    seller_community_id     uuid REFERENCES community(community_id) ON DELETE SET NULL,
    price                   numeric(18,6),
    quantity                numeric(18,6),
    unit                    text,
    status                  listing_status_enum NOT NULL DEFAULT 'draft',
    created_at timestamptz NOT NULL DEFAULT now(),
    CHECK (price IS NULL OR price >= 0),
    CHECK (quantity IS NULL OR quantity >= 0),
    CHECK (((seller_subject_id IS NOT NULL)::int + (seller_community_id IS NOT NULL)::int) = 1)
);

CREATE TABLE IF NOT EXISTS deal (
    deal_id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id              uuid NOT NULL REFERENCES listing(listing_id) ON DELETE RESTRICT,
    supplier_subject_id     uuid NOT NULL REFERENCES subject(subject_id) ON DELETE RESTRICT,
    buyer_subject_id        uuid NOT NULL REFERENCES subject(subject_id) ON DELETE RESTRICT,
    quantity                numeric(18,6) NOT NULL,
    price                   numeric(18,6) NOT NULL,
    deal_sum                numeric(18,6) GENERATED ALWAYS AS (quantity * price) STORED,
    deal_date               timestamptz NOT NULL DEFAULT now(),
    finish_date             timestamptz,
    status                  deal_status_enum NOT NULL DEFAULT 'draft',
    CHECK (quantity > 0),
    CHECK (price >= 0),
    CHECK (supplier_subject_id <> buyer_subject_id)
);

CREATE TABLE IF NOT EXISTS account_txn (
    txn_id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    source_account_id       uuid NOT NULL REFERENCES account(account_id) ON DELETE RESTRICT,
    target_account_id       uuid NOT NULL REFERENCES account(account_id) ON DELETE RESTRICT,
    deal_id                 uuid REFERENCES deal(deal_id) ON DELETE SET NULL,
    amount                  numeric(18,6) NOT NULL,
    payment_date            timestamptz NOT NULL DEFAULT now(),
    initiator_subject_id    uuid REFERENCES subject(subject_id) ON DELETE SET NULL,
    CHECK (amount > 0),
    CHECK (source_account_id <> target_account_id)
);

CREATE TABLE IF NOT EXISTS outcome (
    outcome_id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    process_id              uuid NOT NULL REFERENCES process(process_id) ON DELETE CASCADE,
    asset_id                uuid REFERENCES asset(asset_id) ON DELETE SET NULL,
    outcome_type            text NOT NULL,
    description             text,
    created_at              timestamptz NOT NULL DEFAULT now(),
    CHECK (outcome_type <> '')
);

CREATE TABLE IF NOT EXISTS coop_ownership (
    ownership_id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id            uuid NOT NULL REFERENCES community(community_id) ON DELETE CASCADE,
    asset_id                uuid NOT NULL REFERENCES asset(asset_id) ON DELETE CASCADE,
    ownership_basis         text NOT NULL,
    ownership_decision_id   uuid REFERENCES decision(decision_id) ON DELETE SET NULL,
    recorded_at             timestamptz NOT NULL DEFAULT now(),
    status                  text NOT NULL DEFAULT 'active',
    UNIQUE (community_id, asset_id),
    CHECK (ownership_basis <> '')
);

-- ============================================================
-- 5. KOGI / KELYA / KSS
-- ============================================================

CREATE TABLE IF NOT EXISTS class_family (
    class_family_id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code                    text NOT NULL UNIQUE,
    name                    text NOT NULL,
    CHECK (code <> ''),
    CHECK (name <> '')
);

CREATE TABLE IF NOT EXISTS class (
    class_id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    class_family_id         uuid REFERENCES class_family(class_family_id) ON DELETE SET NULL,
    parent_class_id         uuid REFERENCES class(class_id) ON DELETE SET NULL,
    code                    text NOT NULL UNIQUE,
    name                    text NOT NULL,
    CHECK (code <> ''),
    CHECK (name <> '')
);

CREATE TABLE IF NOT EXISTS thanka_type (
    thanka_type_id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code                    text NOT NULL UNIQUE,
    name                    text NOT NULL,
    CHECK (code <> ''),
    CHECK (name <> '')
);

CREATE TABLE IF NOT EXISTS author (
    author_id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id              uuid REFERENCES subject(subject_id) ON DELETE SET NULL,
    display_name            text NOT NULL,
    created_at              timestamptz NOT NULL DEFAULT now(),
    CHECK (display_name <> '')
);

CREATE TABLE IF NOT EXISTS avatar (
    avatar_id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id               uuid NOT NULL REFERENCES author(author_id) ON DELETE CASCADE,
    person_id               uuid REFERENCES person(person_id) ON DELETE SET NULL,
    login                   citext UNIQUE,
    status                  text NOT NULL DEFAULT 'active',
    created_at              timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS thanka (
    thanka_id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    thanka_type_id          uuid REFERENCES thanka_type(thanka_type_id) ON DELETE SET NULL,
    author_id               uuid REFERENCES author(author_id) ON DELETE SET NULL,
    title                   text NOT NULL,
    status                  thanka_status_enum NOT NULL DEFAULT 'draft',
    current_version_id      uuid,
    created_at              timestamptz NOT NULL DEFAULT now(),
    CHECK (title <> '')
);

CREATE TABLE IF NOT EXISTS cogobject (
    cogobject_id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    thanka_id               uuid NOT NULL UNIQUE REFERENCES thanka(thanka_id) ON DELETE CASCADE,
    current_content         jsonb NOT NULL DEFAULT '{}'::jsonb,
    updated_at              timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cogobject_version (
    version_id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    cogobject_id            uuid NOT NULL REFERENCES cogobject(cogobject_id) ON DELETE CASCADE,
    version_no              integer NOT NULL CHECK (version_no >= 1),
    content                 jsonb NOT NULL DEFAULT '{}'::jsonb,
    state                   cogobject_state_enum NOT NULL DEFAULT 'draft',
    is_current              boolean NOT NULL DEFAULT false,
    created_at              timestamptz NOT NULL DEFAULT now(),
    UNIQUE (cogobject_id, version_no)
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_cogobject_version_current_v051
    ON cogobject_version(cogobject_id)
    WHERE is_current;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_thanka_current_version_v051'
    ) THEN
        ALTER TABLE thanka
        ADD CONSTRAINT fk_thanka_current_version_v051
        FOREIGN KEY (current_version_id)
        REFERENCES cogobject_version(version_id)
        ON DELETE SET NULL;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS repost (
    repost_id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    source_thanka_id        uuid REFERENCES thanka(thanka_id) ON DELETE SET NULL,
    target_version_id       uuid NOT NULL REFERENCES cogobject_version(version_id) ON DELETE RESTRICT,
    author_id               uuid REFERENCES author(author_id) ON DELETE SET NULL,
    created_at              timestamptz NOT NULL DEFAULT now(),
    comment                 text
);

CREATE TABLE IF NOT EXISTS tag (
    tag_id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name                    text NOT NULL UNIQUE,
    CHECK (name <> '')
);

CREATE TABLE IF NOT EXISTS thanka_tag (
    thanka_id               uuid NOT NULL REFERENCES thanka(thanka_id) ON DELETE CASCADE,
    tag_id                  uuid NOT NULL REFERENCES tag(tag_id) ON DELETE CASCADE,
    PRIMARY KEY (thanka_id, tag_id)
);

CREATE TABLE IF NOT EXISTS thanka_class (
    thanka_id               uuid NOT NULL REFERENCES thanka(thanka_id) ON DELETE CASCADE,
    class_id                uuid NOT NULL REFERENCES class(class_id) ON DELETE CASCADE,
    PRIMARY KEY (thanka_id, class_id)
);

CREATE TABLE IF NOT EXISTS link_type (
    link_type_id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code                    text NOT NULL UNIQUE,
    name                    text NOT NULL,
    CHECK (code <> ''),
    CHECK (name <> '')
);

CREATE TABLE IF NOT EXISTS thanka_link (
    thanka_link_id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    left_thanka_id          uuid NOT NULL REFERENCES thanka(thanka_id) ON DELETE CASCADE,
    right_thanka_id         uuid NOT NULL REFERENCES thanka(thanka_id) ON DELETE CASCADE,
    link_type_id            uuid NOT NULL REFERENCES link_type(link_type_id) ON DELETE RESTRICT,
    created_at              timestamptz NOT NULL DEFAULT now(),
    CHECK (left_thanka_id <> right_thanka_id)
);

CREATE TABLE IF NOT EXISTS collection (
    collection_id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_author_id         uuid REFERENCES author(author_id) ON DELETE SET NULL,
    title                   text NOT NULL,
    created_at              timestamptz NOT NULL DEFAULT now(),
    CHECK (title <> '')
);

CREATE TABLE IF NOT EXISTS collection_thanka (
    collection_id           uuid NOT NULL REFERENCES collection(collection_id) ON DELETE CASCADE,
    thanka_id               uuid NOT NULL REFERENCES thanka(thanka_id) ON DELETE CASCADE,
    sort_order              integer NOT NULL DEFAULT 0,
    PRIMARY KEY (collection_id, thanka_id)
);

CREATE TABLE IF NOT EXISTS catalog (
    catalog_id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id                uuid REFERENCES class(class_id) ON DELETE SET NULL,
    title                   text NOT NULL,
    created_at              timestamptz NOT NULL DEFAULT now(),
    CHECK (title <> '')
);

CREATE TABLE IF NOT EXISTS catalog_thanka (
    catalog_id              uuid NOT NULL REFERENCES catalog(catalog_id) ON DELETE CASCADE,
    thanka_id               uuid NOT NULL REFERENCES thanka(thanka_id) ON DELETE CASCADE,
    sort_order              integer NOT NULL DEFAULT 0,
    PRIMARY KEY (catalog_id, thanka_id)
);

CREATE TABLE IF NOT EXISTS chat (
    chat_id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    thanka_id               uuid REFERENCES thanka(thanka_id) ON DELETE CASCADE,
    title                   text,
    created_at              timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS post (
    post_id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id                 uuid NOT NULL REFERENCES chat(chat_id) ON DELETE CASCADE,
    author_id               uuid REFERENCES author(author_id) ON DELETE SET NULL,
    body                    text NOT NULL,
    created_at              timestamptz NOT NULL DEFAULT now(),
    CHECK (body <> '')
);

CREATE TABLE IF NOT EXISTS thanka_decision (
    thanka_decision_id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id                 uuid NOT NULL REFERENCES chat(chat_id) ON DELETE CASCADE,
    result_text             text NOT NULL,
    fixed_by_author_id      uuid REFERENCES author(author_id) ON DELETE SET NULL,
    fixed_at                timestamptz NOT NULL DEFAULT now(),
    CHECK (result_text <> '')
);

CREATE TABLE IF NOT EXISTS file_ref (
    file_ref_id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    thanka_id               uuid REFERENCES thanka(thanka_id) ON DELETE CASCADE,
    uri                     text NOT NULL,
    title                   text,
    created_at              timestamptz NOT NULL DEFAULT now(),
    CHECK (uri <> '')
);

CREATE TABLE IF NOT EXISTS access_rule (
    access_rule_id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    object_type             text NOT NULL,
    object_id               uuid,
    subject_id              uuid REFERENCES subject(subject_id) ON DELETE CASCADE,
    permission              text NOT NULL,
    created_at              timestamptz NOT NULL DEFAULT now(),
    CHECK (object_type <> ''),
    CHECK (permission <> '')
);

CREATE TABLE IF NOT EXISTS rating (
    rating_id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    thanka_id               uuid NOT NULL REFERENCES thanka(thanka_id) ON DELETE CASCADE,
    author_id               uuid REFERENCES author(author_id) ON DELETE SET NULL,
    value                   integer NOT NULL CHECK (value BETWEEN 1 AND 5),
    created_at              timestamptz NOT NULL DEFAULT now(),
    UNIQUE (thanka_id, author_id)
);

CREATE TABLE IF NOT EXISTS note (
    note_id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    thanka_id               uuid NOT NULL REFERENCES thanka(thanka_id) ON DELETE CASCADE,
    author_id               uuid REFERENCES author(author_id) ON DELETE SET NULL,
    body                    text NOT NULL,
    created_at              timestamptz NOT NULL DEFAULT now(),
    CHECK (body <> '')
);

CREATE TABLE IF NOT EXISTS path (
    path_id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_author_id         uuid REFERENCES author(author_id) ON DELETE SET NULL,
    title                   text NOT NULL,
    created_at              timestamptz NOT NULL DEFAULT now(),
    CHECK (title <> '')
);

CREATE TABLE IF NOT EXISTS path_thanka (
    path_id                 uuid NOT NULL REFERENCES path(path_id) ON DELETE CASCADE,
    thanka_id               uuid NOT NULL REFERENCES thanka(thanka_id) ON DELETE CASCADE,
    sort_order              integer NOT NULL DEFAULT 0,
    PRIMARY KEY (path_id, thanka_id)
);

-- ============================================================
-- 6. PIRDA
-- ============================================================

CREATE TABLE IF NOT EXISTS pirda_case (
    pirda_case_id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    anchor_thanka_id        uuid REFERENCES thanka(thanka_id) ON DELETE SET NULL,
    owner_subject_id        uuid REFERENCES subject(subject_id) ON DELETE SET NULL,
    title                   text NOT NULL,
    description             text,
    status                  pirda_case_status_enum NOT NULL DEFAULT 'new',
    created_at              timestamptz NOT NULL DEFAULT now(),
    CHECK (title <> '')
);

CREATE TABLE IF NOT EXISTS role (
    role_id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    assigned_subject_id     uuid NOT NULL REFERENCES subject(subject_id) ON DELETE CASCADE,
    role_type               text NOT NULL,
    scope_type              role_scope_enum NOT NULL,
    membership_id           uuid REFERENCES membership(membership_id) ON DELETE SET NULL,
    process_id              uuid REFERENCES process(process_id) ON DELETE SET NULL,
    pirda_case_id           uuid REFERENCES pirda_case(pirda_case_id) ON DELETE SET NULL,
    assigned_at timestamptz NOT NULL DEFAULT now(),
    status role_status_enum NOT NULL DEFAULT 'active',
    revoked_at timestamptz,
    CHECK (role_type <> ''),
    CHECK (
        (scope_type = 'community' AND membership_id IS NOT NULL AND process_id IS NULL AND pirda_case_id IS NULL) OR
        (scope_type = 'process' AND process_id IS NOT NULL AND membership_id IS NULL AND pirda_case_id IS NULL) OR
        (scope_type = 'pirda_case' AND pirda_case_id IS NOT NULL AND membership_id IS NULL AND process_id IS NULL)
    )
);

CREATE TABLE IF NOT EXISTS pirda_step (
    pirda_step_id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    pirda_case_id           uuid NOT NULL REFERENCES pirda_case(pirda_case_id) ON DELETE CASCADE,
    step_code               pirda_step_code_enum NOT NULL,
    step_order              integer NOT NULL CHECK (step_order >= 0),
    title                   text,
    content                 text,
    status                  pirda_step_status_enum NOT NULL DEFAULT 'planned',
    created_at              timestamptz NOT NULL DEFAULT now(),
    UNIQUE (pirda_case_id, step_order)
);

CREATE TABLE IF NOT EXISTS pirda_transition (
    pirda_transition_id     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    pirda_case_id           uuid NOT NULL REFERENCES pirda_case(pirda_case_id) ON DELETE CASCADE,
    from_step_id            uuid REFERENCES pirda_step(pirda_step_id) ON DELETE SET NULL,
    to_step_id              uuid REFERENCES pirda_step(pirda_step_id) ON DELETE SET NULL,
    transition_type         text NOT NULL,
    created_at              timestamptz NOT NULL DEFAULT now(),
    reason                  text,
    CHECK (transition_type <> '')
);

CREATE TABLE IF NOT EXISTS pirda_todo (
    pirda_todo_id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    pirda_case_id           uuid NOT NULL UNIQUE REFERENCES pirda_case(pirda_case_id) ON DELETE CASCADE,
    current_step_id         uuid REFERENCES pirda_step(pirda_step_id) ON DELETE SET NULL,
    updated_at              timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pirda_step_assignment (
    pirda_step_assignment_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    pirda_step_id            uuid NOT NULL REFERENCES pirda_step(pirda_step_id) ON DELETE CASCADE,
    assigned_subject_id      uuid REFERENCES subject(subject_id) ON DELETE SET NULL,
    assigned_role_id         uuid REFERENCES role(role_id) ON DELETE SET NULL,
    assigned_at              timestamptz NOT NULL DEFAULT now(),
    status                   text NOT NULL DEFAULT 'active',
    CHECK (assigned_subject_id IS NOT NULL OR assigned_role_id IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS pirda_chat (
    pirda_chat_id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    pirda_case_id           uuid NOT NULL REFERENCES pirda_case(pirda_case_id) ON DELETE CASCADE,
    title                   text,
    created_at              timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pirda_chat_message (
    pirda_chat_message_id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    pirda_chat_id           uuid NOT NULL REFERENCES pirda_chat(pirda_chat_id) ON DELETE CASCADE,
    author_id               uuid NOT NULL REFERENCES author(author_id) ON DELETE RESTRICT,
    body                    text NOT NULL,
    created_at              timestamptz NOT NULL DEFAULT now(),
    CHECK (body <> '')
);

CREATE TABLE IF NOT EXISTS pirda_chat_result (
    pirda_chat_result_id    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    pirda_chat_id           uuid NOT NULL REFERENCES pirda_chat(pirda_chat_id) ON DELETE CASCADE,
    result_text             text NOT NULL,
    fixed_by_author_id      uuid REFERENCES author(author_id) ON DELETE SET NULL,
    fixed_at                timestamptz NOT NULL DEFAULT now(),
    CHECK (result_text <> '')
);

CREATE TABLE IF NOT EXISTS pirda_case_link (
    pirda_case_link_id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    pirda_case_id           uuid NOT NULL REFERENCES pirda_case(pirda_case_id) ON DELETE CASCADE,
    linked_type             text NOT NULL,
    linked_id               uuid,
    relation_type           text NOT NULL,
    CHECK (linked_type <> ''),
    CHECK (relation_type <> '')
);

CREATE TABLE IF NOT EXISTS pirda_status_history (
    pirda_status_history_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    pirda_case_id           uuid NOT NULL REFERENCES pirda_case(pirda_case_id) ON DELETE CASCADE,
    old_status              text,
    new_status              text NOT NULL,
    changed_by_author_id    uuid REFERENCES author(author_id) ON DELETE SET NULL,
    changed_at              timestamptz NOT NULL DEFAULT now(),
    reason                  text,
    CHECK (new_status <> '')
);

-- ============================================================
-- 7. SSE / SKP
-- ============================================================

CREATE TABLE IF NOT EXISTS ss_environment (
    ss_environment_id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    anchor_community_id     uuid NOT NULL REFERENCES community(community_id) ON DELETE CASCADE,
    scope                   text NOT NULL,
    status                  text NOT NULL DEFAULT 'active',
    created_at              timestamptz NOT NULL DEFAULT now(),
    CHECK (scope <> '')
);

CREATE TABLE IF NOT EXISTS skp_profile (
    skp_profile_id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ss_environment_id       uuid NOT NULL REFERENCES ss_environment(ss_environment_id) ON DELETE CASCADE,
    version                 integer NOT NULL CHECK (version >= 1),
    status                  skp_profile_status_enum NOT NULL DEFAULT 'draft',
    effective_from          timestamptz,
    effective_to            timestamptz,
    UNIQUE (ss_environment_id, version),
    CHECK (effective_to IS NULL OR effective_from IS NULL OR effective_to > effective_from)
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_skp_profile_active_v051
    ON skp_profile(ss_environment_id)
    WHERE status = 'active';

CREATE TABLE IF NOT EXISTS skp_indicator (
    indicator_id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    skp_profile_id          uuid NOT NULL REFERENCES skp_profile(skp_profile_id) ON DELETE CASCADE,
    indicator_key           text NOT NULL,
    name                    text NOT NULL,
    indicator_type          text,
    unit                    text,
    calculation_method      jsonb NOT NULL DEFAULT '{}'::jsonb,
    target_range            jsonb NOT NULL DEFAULT '{}'::jsonb,
    red_zone                jsonb NOT NULL DEFAULT '{}'::jsonb,
    check_frequency         text,
    UNIQUE (skp_profile_id, indicator_key),
    CHECK (indicator_key <> ''),
    CHECK (name <> '')
);

CREATE TABLE IF NOT EXISTS skp_measurement (
    measurement_id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    indicator_id            uuid NOT NULL REFERENCES skp_indicator(indicator_id) ON DELETE CASCADE,
    recorded_by_subject_id  uuid REFERENCES subject(subject_id) ON DELETE SET NULL,
    measured_at             timestamptz NOT NULL DEFAULT now(),
    value                   numeric(18,6),
    status                  text,
    evidence_ref            text,
    comment                 text,
    validation_decision_id  uuid REFERENCES decision(decision_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS skp_alert (
    alert_id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ss_environment_id       uuid NOT NULL REFERENCES ss_environment(ss_environment_id) ON DELETE CASCADE,
    indicator_id            uuid REFERENCES skp_indicator(indicator_id) ON DELETE SET NULL,
    triggered_at            timestamptz NOT NULL DEFAULT now(),
    severity                text,
    reason                  text,
    status                  skp_alert_status_enum NOT NULL DEFAULT 'new'
);

CREATE TABLE IF NOT EXISTS corrective_action (
    action_id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id            uuid REFERENCES community(community_id) ON DELETE SET NULL,
    ss_environment_id       uuid REFERENCES ss_environment(ss_environment_id) ON DELETE SET NULL,
    trigger_ref_type        text,
    trigger_ref_id          uuid,
    title                   text NOT NULL,
    owner_ref_type          text,
    owner_ref_id            uuid,
    created_at              timestamptz NOT NULL DEFAULT now(),
    status                  text NOT NULL DEFAULT 'new',
    due_at                  timestamptz,
    CHECK (title <> '')
);

-- ============================================================
-- 8. INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_klon_platform_id_v051 ON klon(platform_id);
CREATE INDEX IF NOT EXISTS idx_community_home_klon_id_v051 ON community(home_klon_id);
CREATE INDEX IF NOT EXISTS idx_subject_kind_v051 ON subject(subject_kind);
CREATE INDEX IF NOT EXISTS idx_membership_person_id_v051 ON membership(person_id);
CREATE INDEX IF NOT EXISTS idx_membership_community_id_v051 ON membership(community_id);
CREATE INDEX IF NOT EXISTS idx_role_assigned_subject_v051 ON role(assigned_subject_id);
CREATE INDEX IF NOT EXISTS idx_role_membership_id_v051 ON role(membership_id);
CREATE INDEX IF NOT EXISTS idx_role_process_id_v051 ON role(process_id);
CREATE INDEX IF NOT EXISTS idx_decision_community_status_v051 ON decision(community_id, status);
CREATE INDEX IF NOT EXISTS idx_vote_decision_id_v051 ON vote(decision_id);
CREATE INDEX IF NOT EXISTS idx_contribution_process_id_v051 ON contribution(process_id);
CREATE INDEX IF NOT EXISTS idx_contribution_subject_id_v051 ON contribution(contributor_subject_id);
CREATE INDEX IF NOT EXISTS idx_recognition_contribution_id_v051 ON recognition(contribution_id);
CREATE INDEX IF NOT EXISTS idx_conflict_community_status_v051 ON conflict(community_id, status);
CREATE INDEX IF NOT EXISTS idx_account_owner_subject_v051 ON account(owner_subject_id);
CREATE INDEX IF NOT EXISTS idx_listing_asset_id_v051 ON listing(asset_id);
CREATE INDEX IF NOT EXISTS idx_deal_listing_id_v051 ON deal(listing_id);
CREATE INDEX IF NOT EXISTS idx_account_txn_source_v051 ON account_txn(source_account_id);
CREATE INDEX IF NOT EXISTS idx_account_txn_target_v051 ON account_txn(target_account_id);
CREATE INDEX IF NOT EXISTS idx_thanka_author_id_v051 ON thanka(author_id);
CREATE INDEX IF NOT EXISTS idx_thanka_status_v051 ON thanka(status);
CREATE INDEX IF NOT EXISTS idx_cogobject_thanka_id_v051 ON cogobject(thanka_id);
CREATE INDEX IF NOT EXISTS idx_cogobject_version_cogobject_id_v051 ON cogobject_version(cogobject_id);
CREATE INDEX IF NOT EXISTS idx_repost_target_version_id_v051 ON repost(target_version_id);
CREATE INDEX IF NOT EXISTS idx_thanka_link_left_v051 ON thanka_link(left_thanka_id);
CREATE INDEX IF NOT EXISTS idx_thanka_link_right_v051 ON thanka_link(right_thanka_id);
CREATE INDEX IF NOT EXISTS idx_chat_thanka_id_v051 ON chat(thanka_id);
CREATE INDEX IF NOT EXISTS idx_post_chat_id_v051 ON post(chat_id);
CREATE INDEX IF NOT EXISTS idx_pirda_case_anchor_thanka_id_v051 ON pirda_case(anchor_thanka_id);
CREATE INDEX IF NOT EXISTS idx_pirda_step_case_id_v051 ON pirda_step(pirda_case_id);
CREATE INDEX IF NOT EXISTS idx_pirda_todo_case_id_v051 ON pirda_todo(pirda_case_id);
CREATE INDEX IF NOT EXISTS idx_pirda_assignment_step_id_v051 ON pirda_step_assignment(pirda_step_id);
CREATE INDEX IF NOT EXISTS idx_pirda_chat_case_id_v051 ON pirda_chat(pirda_case_id);
CREATE INDEX IF NOT EXISTS idx_skp_profile_ss_environment_id_v051 ON skp_profile(ss_environment_id);
CREATE INDEX IF NOT EXISTS idx_skp_indicator_profile_id_v051 ON skp_indicator(skp_profile_id);
CREATE INDEX IF NOT EXISTS idx_skp_measurement_indicator_id_v051 ON skp_measurement(indicator_id);
CREATE INDEX IF NOT EXISTS idx_skp_alert_ss_environment_id_v051 ON skp_alert(ss_environment_id);

-- ============================================================
-- 9. COMMENTS (selected)
-- ============================================================

COMMENT ON TABLE subject IS 'Центровой объект ОЦП: все значимые действия и события происходят субъектом или от имени субъекта.';
COMMENT ON TABLE subject_representative IS 'Связь представительства: субъект действует через человека-представителя.';
COMMENT ON TABLE contribution IS 'Вклад субъекта в процесс: труд, деньги, актив, знание, организация, репутация, услуга или время.';
COMMENT ON TABLE recognition IS 'Признание ценности вклада субъектом или институциональным решением.';
COMMENT ON TABLE thanka IS 'Центральный узел КСС / КЕЛЬИ.';
COMMENT ON TABLE cogobject_version IS 'Версия содержимого тханки; репост всегда должен ссылаться на конкретную версию.';
COMMENT ON TABLE pirda_case IS 'Прецедент процесса делового мышления ПИРДА.';
COMMENT ON TABLE pirda_todo IS 'Указатель текущего шага исполнения в прецеденте ПИРДА.';
COMMENT ON TABLE decision IS 'Институциональное решение сообщества.';
COMMENT ON TABLE thanka_decision IS 'Локальный результат обсуждения в чате тханки; не тождественен институциональному decision.';

-- ============================================================
-- END OF DDL V0.51
-- ============================================================
