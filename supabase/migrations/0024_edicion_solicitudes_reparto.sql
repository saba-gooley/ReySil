BEGIN;

-- =========================================================================
-- 0024 — Edicion de solicitudes REPARTO (req. 2.16)
--
-- Habilita que operador/admin y el propio cliente editen una solicitud
-- mientras esta en PENDIENTE, PREASIGNADO o ASIGNADO.
-- En EN_CURSO y FINALIZADO la edicion queda bloqueada.
--
-- Hasta ahora el rol CLIENTE solo tenia INSERT y SELECT sobre trips.
-- Esta migracion abre UPDATE (y ABM de destinos) con el gate de estado
-- dentro de la propia policy, para que la seguridad no dependa de que la
-- Server Action se acuerde de validar.
--
-- Alcance: solo REPARTO. La edicion de CONTENEDOR (a nivel reserva) queda
-- para un requerimiento posterior.
-- =========================================================================

-- -------------------------------------------------------------------------
-- Helpers
-- -------------------------------------------------------------------------

-- Unica fuente de verdad en SQL de "que estados son editables".
-- El equivalente en TS vive en lib/server/trips/editable.ts — mantener ambos
-- en sincronia (hay un test que lo verifica).
CREATE OR REPLACE FUNCTION public.trip_estado_editable(p_estado public.trip_status)
RETURNS boolean
LANGUAGE sql IMMUTABLE
AS $$
  SELECT p_estado IN ('PENDIENTE', 'PREASIGNADO', 'ASIGNADO');
$$;

-- Ownership + estado en una sola llamada. SECURITY DEFINER para no reintroducir
-- la recursion de policies que arreglaron 0003/0004.
CREATE OR REPLACE FUNCTION public.trip_editable_by_client(p_trip_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.trips
    WHERE id = p_trip_id
      AND client_id = public.auth_client_id()
      AND public.trip_estado_editable(estado)
  );
$$;

GRANT EXECUTE ON FUNCTION public.trip_estado_editable(public.trip_status) TO authenticated;
GRANT EXECUTE ON FUNCTION public.trip_editable_by_client(uuid) TO authenticated;

-- -------------------------------------------------------------------------
-- trips — UPDATE para CLIENTE
-- -------------------------------------------------------------------------
-- USING evalua la fila vieja (no se puede editar un viaje ya EN_CURSO) y
-- WITH CHECK la nueva (no se puede dejar el viaje fuera del set editable).
DROP POLICY IF EXISTS trips_update_cliente ON public.trips;
CREATE POLICY trips_update_cliente ON public.trips
  FOR UPDATE TO authenticated
  USING (
    client_id = public.auth_client_id()
    AND public.trip_estado_editable(estado)
  )
  WITH CHECK (
    client_id = public.auth_client_id()
    AND public.trip_estado_editable(estado)
  );

-- WITH CHECK impide saltar a EN_CURSO/FINALIZADO, pero no impide que un
-- cliente se mueva PENDIENTE -> ASIGNADO por su cuenta. Las policies de
-- Postgres no distinguen por columna, y un GRANT UPDATE(cols) no sirve
-- porque staff y cliente comparten el rol `authenticated`.
-- Un trigger si puede: bloquea el cambio de estado/cliente salvo que quien
-- escribe sea staff, el chofer asignado, o el service_role (auth.uid() null,
-- que es como corren las Server Actions y las migraciones).
CREATE OR REPLACE FUNCTION public.trips_guard_cliente_update()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL
     OR public.auth_is_staff()
     OR public.trip_assigned_to_driver(NEW.id) THEN
    RETURN NEW;
  END IF;

  IF NEW.estado IS DISTINCT FROM OLD.estado THEN
    RAISE EXCEPTION 'No autorizado a cambiar el estado del viaje';
  END IF;

  IF NEW.client_id IS DISTINCT FROM OLD.client_id THEN
    RAISE EXCEPTION 'No autorizado a cambiar el cliente del viaje';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_trips_guard_cliente_update ON public.trips;
CREATE TRIGGER trg_trips_guard_cliente_update
BEFORE UPDATE ON public.trips
FOR EACH ROW EXECUTE FUNCTION public.trips_guard_cliente_update();

-- -------------------------------------------------------------------------
-- trip_reparto_fields — UPDATE para CLIENTE
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS trip_reparto_fields_update_cliente ON public.trip_reparto_fields;
CREATE POLICY trip_reparto_fields_update_cliente ON public.trip_reparto_fields
  FOR UPDATE TO authenticated
  USING (public.trip_editable_by_client(trip_id))
  WITH CHECK (public.trip_editable_by_client(trip_id));

-- -------------------------------------------------------------------------
-- trip_destinations — ABM para CLIENTE
-- -------------------------------------------------------------------------
-- Agregar destinos a un viaje de destino unico lo convierte en multi-destino
-- (el modo lo determina la existencia de filas, no un flag).
DROP POLICY IF EXISTS trip_destinations_insert_cliente ON public.trip_destinations;
CREATE POLICY trip_destinations_insert_cliente ON public.trip_destinations
  FOR INSERT TO authenticated
  WITH CHECK (public.trip_editable_by_client(trip_id));

DROP POLICY IF EXISTS trip_destinations_update_cliente ON public.trip_destinations;
CREATE POLICY trip_destinations_update_cliente ON public.trip_destinations
  FOR UPDATE TO authenticated
  USING (public.trip_editable_by_client(trip_id))
  WITH CHECK (public.trip_editable_by_client(trip_id));

DROP POLICY IF EXISTS trip_destinations_delete_cliente ON public.trip_destinations;
CREATE POLICY trip_destinations_delete_cliente ON public.trip_destinations
  FOR DELETE TO authenticated
  USING (public.trip_editable_by_client(trip_id));

-- -------------------------------------------------------------------------
-- Notificacion de edicion a ReySil
-- -------------------------------------------------------------------------
-- Solo se notifica cuando edita el CLIENTE. Cuando edita el operador no se
-- manda nada (ya esta mirando el viaje).
ALTER TABLE public.reysil_notification_emails
  ADD COLUMN IF NOT EXISTS enviar_ediciones BOOLEAN NOT NULL DEFAULT false;

COMMIT;
