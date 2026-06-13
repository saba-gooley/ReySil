-- =========================================================================
-- 0017 — Codigo de Viaje Secuencial (req. 2.13)
-- Cada viaje recibe un codigo unico secuencial (VJ-00001, VJ-00002, ...).
-- Backfill de viajes existentes ordenado por created_at; los nuevos toman
-- el codigo automaticamente via DEFAULT.
-- =========================================================================

ALTER TABLE public.trips ADD COLUMN codigo TEXT;

CREATE SEQUENCE public.trip_codigo_seq;

-- Formatea el proximo valor de la secuencia como VJ-#####.
-- greatest(5, length) evita que lpad trunque cuando se superen los 99999 viajes.
CREATE OR REPLACE FUNCTION public.next_trip_codigo()
RETURNS TEXT
LANGUAGE sql
VOLATILE
AS $$
  SELECT 'VJ-' || lpad(n::text, greatest(5, length(n::text)), '0')
  FROM (SELECT nextval('public.trip_codigo_seq') AS n) s;
$$;

-- Backfill historico: VJ-00001 es el primer viaje cargado en el sistema
UPDATE public.trips t
SET codigo = 'VJ-' || lpad(s.rn::text, greatest(5, length(s.rn::text)), '0')
FROM (
  SELECT id, row_number() OVER (ORDER BY created_at, id) AS rn
  FROM public.trips
) s
WHERE t.id = s.id;

-- La secuencia continua desde el ultimo numero asignado
SELECT setval(
  'public.trip_codigo_seq',
  COALESCE((SELECT count(*) FROM public.trips), 0) + 1,
  false
);

ALTER TABLE public.trips
  ALTER COLUMN codigo SET DEFAULT public.next_trip_codigo();

ALTER TABLE public.trips
  ALTER COLUMN codigo SET NOT NULL;

ALTER TABLE public.trips
  ADD CONSTRAINT trips_codigo_unique UNIQUE (codigo);
