-- =========================================================================
-- 0023 — Horas de llegada/salida por destino (extensión req. 2.12)
-- El chofer registra hora_llegada y hora_salida al visitar cada destino
-- cuando el viaje tiene múltiples destinos (trip_destinations).
-- =========================================================================

ALTER TABLE public.trip_destinations
  ADD COLUMN hora_llegada TIMESTAMPTZ,
  ADD COLUMN hora_salida  TIMESTAMPTZ;
