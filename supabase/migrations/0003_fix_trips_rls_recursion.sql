-- =========================================================================
-- ReySil — Fix RLS recursion + schema tweaks for Portal Cliente
-- Migracion 0003
-- =========================================================================
-- Problem: trips_select queries trip_assignments, and
-- trip_assignments_select queries trips → infinite recursion.
--
-- Fix: SECURITY DEFINER helpers that bypass RLS to check trip ownership
-- and driver assignment. Then rewrite the policies to use the helpers
-- instead of cross-table subqueries.
-- =========================================================================

-- =========================================================================
-- Schema changes: add toneladas column to trip_reparto_fields
-- =========================================================================
ALTER TABLE public.trip_reparto_fields
  ADD COLUMN IF NOT EXISTS toneladas NUMERIC;

-- ---------- Helper: check if a trip belongs to the authenticated client ----------
CREATE OR REPLACE FUNCTION public.trip_belongs_to_client(p_trip_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.trips
    WHERE id = p_trip_id
      AND client_id = public.auth_client_id()
  );
$$;

-- ---------- Helper: check if a trip is assigned to the authenticated driver ----------
CREATE OR REPLACE FUNCTION public.trip_assigned_to_driver(p_trip_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.trip_assignments
    WHERE trip_id = p_trip_id
      AND driver_id = public.auth_driver_id()
  );
$$;

-- =========================================================================
-- Drop and recreate trips policies
-- =========================================================================

DROP POLICY IF EXISTS trips_select ON public.trips;
CREATE POLICY trips_select ON public.trips
  FOR SELECT TO authenticated
  USING (
    public.auth_is_staff()
    OR client_id = public.auth_client_id()
    OR public.trip_assigned_to_driver(id)
  );

-- trips_insert stays the same (no recursion issue), but recreate for safety
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
-- Drop and recreate trip_assignments policies
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
-- Drop and recreate trip_reparto_fields policies (same recursion risk)
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
-- Drop and recreate trip_events policies (same recursion risk)
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
-- Drop and recreate remitos policies (same recursion risk)
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
-- Containers: client can see containers of their trips
-- =========================================================================

DROP POLICY IF EXISTS containers_select ON public.containers;
CREATE POLICY containers_select ON public.containers
  FOR SELECT TO authenticated
  USING (
    public.auth_is_staff()
    OR EXISTS (
      SELECT 1 FROM public.trips t
      WHERE t.container_id = containers.id
        AND t.client_id = public.auth_client_id()
    )
    OR EXISTS (
      SELECT 1 FROM public.trips t
      JOIN public.trip_assignments ta ON ta.trip_id = t.id
      WHERE t.container_id = containers.id
        AND ta.driver_id = public.auth_driver_id()
    )
  );

-- Use helpers for containers too to avoid potential recursion
DROP POLICY IF EXISTS containers_select ON public.containers;
CREATE OR REPLACE FUNCTION public.container_belongs_to_client(p_container_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.trips
    WHERE container_id = p_container_id
      AND client_id = public.auth_client_id()
  );
$$;

CREATE POLICY containers_select ON public.containers
  FOR SELECT TO authenticated
  USING (
    public.auth_is_staff()
    OR public.container_belongs_to_client(id)
  );
