-- =========================================================================
-- ReySil — Fix RLS completo (idempotente)
-- Migracion 0004
-- =========================================================================
-- Resuelve:
-- 1. Recursion infinita en trips ↔ trip_assignments (SECURITY DEFINER helpers)
-- 2. containers INSERT bloqueado para CLIENTE
-- 3. Reescribe todas las policies problemáticas de forma limpia
-- =========================================================================

-- =========================================================================
-- Schema changes
-- =========================================================================
ALTER TABLE public.trip_reparto_fields
  ADD COLUMN IF NOT EXISTS toneladas NUMERIC;

-- =========================================================================
-- SECURITY DEFINER helpers (CREATE OR REPLACE = idempotente)
-- =========================================================================

CREATE OR REPLACE FUNCTION public.trip_belongs_to_client(p_trip_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.trips
    WHERE id = p_trip_id AND client_id = public.auth_client_id()
  );
$$;

CREATE OR REPLACE FUNCTION public.trip_assigned_to_driver(p_trip_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.trip_assignments
    WHERE trip_id = p_trip_id AND driver_id = public.auth_driver_id()
  );
$$;

CREATE OR REPLACE FUNCTION public.reservation_belongs_to_client(p_reservation_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.reservations
    WHERE id = p_reservation_id AND client_id = public.auth_client_id()
  );
$$;

-- =========================================================================
-- TRIPS policies (fix recursion)
-- =========================================================================
DROP POLICY IF EXISTS trips_select ON public.trips;
CREATE POLICY trips_select ON public.trips
  FOR SELECT TO authenticated
  USING (
    public.auth_is_staff()
    OR client_id = public.auth_client_id()
    OR public.trip_assigned_to_driver(id)
  );

DROP POLICY IF EXISTS trips_insert ON public.trips;
CREATE POLICY trips_insert ON public.trips
  FOR INSERT TO authenticated
  WITH CHECK (
    public.auth_is_staff()
    OR client_id = public.auth_client_id()
  );

DROP POLICY IF EXISTS trips_update_staff ON public.trips;
CREATE POLICY trips_update_staff ON public.trips
  FOR UPDATE TO authenticated
  USING (public.auth_is_staff())
  WITH CHECK (public.auth_is_staff());

DROP POLICY IF EXISTS trips_update_driver ON public.trips;
CREATE POLICY trips_update_driver ON public.trips
  FOR UPDATE TO authenticated
  USING (public.trip_assigned_to_driver(id))
  WITH CHECK (public.trip_assigned_to_driver(id));

DROP POLICY IF EXISTS trips_delete_staff ON public.trips;
CREATE POLICY trips_delete_staff ON public.trips
  FOR DELETE TO authenticated
  USING (public.auth_is_staff());

-- =========================================================================
-- TRIP_ASSIGNMENTS policies (fix recursion)
-- =========================================================================
DROP POLICY IF EXISTS trip_assignments_select ON public.trip_assignments;
CREATE POLICY trip_assignments_select ON public.trip_assignments
  FOR SELECT TO authenticated
  USING (
    public.auth_is_staff()
    OR driver_id = public.auth_driver_id()
    OR public.trip_belongs_to_client(trip_id)
  );

DROP POLICY IF EXISTS trip_assignments_modify_staff ON public.trip_assignments;
CREATE POLICY trip_assignments_modify_staff ON public.trip_assignments
  FOR ALL TO authenticated
  USING (public.auth_is_staff())
  WITH CHECK (public.auth_is_staff());

-- =========================================================================
-- TRIP_REPARTO_FIELDS policies
-- =========================================================================
DROP POLICY IF EXISTS trip_reparto_fields_select ON public.trip_reparto_fields;
CREATE POLICY trip_reparto_fields_select ON public.trip_reparto_fields
  FOR SELECT TO authenticated
  USING (
    public.auth_is_staff()
    OR public.trip_belongs_to_client(trip_id)
    OR public.trip_assigned_to_driver(trip_id)
  );

DROP POLICY IF EXISTS trip_reparto_fields_insert ON public.trip_reparto_fields;
CREATE POLICY trip_reparto_fields_insert ON public.trip_reparto_fields
  FOR INSERT TO authenticated
  WITH CHECK (
    public.auth_is_staff()
    OR public.trip_belongs_to_client(trip_id)
  );

DROP POLICY IF EXISTS trip_reparto_fields_modify_staff ON public.trip_reparto_fields;
CREATE POLICY trip_reparto_fields_modify_staff ON public.trip_reparto_fields
  FOR UPDATE TO authenticated
  USING (public.auth_is_staff())
  WITH CHECK (public.auth_is_staff());

DROP POLICY IF EXISTS trip_reparto_fields_delete_staff ON public.trip_reparto_fields;
CREATE POLICY trip_reparto_fields_delete_staff ON public.trip_reparto_fields
  FOR DELETE TO authenticated
  USING (public.auth_is_staff());

-- =========================================================================
-- TRIP_EVENTS policies
-- =========================================================================
DROP POLICY IF EXISTS trip_events_select ON public.trip_events;
CREATE POLICY trip_events_select ON public.trip_events
  FOR SELECT TO authenticated
  USING (
    public.auth_is_staff()
    OR public.trip_belongs_to_client(trip_id)
    OR public.trip_assigned_to_driver(trip_id)
  );

DROP POLICY IF EXISTS trip_events_insert ON public.trip_events;
CREATE POLICY trip_events_insert ON public.trip_events
  FOR INSERT TO authenticated
  WITH CHECK (
    public.auth_is_staff()
    OR public.trip_assigned_to_driver(trip_id)
  );

DROP POLICY IF EXISTS trip_events_modify_staff ON public.trip_events;
CREATE POLICY trip_events_modify_staff ON public.trip_events
  FOR UPDATE TO authenticated
  USING (public.auth_is_staff())
  WITH CHECK (public.auth_is_staff());

DROP POLICY IF EXISTS trip_events_delete_staff ON public.trip_events;
CREATE POLICY trip_events_delete_staff ON public.trip_events
  FOR DELETE TO authenticated
  USING (public.auth_is_staff());

-- =========================================================================
-- REMITOS policies
-- =========================================================================
DROP POLICY IF EXISTS remitos_select ON public.remitos;
CREATE POLICY remitos_select ON public.remitos
  FOR SELECT TO authenticated
  USING (
    public.auth_is_staff()
    OR public.trip_belongs_to_client(trip_id)
    OR public.trip_assigned_to_driver(trip_id)
  );

DROP POLICY IF EXISTS remitos_insert ON public.remitos;
CREATE POLICY remitos_insert ON public.remitos
  FOR INSERT TO authenticated
  WITH CHECK (
    public.auth_is_staff()
    OR public.trip_assigned_to_driver(trip_id)
  );

DROP POLICY IF EXISTS remitos_update ON public.remitos;
CREATE POLICY remitos_update ON public.remitos
  FOR UPDATE TO authenticated
  USING (
    public.auth_is_staff()
    OR public.trip_assigned_to_driver(trip_id)
  )
  WITH CHECK (
    public.auth_is_staff()
    OR public.trip_assigned_to_driver(trip_id)
  );

DROP POLICY IF EXISTS remitos_delete_staff ON public.remitos;
CREATE POLICY remitos_delete_staff ON public.remitos
  FOR DELETE TO authenticated
  USING (public.auth_is_staff());

-- =========================================================================
-- CONTAINERS policies (fix: add INSERT for CLIENTE via reservation)
-- =========================================================================
DROP POLICY IF EXISTS containers_select ON public.containers;
CREATE POLICY containers_select ON public.containers
  FOR SELECT TO authenticated
  USING (
    public.auth_is_staff()
    OR public.reservation_belongs_to_client(reservation_id)
  );

DROP POLICY IF EXISTS containers_insert ON public.containers;
CREATE POLICY containers_insert ON public.containers
  FOR INSERT TO authenticated
  WITH CHECK (
    public.auth_is_staff()
    OR public.reservation_belongs_to_client(reservation_id)
  );

DROP POLICY IF EXISTS containers_modify_staff ON public.containers;
CREATE POLICY containers_modify_staff ON public.containers
  FOR UPDATE TO authenticated
  USING (public.auth_is_staff())
  WITH CHECK (public.auth_is_staff());

DROP POLICY IF EXISTS containers_delete_staff ON public.containers;
CREATE POLICY containers_delete_staff ON public.containers
  FOR DELETE TO authenticated
  USING (public.auth_is_staff());
