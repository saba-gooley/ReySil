-- =========================================================================
-- ReySil — Fix trip_driver_data RLS to use SECURITY DEFINER helpers
-- Migracion 0005
-- =========================================================================

DROP POLICY IF EXISTS trip_driver_data_select ON public.trip_driver_data;
CREATE POLICY trip_driver_data_select ON public.trip_driver_data
  FOR SELECT TO authenticated
  USING (
    public.auth_is_staff()
    OR public.trip_assigned_to_driver(trip_id)
  );

DROP POLICY IF EXISTS trip_driver_data_insert ON public.trip_driver_data;
CREATE POLICY trip_driver_data_insert ON public.trip_driver_data
  FOR INSERT TO authenticated
  WITH CHECK (
    public.auth_is_staff()
    OR public.trip_assigned_to_driver(trip_id)
  );

DROP POLICY IF EXISTS trip_driver_data_update ON public.trip_driver_data;
CREATE POLICY trip_driver_data_update ON public.trip_driver_data
  FOR UPDATE TO authenticated
  USING (
    public.auth_is_staff()
    OR public.trip_assigned_to_driver(trip_id)
  )
  WITH CHECK (
    public.auth_is_staff()
    OR public.trip_assigned_to_driver(trip_id)
  );

DROP POLICY IF EXISTS trip_driver_data_delete_staff ON public.trip_driver_data;
CREATE POLICY trip_driver_data_delete_staff ON public.trip_driver_data
  FOR DELETE TO authenticated
  USING (public.auth_is_staff());
