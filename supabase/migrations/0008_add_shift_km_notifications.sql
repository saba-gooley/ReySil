-- =========================================================================
-- ReySil — Migracion 0008
-- Agregar KM/Pernoctada a shift_logs, comentarios a asignaciones,
-- y tablas de preferencias de notificación por email
-- =========================================================================

-- 1. Agregar campos a shift_logs
-- KM al 50% y 100%, total de KM, y pernoctada
ALTER TABLE public.shift_logs
ADD COLUMN km_50 NUMERIC,
ADD COLUMN km_100 NUMERIC,
ADD COLUMN pernoctada BOOLEAN NOT NULL DEFAULT false;

-- 2. Agregar comentario a trip_assignments
-- El operador puede ingresar un comentario al asignar/reasignar chofer
ALTER TABLE public.trip_assignments
ADD COLUMN comentario_asignacion TEXT;

-- 3. client_notification_preferences — Mails donde enviar notificaciones por cliente
-- Permite a cada cliente especificar a qué direcciones se envían emails
-- al crear solicitudes y al asignar chofer
CREATE TABLE public.client_notification_preferences (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  email           TEXT NOT NULL,
  enviar_al_crear_solicitud  BOOLEAN NOT NULL DEFAULT true,
  enviar_al_asignar_chofer   BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (client_id, email)
);

CREATE INDEX idx_client_notification_preferences_client
  ON public.client_notification_preferences(client_id);
CREATE INDEX idx_client_notification_preferences_email
  ON public.client_notification_preferences(lower(email));

CREATE TRIGGER trg_client_notification_preferences_updated_at
BEFORE UPDATE ON public.client_notification_preferences
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.client_notification_preferences ENABLE ROW LEVEL SECURITY;

-- 4. reysil_notification_emails — Mails internos de ReySil que reciben copias
-- Permite a ReySil especificar qué direcciones internas reciben copias
-- de solicitudes y asignaciones
CREATE TABLE public.reysil_notification_emails (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email                 TEXT UNIQUE NOT NULL,
  enviar_solicitudes    BOOLEAN NOT NULL DEFAULT false,
  enviar_asignaciones   BOOLEAN NOT NULL DEFAULT false,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reysil_notification_emails_email
  ON public.reysil_notification_emails(lower(email));

CREATE TRIGGER trg_reysil_notification_emails_updated_at
BEFORE UPDATE ON public.reysil_notification_emails
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.reysil_notification_emails ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- RLS Policies
-- =========================================================================

-- client_notification_preferences: CLIENTE puede leer/escribir sus propias prefs
CREATE POLICY client_notification_preferences_select ON public.client_notification_preferences
  FOR SELECT
  USING (
    client_id = (SELECT client_id FROM public.user_profiles WHERE id = auth.uid())
    OR
    (SELECT role FROM public.user_profiles WHERE id = auth.uid()) IN ('OPERADOR', 'ADMIN')
  );

CREATE POLICY client_notification_preferences_insert ON public.client_notification_preferences
  FOR INSERT
  WITH CHECK (
    (SELECT role FROM public.user_profiles WHERE id = auth.uid()) IN ('OPERADOR', 'ADMIN')
  );

CREATE POLICY client_notification_preferences_update ON public.client_notification_preferences
  FOR UPDATE
  USING (
    (SELECT role FROM public.user_profiles WHERE id = auth.uid()) IN ('OPERADOR', 'ADMIN')
  );

CREATE POLICY client_notification_preferences_delete ON public.client_notification_preferences
  FOR DELETE
  USING (
    (SELECT role FROM public.user_profiles WHERE id = auth.uid()) IN ('OPERADOR', 'ADMIN')
  );

-- reysil_notification_emails: solo ADMIN puede leer/escribir
CREATE POLICY reysil_notification_emails_select ON public.reysil_notification_emails
  FOR SELECT
  USING (
    (SELECT role FROM public.user_profiles WHERE id = auth.uid()) IN ('OPERADOR', 'ADMIN')
  );

CREATE POLICY reysil_notification_emails_insert ON public.reysil_notification_emails
  FOR INSERT
  WITH CHECK (
    (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'ADMIN'
  );

CREATE POLICY reysil_notification_emails_update ON public.reysil_notification_emails
  FOR UPDATE
  USING (
    (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'ADMIN'
  );

CREATE POLICY reysil_notification_emails_delete ON public.reysil_notification_emails
  FOR DELETE
  USING (
    (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'ADMIN'
  );
