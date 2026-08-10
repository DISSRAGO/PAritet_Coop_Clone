-- ============================================================
-- Migration: 2026_06_29_001_reclamation_workflow_sync.sql
-- Синхронизирует enum статусов и типов сообщений рекламаций
-- под новую backend-логику service.py
-- ============================================================
--
-- ВАЖНО:
-- 1) Выполнять БЕЗ BEGIN/COMMIT.
-- 2) Для PostgreSQL enum ALTER TYPE ... ADD VALUE делаем отдельными
--    выражениями вне транзакции.
-- ============================================================

-- --- reclamation statuses

ALTER TYPE homonet.reclamation_status_enum
ADD VALUE IF NOT EXISTS 'accepted' AFTER 'registered';

ALTER TYPE homonet.reclamation_status_enum
ADD VALUE IF NOT EXISTS 'in_progress' AFTER 'accepted';

ALTER TYPE homonet.reclamation_status_enum
ADD VALUE IF NOT EXISTS 'waiting_response' AFTER 'in_progress';

ALTER TYPE homonet.reclamation_status_enum
ADD VALUE IF NOT EXISTS 'resolved' AFTER 'waiting_response';

ALTER TYPE homonet.reclamation_status_enum
ADD VALUE IF NOT EXISTS 'rejected' AFTER 'resolved';

ALTER TYPE homonet.reclamation_status_enum
ADD VALUE IF NOT EXISTS 'completed' AFTER 'rejected';

ALTER TYPE homonet.reclamation_status_enum
ADD VALUE IF NOT EXISTS 'closed' AFTER 'completed';

ALTER TYPE homonet.reclamation_status_enum
ADD VALUE IF NOT EXISTS 'cancelled' AFTER 'closed';

-- --- reclamation message types

ALTER TYPE homonet.reclamation_message_type_enum
ADD VALUE IF NOT EXISTS 'clarification_request' AFTER 'explanation';

-- --- checks

SELECT
    enumlabel AS reclamation_status_value
FROM pg_enum
JOIN pg_type ON pg_type.oid = pg_enum.enumtypid
JOIN pg_namespace ns ON ns.oid = pg_type.typnamespace
WHERE pg_type.typname = 'reclamation_status_enum'
  AND ns.nspname = 'homonet'
ORDER BY enumsortorder;

SELECT
    enumlabel AS reclamation_message_type_value
FROM pg_enum
JOIN pg_type ON pg_type.oid = pg_enum.enumtypid
JOIN pg_namespace ns ON ns.oid = pg_type.typnamespace
WHERE pg_type.typname = 'reclamation_message_type_enum'
  AND ns.nspname = 'homonet'
ORDER BY enumsortorder;