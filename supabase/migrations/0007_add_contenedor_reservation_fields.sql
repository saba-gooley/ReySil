-- Add missing reservation fields per HU-CLI-003 spec:
-- Orden, Mercadería, Despacho, Carga, Terminal, Devuelve en, Libre hasta

ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS orden        TEXT,
  ADD COLUMN IF NOT EXISTS mercaderia   TEXT,
  ADD COLUMN IF NOT EXISTS despacho     TEXT,
  ADD COLUMN IF NOT EXISTS carga        TEXT,
  ADD COLUMN IF NOT EXISTS terminal     TEXT,
  ADD COLUMN IF NOT EXISTS devuelve_en  TEXT,
  ADD COLUMN IF NOT EXISTS libre_hasta  DATE;
