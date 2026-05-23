-- Agregar campo carga_peligrosa a shift_logs.

ALTER TABLE public.shift_logs
ADD COLUMN IF NOT EXISTS carga_peligrosa BOOLEAN NOT NULL DEFAULT FALSE;
