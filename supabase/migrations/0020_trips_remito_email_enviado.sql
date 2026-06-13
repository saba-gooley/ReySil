-- =========================================================================
-- 0020 — Indicador de email de remitos enviado (req. 2.7/2.8)
-- Cuando el operador o chofer presiona "Enviar Mail" con los remitos del
-- viaje, se registra el timestamp aqui. NULL = mail no enviado aun.
-- =========================================================================

ALTER TABLE public.trips ADD COLUMN remito_email_enviado_at TIMESTAMPTZ;
