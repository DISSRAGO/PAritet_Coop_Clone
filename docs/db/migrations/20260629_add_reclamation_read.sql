BEGIN;

CREATE TABLE IF NOT EXISTS homonet.reclamation_read (
    reclamation_id uuid NOT NULL,
    subject_id uuid NOT NULL,
    read_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (reclamation_id, subject_id),
    CONSTRAINT fk_reclamation_read_reclamation
        FOREIGN KEY (reclamation_id)
        REFERENCES homonet.reclamation (reclamation_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_reclamation_read_subject
        FOREIGN KEY (subject_id)
        REFERENCES homonet.subject (subject_id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reclamation_read_subject
    ON homonet.reclamation_read (subject_id, read_at DESC);

CREATE INDEX IF NOT EXISTS idx_reclamation_read_reclamation
    ON homonet.reclamation_read (reclamation_id);

COMMIT;