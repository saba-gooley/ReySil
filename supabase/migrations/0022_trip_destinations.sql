-- =========================================================================
-- 0022 — Múltiples Destinos por Solicitud (req. 2.12)
-- Cuando multiples_destinos = true en el form, los destinos se guardan
-- en esta tabla. trips.destino_descripcion conserva el primer destino
-- para backward compat con vistas existentes.
-- =========================================================================

CREATE TABLE public.trip_destinations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id     UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  destino     TEXT NOT NULL,
  observaciones TEXT,
  orden       SMALLINT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_trip_destinations_trip ON public.trip_destinations(trip_id);

ALTER TABLE public.trip_destinations ENABLE ROW LEVEL SECURITY;

-- CLIENTE ve sus propios destinos; CHOFER los del viaje asignado; OPERADOR/ADMIN todos
CREATE POLICY "cliente_view_own_trip_destinations" ON public.trip_destinations
  FOR SELECT TO authenticated
  USING (
    trip_id IN (
      SELECT id FROM public.trips
      WHERE client_id = public.auth_client_id()
    )
    OR public.auth_is_staff()
    OR trip_id IN (
      SELECT trip_id FROM public.trip_assignments
      WHERE driver_id = public.auth_driver_id()
    )
  );

CREATE POLICY "staff_manage_trip_destinations" ON public.trip_destinations
  FOR ALL TO authenticated
  USING (public.auth_is_staff())
  WITH CHECK (public.auth_is_staff());
