-- 2026_07_01_004 — Дерево тханок: parent_id, is_system, sort_order
ALTER TABLE homonet.thanka
  ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES homonet.thanka(thanka_id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_system boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_thanka_parent_id_v051
  ON homonet.thanka(parent_id);
