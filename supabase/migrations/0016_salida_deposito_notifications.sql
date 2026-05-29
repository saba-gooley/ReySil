-- Notification preference for "Salida del Depósito" (Contenedor trips)
ALTER TABLE public.client_notification_preferences
  ADD COLUMN enviar_salida_deposito BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.reysil_notification_emails
  ADD COLUMN enviar_salida_deposito BOOLEAN NOT NULL DEFAULT FALSE;
