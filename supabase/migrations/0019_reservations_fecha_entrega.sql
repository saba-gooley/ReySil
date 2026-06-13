-- =========================================================================
-- 0019 — Fecha de Entrega en Solicitudes Contenedor (req. 2.5)
-- Agrega fecha_entrega a reservations para que el cliente pueda indicar
-- la fecha esperada de entrega al crear una solicitud de tipo Contenedor.
-- =========================================================================

ALTER TABLE public.reservations ADD COLUMN fecha_entrega DATE;
