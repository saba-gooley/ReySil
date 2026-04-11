-- =========================================================================
-- ReySil — Add PREASIGNADO status to trip_status enum
-- Migracion 0006
-- =========================================================================

ALTER TYPE public.trip_status ADD VALUE IF NOT EXISTS 'PREASIGNADO' AFTER 'PENDIENTE';
