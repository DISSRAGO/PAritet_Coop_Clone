ALTER TYPE homonet.reclamation_status_enum
ADD VALUE IF NOT EXISTS 'accepted' AFTER 'registered';

ALTER TYPE homonet.reclamation_status_enum
ADD VALUE IF NOT EXISTS 'rejected' AFTER 'resolved';

SELECT
  enumlabel AS status_value
FROM pg_enum
JOIN pg_type ON pg_type.oid = pg_enum.enumtypid
WHERE pg_type.typname = 'reclamation_status_enum'
ORDER BY enumsortorder;