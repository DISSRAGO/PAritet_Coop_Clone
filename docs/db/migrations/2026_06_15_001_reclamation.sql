SET search_path TO homonet, public;

DO $$ BEGIN CREATE TYPE reclamation_type_enum AS ENUM ('content','context','behavior','transaction','governance','system'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE reclamation_source_enum AS ENUM ('user','system','moderator','auto'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE reclamation_status_enum AS ENUM ('draft','registered','accepted','in_review','waiting_response','resolved','escalated','closed','cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE reclamation_priority_enum AS ENUM ('low','normal','high','critical'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE reclamation_participant_role_enum AS ENUM ('claimant','respondent','moderator','responsible','guarantor','supervisor','observer','board','veche'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE reclamation_message_type_enum AS ENUM ('comment','explanation','objection','correction','system_note'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE reclamation_decision_type_enum AS ENUM ('reject','accept','correct','warn','hide','archive','move','restore','compensate','restrict','escalate','vote','veche'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE reclamation_action_type_enum AS ENUM ('hide','archive','move','restore','compensate','restrict_role','ban','unban','create_insurance_case','create_vote','notify','other'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE reclamation_action_status_enum AS ENUM ('planned','in_progress','done','cancelled','failed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE reclamation_escalation_reason_enum AS ENUM ('no_response','conflict_of_interest','timeout','appeal','insufficient_authority','manual'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE reclamation_response_type_enum AS ENUM ('accept','reject','explain','correct','apologize','compensate','appeal'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE reclamation_visibility_enum AS ENUM ('public','participants','moderators','system'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE reclamation_insurance_status_enum AS ENUM ('draft','requested','approved','rejected','paid','closed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS reclamation (
    reclamation_id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reclamation_type                   reclamation_type_enum NOT NULL,
    source_type                        reclamation_source_enum NOT NULL DEFAULT 'user',
    status                             reclamation_status_enum NOT NULL DEFAULT 'registered',
    priority                           reclamation_priority_enum NOT NULL DEFAULT 'normal',
    created_by_subject_id              uuid NOT NULL REFERENCES subject(subject_id) ON DELETE RESTRICT,
    respondent_subject_id              uuid REFERENCES subject(subject_id) ON DELETE SET NULL,
    current_responsible_subject_id     uuid REFERENCES subject(subject_id) ON DELETE SET NULL,
    target_type                        text NOT NULL,
    target_id                          uuid NOT NULL,
    community_id                       uuid REFERENCES community(community_id) ON DELETE SET NULL,
    title                              text NOT NULL,
    description                        text,
    created_at                         timestamptz NOT NULL DEFAULT now(),
    accepted_at                        timestamptz,
    closed_at                          timestamptz,
    deadline_at                        timestamptz
);

CREATE TABLE IF NOT EXISTS reclamation_participant (
    participant_id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reclamation_id        uuid NOT NULL REFERENCES reclamation(reclamation_id) ON DELETE CASCADE,
    subject_id            uuid NOT NULL REFERENCES subject(subject_id) ON DELETE RESTRICT,
    participant_role       reclamation_participant_role_enum NOT NULL,
    added_at              timestamptz NOT NULL DEFAULT now(),
    added_by_subject_id   uuid REFERENCES subject(subject_id) ON DELETE SET NULL,
    status                text NOT NULL DEFAULT 'active',
    UNIQUE (reclamation_id, subject_id, participant_role)
);

CREATE TABLE IF NOT EXISTS reclamation_message (
    message_id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reclamation_id        uuid NOT NULL REFERENCES reclamation(reclamation_id) ON DELETE CASCADE,
    author_subject_id     uuid NOT NULL REFERENCES subject(subject_id) ON DELETE RESTRICT,
    message_type          reclamation_message_type_enum NOT NULL DEFAULT 'comment',
    body                  text NOT NULL,
    visibility            reclamation_visibility_enum NOT NULL DEFAULT 'participants',
    created_at            timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reclamation_attachment (
    attachment_id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reclamation_id             uuid NOT NULL REFERENCES reclamation(reclamation_id) ON DELETE CASCADE,
    message_id                 uuid REFERENCES reclamation_message(message_id) ON DELETE CASCADE,
    uploaded_by_subject_id     uuid NOT NULL REFERENCES subject(subject_id) ON DELETE RESTRICT,
    uri                        text,
    title                      text,
    description                text,
    created_at                 timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reclamation_response (
    response_id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reclamation_id            uuid NOT NULL REFERENCES reclamation(reclamation_id) ON DELETE CASCADE,
    respondent_subject_id     uuid NOT NULL REFERENCES subject(subject_id) ON DELETE RESTRICT,
    response_type             reclamation_response_type_enum NOT NULL,
    body                      text NOT NULL,
    created_at                timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reclamation_decision (
    reclamation_decision_id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reclamation_id            uuid NOT NULL REFERENCES reclamation(reclamation_id) ON DELETE CASCADE,
    decision_by_subject_id    uuid NOT NULL REFERENCES subject(subject_id) ON DELETE RESTRICT,
    decision_type             reclamation_decision_type_enum NOT NULL,
    decision_text             text NOT NULL,
    reason                    text NOT NULL,
    created_at                timestamptz NOT NULL DEFAULT now(),
    effective_from            timestamptz,
    is_final                  boolean NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS reclamation_escalation (
    escalation_id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reclamation_id            uuid NOT NULL REFERENCES reclamation(reclamation_id) ON DELETE CASCADE,
    from_subject_id           uuid REFERENCES subject(subject_id) ON DELETE SET NULL,
    to_subject_id             uuid REFERENCES subject(subject_id) ON DELETE SET NULL,
    from_level                integer NOT NULL DEFAULT 0,
    to_level                  integer NOT NULL,
    escalation_reason         reclamation_escalation_reason_enum NOT NULL,
    created_at                timestamptz NOT NULL DEFAULT now(),
    created_by_subject_id     uuid REFERENCES subject(subject_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS reclamation_event (
    event_id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reclamation_id        uuid NOT NULL REFERENCES reclamation(reclamation_id) ON DELETE CASCADE,
    event_type            text NOT NULL,
    actor_subject_id      uuid REFERENCES subject(subject_id) ON DELETE SET NULL,
    payload               jsonb NOT NULL DEFAULT '{}',
    created_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reclamation_created_by    ON reclamation(created_by_subject_id);
CREATE INDEX IF NOT EXISTS idx_reclamation_respondent    ON reclamation(respondent_subject_id);
CREATE INDEX IF NOT EXISTS idx_reclamation_responsible   ON reclamation(current_responsible_subject_id);
CREATE INDEX IF NOT EXISTS idx_reclamation_status        ON reclamation(status);
CREATE INDEX IF NOT EXISTS idx_reclamation_target        ON reclamation(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_reclamation_community     ON reclamation(community_id);
CREATE INDEX IF NOT EXISTS idx_reclamation_participant_r ON reclamation_participant(reclamation_id);
CREATE INDEX IF NOT EXISTS idx_reclamation_participant_s ON reclamation_participant(subject_id);
CREATE INDEX IF NOT EXISTS idx_reclamation_message_r     ON reclamation_message(reclamation_id);
CREATE INDEX IF NOT EXISTS idx_reclamation_decision_r    ON reclamation_decision(reclamation_id);
CREATE INDEX IF NOT EXISTS idx_reclamation_escalation_r  ON reclamation_escalation(reclamation_id);
CREATE INDEX IF NOT EXISTS idx_reclamation_event_r       ON reclamation_event(reclamation_id);
