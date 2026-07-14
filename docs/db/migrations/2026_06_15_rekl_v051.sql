-- ============================================================
-- DDL PATCH #РЕКЛ V0.51
-- Сервис рекламаций, модерации, эскалации и восстановления доверия
-- Требует базовый DDL V051.sql:
-- subject, community, process, deal, conflict, file_ref, decision
-- ============================================================

SET search_path TO homonet, public;

-- ============================================================
-- 1. ENUMS
-- ============================================================

DO $$ BEGIN
  CREATE TYPE reclamation_type_enum AS ENUM (
    'content',
    'context',
    'behavior',
    'transaction',
    'governance',
    'system'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE reclamation_source_enum AS ENUM (
    'user',
    'system',
    'moderator',
    'auto'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE reclamation_status_enum AS ENUM (
    'draft',
    'registered',
    'accepted',
    'in_review',
    'waiting_response',
    'resolved',
    'escalated',
    'closed',
    'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE reclamation_priority_enum AS ENUM (
    'low',
    'normal',
    'high',
    'critical'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE reclamation_participant_role_enum AS ENUM (
    'claimant',
    'respondent',
    'moderator',
    'responsible',
    'guarantor',
    'supervisor',
    'observer',
    'board',
    'veche'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE reclamation_message_type_enum AS ENUM (
    'comment',
    'explanation',
    'objection',
    'correction',
    'system_note'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE reclamation_decision_type_enum AS ENUM (
    'reject',
    'accept',
    'correct',
    'warn',
    'hide',
    'archive',
    'move',
    'restore',
    'compensate',
    'restrict',
    'escalate',
    'vote',
    'veche'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE reclamation_action_type_enum AS ENUM (
    'hide',
    'archive',
    'move',
    'restore',
    'compensate',
    'restrict_role',
    'ban',
    'unban',
    'create_insurance_case',
    'create_vote',
    'notify',
    'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE reclamation_action_status_enum AS ENUM (
    'planned',
    'in_progress',
    'done',
    'cancelled',
    'failed'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE reclamation_escalation_reason_enum AS ENUM (
    'no_response',
    'conflict_of_interest',
    'timeout',
    'appeal',
    'insufficient_authority',
    'manual'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE reclamation_response_type_enum AS ENUM (
    'accept',
    'reject',
    'explain',
    'correct',
    'apologize',
    'compensate',
    'appeal'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE reclamation_visibility_enum AS ENUM (
    'public',
    'participants',
    'moderators',
    'system'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE reclamation_insurance_status_enum AS ENUM (
    'draft',
    'requested',
    'approved',
    'rejected',
    'paid',
    'closed'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 2. CORE TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS reclamation (
    reclamation_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    reclamation_type reclamation_type_enum NOT NULL,
    source_type reclamation_source_enum NOT NULL DEFAULT 'user',
    status reclamation_status_enum NOT NULL DEFAULT 'registered',
    priority reclamation_priority_enum NOT NULL DEFAULT 'normal',

    created_by_subject_id uuid NOT NULL REFERENCES subject(subject_id) ON DELETE RESTRICT,
    respondent_subject_id uuid REFERENCES subject(subject_id) ON DELETE SET NULL,
    current_responsible_subject_id uuid REFERENCES subject(subject_id) ON DELETE SET NULL,

    target_type text NOT NULL,
    target_id uuid NOT NULL,

    community_id uuid REFERENCES community(community_id) ON DELETE SET NULL,
    process_id uuid REFERENCES process(process_id) ON DELETE SET NULL,
    deal_id uuid REFERENCES deal(deal_id) ON DELETE SET NULL,
    conflict_id uuid REFERENCES conflict(conflict_id) ON DELETE SET NULL,

    title text NOT NULL,
    description text,

    created_at timestamptz NOT NULL DEFAULT now(),
    accepted_at timestamptz,
    closed_at timestamptz,
    deadline_at timestamptz,

    CHECK (target_type <> ''),
    CHECK (title <> ''),
    CHECK (closed_at IS NULL OR closed_at >= created_at),
    CHECK (deadline_at IS NULL OR deadline_at >= created_at)
);

COMMENT ON TABLE reclamation IS
'Центральная сущность сервиса #РЕКЛ: формально зарегистрированное несогласие, жалоба, контекстное нарушение или экономический спор.';

CREATE TABLE IF NOT EXISTS reclamation_participant (
    participant_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reclamation_id uuid NOT NULL REFERENCES reclamation(reclamation_id) ON DELETE CASCADE,
    subject_id uuid NOT NULL REFERENCES subject(subject_id) ON DELETE RESTRICT,
    participant_role reclamation_participant_role_enum NOT NULL,
    added_at timestamptz NOT NULL DEFAULT now(),
    added_by_subject_id uuid REFERENCES subject(subject_id) ON DELETE SET NULL,
    status text NOT NULL DEFAULT 'active',

    UNIQUE (reclamation_id, subject_id, participant_role)
);

COMMENT ON TABLE reclamation_participant IS
'Участники рекламации: заявитель, ответчик, модератор, поручитель, супервизор, правление, вече.';

CREATE TABLE IF NOT EXISTS reclamation_message (
    message_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reclamation_id uuid NOT NULL REFERENCES reclamation(reclamation_id) ON DELETE CASCADE,
    author_subject_id uuid NOT NULL REFERENCES subject(subject_id) ON DELETE RESTRICT,
    message_type reclamation_message_type_enum NOT NULL DEFAULT 'comment',
    body text NOT NULL,
    visibility reclamation_visibility_enum NOT NULL DEFAULT 'participants',
    created_at timestamptz NOT NULL DEFAULT now(),

    CHECK (body <> '')
);

COMMENT ON TABLE reclamation_message IS
'Сообщения, пояснения, возражения и системные заметки в рамках рекламации.';

CREATE TABLE IF NOT EXISTS reclamation_attachment (
    attachment_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reclamation_id uuid NOT NULL REFERENCES reclamation(reclamation_id) ON DELETE CASCADE,
    message_id uuid REFERENCES reclamation_message(message_id) ON DELETE CASCADE,
    uploaded_by_subject_id uuid NOT NULL REFERENCES subject(subject_id) ON DELETE RESTRICT,
    file_ref_id uuid REFERENCES file_ref(file_ref_id) ON DELETE SET NULL,
    uri text,
    title text,
    description text,
    created_at timestamptz NOT NULL DEFAULT now(),

    CHECK (file_ref_id IS NOT NULL OR uri IS NOT NULL)
);

COMMENT ON TABLE reclamation_attachment IS
'Доказательства, документы, скриншоты и ссылки, приложенные к рекламации.';

CREATE TABLE IF NOT EXISTS reclamation_response (
    response_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reclamation_id uuid NOT NULL REFERENCES reclamation(reclamation_id) ON DELETE CASCADE,
    respondent_subject_id uuid NOT NULL REFERENCES subject(subject_id) ON DELETE RESTRICT,
    response_type reclamation_response_type_enum NOT NULL,
    body text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),

    CHECK (body <> '')
);

COMMENT ON TABLE reclamation_response IS
'Формальный ответ ответчика или владельца объекта на рекламацию.';

CREATE TABLE IF NOT EXISTS reclamation_decision (
    reclamation_decision_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reclamation_id uuid NOT NULL REFERENCES reclamation(reclamation_id) ON DELETE CASCADE,
    decision_by_subject_id uuid NOT NULL REFERENCES subject(subject_id) ON DELETE RESTRICT,
    decision_type reclamation_decision_type_enum NOT NULL,
    decision_text text NOT NULL,
    reason text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    effective_from timestamptz,
    is_final boolean NOT NULL DEFAULT false,

    CHECK (decision_text <> ''),
    CHECK (reason <> '')
);

COMMENT ON TABLE reclamation_decision IS
'Неизменяемое решение по рекламации. Для изменения создается новое решение или эскалация.';

CREATE TABLE IF NOT EXISTS reclamation_action (
    action_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reclamation_id uuid NOT NULL REFERENCES reclamation(reclamation_id) ON DELETE CASCADE,
    decision_id uuid REFERENCES reclamation_decision(reclamation_decision_id) ON DELETE SET NULL,
    action_type reclamation_action_type_enum NOT NULL,
    target_type text NOT NULL,
    target_id uuid,
    assigned_to_subject_id uuid REFERENCES subject(subject_id) ON DELETE SET NULL,
    performed_by_subject_id uuid REFERENCES subject(subject_id) ON DELETE SET NULL,
    status reclamation_action_status_enum NOT NULL DEFAULT 'planned',
    created_at timestamptz NOT NULL DEFAULT now(),
    performed_at timestamptz,
    result_note text,

    CHECK (target_type <> ''),
    CHECK (performed_at IS NULL OR performed_at >= created_at)
);

COMMENT ON TABLE reclamation_action IS
'Исполнительные действия по решению рекламации: скрыть, архивировать, компенсировать, ограничить, уведомить и т.д.';

CREATE TABLE IF NOT EXISTS reclamation_escalation (
    escalation_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reclamation_id uuid NOT NULL REFERENCES reclamation(reclamation_id) ON DELETE CASCADE,
    from_subject_id uuid REFERENCES subject(subject_id) ON DELETE SET NULL,
    to_subject_id uuid REFERENCES subject(subject_id) ON DELETE SET NULL,
    from_level integer NOT NULL DEFAULT 0,
    to_level integer NOT NULL,
    escalation_reason reclamation_escalation_reason_enum NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by_subject_id uuid REFERENCES subject(subject_id) ON DELETE SET NULL,

    CHECK (to_level > from_level)
);

COMMENT ON TABLE reclamation_escalation IS
'История эскалаций рекламации между уровнями ответственности.';

CREATE TABLE IF NOT EXISTS reclamation_event (
    event_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reclamation_id uuid NOT NULL REFERENCES reclamation(reclamation_id) ON DELETE CASCADE,
    event_type text NOT NULL,
    actor_subject_id uuid REFERENCES subject(subject_id) ON DELETE SET NULL,
    payload jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),

    CHECK (event_type <> '')
);

COMMENT ON TABLE reclamation_event IS
'Append-only журнал событий сервиса #РЕКЛ.';

-- ============================================================
-- 3. CONTEXT CONTROL
-- ============================================================

CREATE TABLE IF NOT EXISTS reclamation_context_rule (
    context_rule_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_code text NOT NULL UNIQUE,
    name text NOT NULL,
    target_type text NOT NULL,
    scope_type text NOT NULL,
    severity reclamation_priority_enum NOT NULL DEFAULT 'normal',
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),

    CHECK (rule_code <> ''),
    CHECK (name <> ''),
    CHECK (target_type <> ''),
    CHECK (scope_type <> '')
);

COMMENT ON TABLE reclamation_context_rule IS
'Правила автоматического контроля контекста, создающие системные рекламации.';

CREATE TABLE IF NOT EXISTS reclamation_context_trigger (
    trigger_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    context_rule_id uuid NOT NULL REFERENCES reclamation_context_rule(context_rule_id) ON DELETE RESTRICT,
    reclamation_id uuid REFERENCES reclamation(reclamation_id) ON DELETE SET NULL,
    target_type text NOT NULL,
    target_id uuid NOT NULL,
    detected_by text NOT NULL DEFAULT 'system',
    payload jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),

    CHECK (target_type <> ''),
    CHECK (detected_by <> '')
);

COMMENT ON TABLE reclamation_context_trigger IS
'Факт срабатывания правила контекстного контроля.';

-- ============================================================
-- 4. GUARANTEE / INSURANCE LINKS
-- ============================================================

CREATE TABLE IF NOT EXISTS reclamation_guarantee_link (
    guarantee_link_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reclamation_id uuid NOT NULL REFERENCES reclamation(reclamation_id) ON DELETE CASCADE,
    guarantor_subject_id uuid NOT NULL REFERENCES subject(subject_id) ON DELETE RESTRICT,
    ward_subject_id uuid NOT NULL REFERENCES subject(subject_id) ON DELETE RESTRICT,
    side_role text NOT NULL,
    guarantee_level integer NOT NULL DEFAULT 0,
    status text NOT NULL DEFAULT 'active',
    created_at timestamptz NOT NULL DEFAULT now(),

    CHECK (side_role IN ('claimant_side', 'respondent_side')),
    CHECK (guarantee_level >= 0),
    CHECK (guarantor_subject_id <> ward_subject_id)
);

COMMENT ON TABLE reclamation_guarantee_link IS
'Связь рекламации с поручительским контуром #ДЕПО.';

CREATE TABLE IF NOT EXISTS reclamation_insurance_case (
    insurance_case_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reclamation_id uuid NOT NULL UNIQUE REFERENCES reclamation(reclamation_id) ON DELETE CASCADE,
    insurance_fund_id uuid,
    claim_amount numeric(18,6),
    approved_amount numeric(18,6),
    status reclamation_insurance_status_enum NOT NULL DEFAULT 'draft',
    created_at timestamptz NOT NULL DEFAULT now(),
    approved_at timestamptz,
    paid_at timestamptz,

    CHECK (claim_amount IS NULL OR claim_amount >= 0),
    CHECK (approved_amount IS NULL OR approved_amount >= 0),
    CHECK (paid_at IS NULL OR approved_at IS NULL OR paid_at >= approved_at)
);

COMMENT ON TABLE reclamation_insurance_case IS
'Связь рекламации со страховым случаем #СТРХ.';

-- ============================================================
-- 5. INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_reclamation_created_by_v051
    ON reclamation(created_by_subject_id);

CREATE INDEX IF NOT EXISTS idx_reclamation_respondent_v051
    ON reclamation(respondent_subject_id);

CREATE INDEX IF NOT EXISTS idx_reclamation_responsible_v051
    ON reclamation(current_responsible_subject_id);

CREATE INDEX IF NOT EXISTS idx_reclamation_status_v051
    ON reclamation(status);

CREATE INDEX IF NOT EXISTS idx_reclamation_type_v051
    ON reclamation(reclamation_type);

CREATE INDEX IF NOT EXISTS idx_reclamation_target_v051
    ON reclamation(target_type, target_id);

CREATE INDEX IF NOT EXISTS idx_reclamation_community_v051
    ON reclamation(community_id);

CREATE INDEX IF NOT EXISTS idx_reclamation_process_v051
    ON reclamation(process_id);

CREATE INDEX IF NOT EXISTS idx_reclamation_deal_v051
    ON reclamation(deal_id);

CREATE INDEX IF NOT EXISTS idx_reclamation_conflict_v051
    ON reclamation(conflict_id);

CREATE INDEX IF NOT EXISTS idx_reclamation_participant_reclamation_v051
    ON reclamation_participant(reclamation_id);

CREATE INDEX IF NOT EXISTS idx_reclamation_participant_subject_v051
    ON reclamation_participant(subject_id);

CREATE INDEX IF NOT EXISTS idx_reclamation_message_reclamation_v051
    ON reclamation_message(reclamation_id);

CREATE INDEX IF NOT EXISTS idx_reclamation_message_author_v051
    ON reclamation_message(author_subject_id);

CREATE INDEX IF NOT EXISTS idx_reclamation_decision_reclamation_v051
    ON reclamation_decision(reclamation_id);

CREATE INDEX IF NOT EXISTS idx_reclamation_action_reclamation_v051
    ON reclamation_action(reclamation_id);

CREATE INDEX IF NOT EXISTS idx_reclamation_escalation_reclamation_v051
    ON reclamation_escalation(reclamation_id);

CREATE INDEX IF NOT EXISTS idx_reclamation_event_reclamation_v051
    ON reclamation_event(reclamation_id);

CREATE INDEX IF NOT EXISTS idx_reclamation_event_type_v051
    ON reclamation_event(event_type);

CREATE INDEX IF NOT EXISTS idx_reclamation_context_trigger_target_v051
    ON reclamation_context_trigger(target_type, target_id);

CREATE INDEX IF NOT EXISTS idx_reclamation_guarantee_reclamation_v051
    ON reclamation_guarantee_link(reclamation_id);

CREATE INDEX IF NOT EXISTS idx_reclamation_guarantee_guarantor_v051
    ON reclamation_guarantee_link(guarantor_subject_id);

CREATE INDEX IF NOT EXISTS idx_reclamation_guarantee_ward_v051
    ON reclamation_guarantee_link(ward_subject_id);

-- ============================================================
-- 6. MVP VIEW
-- ============================================================

CREATE OR REPLACE VIEW v_reclamation_inbox AS
SELECT
    r.reclamation_id,
    r.reclamation_type,
    r.source_type,
    r.status,
    r.priority,
    r.title,
    r.target_type,
    r.target_id,
    r.created_by_subject_id,
    r.respondent_subject_id,
    r.current_responsible_subject_id,
    r.community_id,
    r.created_at,
    r.deadline_at
FROM reclamation r
WHERE r.status IN (
    'registered',
    'accepted',
    'in_review',
    'waiting_response',
    'escalated'
);

COMMENT ON VIEW v_reclamation_inbox IS
'Входящие активные рекламации для панели #РЕКЛ.';

-- ============================================================
-- END PATCH #РЕКЛ V0.51
-- ============================================================
