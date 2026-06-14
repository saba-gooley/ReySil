-- =========================================================================
-- 0021 — Fecha de Entrega a nivel de container (req. 2.5 correccion)
-- La fecha_entrega que vale es la del container individual.
-- reservations.fecha_entrega (migration 0019) se usa como valor general
-- en el formulario para pre-rellenar los containers; no se muestra en la app.
-- =========================================================================

ALTER TABLE public.containers ADD COLUMN fecha_entrega DATE;
