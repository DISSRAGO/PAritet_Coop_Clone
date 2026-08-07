-- ============================================================
-- Migration: 2026_06_26_002_reclamation_add_statuses.sql
-- Добавляет статусы in_progress и completed в enum рекламаций
-- ============================================================
--
-- ВАЖНО: ALTER TYPE ... ADD VALUE нельзя выполнять внутри транзакции
-- в PostgreSQL < 12. В PostgreSQL 12+ это работает, но только если
-- тип не используется в текущей транзакции.
-- Этот файл выполняется БЕЗ BEGIN/COMMIT намеренно.
--

ALTER TYPE homonet.reclamation_status_enum
    ADD VALUE IF NOT EXISTS 'in_progress' AFTER 'accepted';

ALTER TYPE homonet.reclamation_status_enum
    ADD VALUE IF NOT EXISTS 'completed' AFTER 'resolved';

-- Проверка — вывести текущий список значений enum после применения
SELECT
    enumlabel AS status_value
FROM pg_enum
JOIN pg_type ON pg_type.oid = pg_enum.enumtypid
WHERE pg_type.typname = 'reclamation_status_enum'
ORDER BY enumsortorder;
