-- =========================================================================
-- ReySil — Migracion 0010
-- Agregar preferencia enviar_al_cargar_remito a client_notification_preferences
-- y enviar_remitos a reysil_notification_emails
-- =========================================================================

ALTER TABLE public.client_notification_preferences
  ADD COLUMN enviar_al_cargar_remito BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE public.reysil_notification_emails
  ADD COLUMN enviar_remitos BOOLEAN NOT NULL DEFAULT false;
