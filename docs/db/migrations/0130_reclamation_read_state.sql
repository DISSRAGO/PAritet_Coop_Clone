CREATE TABLE homonet.reclamation_read_state (
    read_state_id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reclamation_id  uuid NOT NULL
        REFERENCES homonet.reclamation(reclamation_id) ON DELETE CASCADE,
    subject_id      text NOT NULL,
    last_read_at    timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_read_state UNIQUE (reclamation_id, subject_id)
);

CREATE INDEX idx_reclamation_read_state_subject
    ON homonet.reclamation_read_state (subject_id);