-- ============================================================
-- 2026_07_01_004 — Дерево тханок + системный seed
-- ============================================================

-- 1. Добавляем поля дерева к thanka
ALTER TABLE homonet.thanka
  ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES homonet.thanka(thanka_id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_system boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_thanka_parent_id_v051
  ON homonet.thanka(parent_id);

-- 2. Системный seed — ADMIN
-- person
INSERT INTO homonet.person (person_id, display_name, status)
VALUES ('00000000-0000-0000-0000-000000000001', 'Системный администратор', 'active')
ON CONFLICT DO NOTHING;

-- community типа INFO (инфоша)
INSERT INTO homonet.community (community_id, home_klon_id, community_type, name, status)
SELECT '00000000-0000-0000-0000-000000000002',
       k.klon_id,
       'INFO',
       'Системная инфоша',
       'active'
FROM homonet.klon k
LIMIT 1
ON CONFLICT DO NOTHING;

-- subject — collective, привязан к community INFO
INSERT INTO homonet.subject (subject_id, subject_kind, community_id, display_name, status)
VALUES ('00000000-0000-0000-0000-000000000003',
        'collective',
        '00000000-0000-0000-0000-000000000002',
        'Системный субъект (INFO)',
        'active')
ON CONFLICT DO NOTHING;

-- avatar с логином ADMIN (используем schema cogiteka/homonet — avatar хранит логин)
INSERT INTO homonet.author (author_id, subject_id, display_name)
VALUES ('00000000-0000-0000-0000-000000000004',
        '00000000-0000-0000-0000-000000000003',
        'ADMIN')
ON CONFLICT DO NOTHING;

INSERT INTO homonet.avatar (avatar_id, author_id, person_id, login, status)
VALUES ('00000000-0000-0000-0000-000000000005',
        '00000000-0000-0000-0000-000000000004',
        '00000000-0000-0000-0000-000000000001',
        'ADMIN',
        'active')
ON CONFLICT DO NOTHING;

-- 3. Системная тханка — корень дерева
INSERT INTO homonet.thanka (thanka_id, author_id, title, status, is_system, parent_id, sort_order)
VALUES ('00000000-0000-0000-0000-000000000010',
        '00000000-0000-0000-0000-000000000004',
        'Главная страница',
        'active',
        true,
        NULL,
        0)
ON CONFLICT DO NOTHING;