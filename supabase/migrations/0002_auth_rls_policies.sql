-- =========================================================================
-- ReySil — RLS Policies (Modulo 2: Autenticacion)
-- Migracion 0002
-- =========================================================================
-- Define las policies de Row Level Security para las 17 tablas creadas en
-- la migracion 0001. Cada policy se enforza a nivel de Postgres usando
-- auth.uid() (UUID del usuario autenticado por Supabase Auth).
--
-- Reglas generales:
--   CLIENTE   - solo ve sus propios datos (filtrado por client_id)
--   CHOFER    - solo ve viajes asignados a el e inspecciones propias
--   OPERADOR  - acceso completo a datos operativos
--   ADMIN     - acceso completo (igual que OPERADOR + parametros del sistema)
--
-- IMPORTANTE: Todas las tablas tienen RLS activado desde la 0001. Sin
-- policies, el acceso queda denegado por default (excepto para service_role,
-- que bypasea RLS).
-- =========================================================================

-- ---------- Helpers ----------
-- Funcion para leer el rol del usuario autenticado.
-- SECURITY DEFINER permite que la funcion lea user_profiles aun cuando
-- las policies del usuario no se lo permitirian directamente, evitando
-- recursion infinita en las policies de user_profiles.
CREATE OR REPLACE FUNCTION public.auth_role()
RETURNS public.user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_profiles WHERE id = auth.uid();
$$;

-- Funcion para leer el client_id del usuario autenticado (si es CLIENTE).
CREATE OR REPLACE FUNCTION public.auth_client_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT client_id FROM public.user_profiles WHERE id = auth.uid();
$$;

-- Funcion para leer el driver_id del usuario autenticado (si es CHOFER).
CREATE OR REPLACE FUNCTION public.auth_driver_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT driver_id FROM public.user_profiles WHERE id = auth.uid();
$$;

-- Helper booleano: el usuario actual es OPERADOR o ADMIN
CREATE OR REPLACE FUNCTION public.auth_is_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role IN ('OPERADOR', 'ADMIN') FROM public.user_profiles WHERE id = auth.uid()),
    false
  );
$$;

-- Permitir a usuarios autenticados ejecutar los helpers
GRANT EXECUTE ON FUNCTION public.auth_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.auth_client_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.auth_driver_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.auth_is_staff() TO authenticated;

-- =========================================================================
-- 1. user_profiles
-- =========================================================================
-- Cada usuario lee SU propio perfil. Staff lee todos.
CREATE POLICY user_profiles_select_own ON public.user_profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.auth_is_staff());

-- Solo staff puede insertar perfiles (los usuarios se crean desde el ABM
-- usando service_role, o por staff manualmente).
CREATE POLICY user_profiles_insert_staff ON public.user_profiles
  FOR INSERT TO authenticated
  WITH CHECK (public.auth_is_staff());

-- Cada usuario actualiza solo su propio perfil (campos basicos como
-- full_name). Staff puede actualizar cualquiera.
CREATE POLICY user_profiles_update_own ON public.user_profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.auth_is_staff())
  WITH CHECK (id = auth.uid() OR public.auth_is_staff());

-- Solo staff borra perfiles.
CREATE POLICY user_profiles_delete_staff ON public.user_profiles
  FOR DELETE TO authenticated
  USING (public.auth_is_staff());

-- =========================================================================
-- 2. clients
-- =========================================================================
-- Staff ve todos. Cliente ve el suyo.
CREATE POLICY clients_select ON public.clients
  FOR SELECT TO authenticated
  USING (
    public.auth_is_staff()
    OR id = public.auth_client_id()
  );

-- Solo staff crea/edita/borra clientes (HU-ADMIN-001 — Modulo 3).
CREATE POLICY clients_insert_staff ON public.clients
  FOR INSERT TO authenticated
  WITH CHECK (public.auth_is_staff());

CREATE POLICY clients_update_staff ON public.clients
  FOR UPDATE TO authenticated
  USING (public.auth_is_staff())
  WITH CHECK (public.auth_is_staff());

CREATE POLICY clients_delete_staff ON public.clients
  FOR DELETE TO authenticated
  USING (public.auth_is_staff());

-- =========================================================================
-- 3. client_emails
-- =========================================================================
CREATE POLICY client_emails_select ON public.client_emails
  FOR SELECT TO authenticated
  USING (
    public.auth_is_staff()
    OR client_id = public.auth_client_id()
  );

CREATE POLICY client_emails_modify_staff ON public.client_emails
  FOR ALL TO authenticated
  USING (public.auth_is_staff())
  WITH CHECK (public.auth_is_staff());

-- =========================================================================
-- 4. client_deposits
-- =========================================================================
-- Cliente ve sus depositos. Choferes y staff ven todos (los choferes
-- necesitan ver origen/destino de viajes asignados).
CREATE POLICY client_deposits_select ON public.client_deposits
  FOR SELECT TO authenticated
  USING (
    public.auth_is_staff()
    OR client_id = public.auth_client_id()
    OR public.auth_role() = 'CHOFER'
  );

CREATE POLICY client_deposits_modify_staff ON public.client_deposits
  FOR ALL TO authenticated
  USING (public.auth_is_staff())
  WITH CHECK (public.auth_is_staff());

-- =========================================================================
-- 5. drivers
-- =========================================================================
-- Staff ve todos. Cada chofer ve su propio registro.
CREATE POLICY drivers_select ON public.drivers
  FOR SELECT TO authenticated
  USING (
    public.auth_is_staff()
    OR id = public.auth_driver_id()
  );

CREATE POLICY drivers_modify_staff ON public.drivers
  FOR ALL TO authenticated
  USING (public.auth_is_staff())
  WITH CHECK (public.auth_is_staff());

-- =========================================================================
-- 6. operators
-- =========================================================================
-- Solo staff ve y modifica operadores.
CREATE POLICY operators_select_staff ON public.operators
  FOR SELECT TO authenticated
  USING (public.auth_is_staff());

CREATE POLICY operators_modify_staff ON public.operators
  FOR ALL TO authenticated
  USING (public.auth_is_staff())
  WITH CHECK (public.auth_is_staff());

-- =========================================================================
-- 7. reservations
-- =========================================================================
CREATE POLICY reservations_select ON public.reservations
  FOR SELECT TO authenticated
  USING (
    public.auth_is_staff()
    OR client_id = public.auth_client_id()
  );

-- Cliente puede crear sus reservas. Staff puede crear cualquiera.
CREATE POLICY reservations_insert ON public.reservations
  FOR INSERT TO authenticated
  WITH CHECK (
    public.auth_is_staff()
    OR client_id = public.auth_client_id()
  );

CREATE POLICY reservations_update_staff ON public.reservations
  FOR UPDATE TO authenticated
  USING (public.auth_is_staff())
  WITH CHECK (public.auth_is_staff());

CREATE POLICY reservations_delete_staff ON public.reservations
  FOR DELETE TO authenticated
  USING (public.auth_is_staff());

-- =========================================================================
-- 8. containers
-- =========================================================================
-- Visibilidad heredada de la reservation padre.
CREATE POLICY containers_select ON public.containers
  FOR SELECT TO authenticated
  USING (
    public.auth_is_staff()
    OR EXISTS (
      SELECT 1 FROM public.reservations r
      WHERE r.id = containers.reservation_id
        AND r.client_id = public.auth_client_id()
    )
    OR public.auth_role() = 'CHOFER'
  );

CREATE POLICY containers_modify_staff ON public.containers
  FOR ALL TO authenticated
  USING (public.auth_is_staff())
  WITH CHECK (public.auth_is_staff());

-- =========================================================================
-- 9. trips
-- =========================================================================
-- CLIENTE ve sus propios viajes.
-- CHOFER ve los viajes que tiene asignados.
-- STAFF ve todos.
CREATE POLICY trips_select ON public.trips
  FOR SELECT TO authenticated
  USING (
    public.auth_is_staff()
    OR client_id = public.auth_client_id()
    OR EXISTS (
      SELECT 1 FROM public.trip_assignments ta
      WHERE ta.trip_id = trips.id
        AND ta.driver_id = public.auth_driver_id()
    )
  );

-- Cliente puede crear sus viajes (HU-CLI-001, HU-CLI-002, HU-CLI-003).
CREATE POLICY trips_insert ON public.trips
  FOR INSERT TO authenticated
  WITH CHECK (
    public.auth_is_staff()
    OR client_id = public.auth_client_id()
  );

-- Update: staff puede todo. Choferes solo pueden cambiar el estado de viajes
-- asignados a ellos (movimientos de pendiente/asignado/en_curso/finalizado).
CREATE POLICY trips_update_staff ON public.trips
  FOR UPDATE TO authenticated
  USING (public.auth_is_staff())
  WITH CHECK (public.auth_is_staff());

CREATE POLICY trips_update_driver ON public.trips
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.trip_assignments ta
      WHERE ta.trip_id = trips.id
        AND ta.driver_id = public.auth_driver_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trip_assignments ta
      WHERE ta.trip_id = trips.id
        AND ta.driver_id = public.auth_driver_id()
    )
  );

CREATE POLICY trips_delete_staff ON public.trips
  FOR DELETE TO authenticated
  USING (public.auth_is_staff());

-- =========================================================================
-- 10. trip_reparto_fields
-- =========================================================================
CREATE POLICY trip_reparto_fields_select ON public.trip_reparto_fields
  FOR SELECT TO authenticated
  USING (
    public.auth_is_staff()
    OR EXISTS (
      SELECT 1 FROM public.trips t
      WHERE t.id = trip_reparto_fields.trip_id
        AND (
          t.client_id = public.auth_client_id()
          OR EXISTS (
            SELECT 1 FROM public.trip_assignments ta
            WHERE ta.trip_id = t.id AND ta.driver_id = public.auth_driver_id()
          )
        )
    )
  );

CREATE POLICY trip_reparto_fields_insert ON public.trip_reparto_fields
  FOR INSERT TO authenticated
  WITH CHECK (
    public.auth_is_staff()
    OR EXISTS (
      SELECT 1 FROM public.trips t
      WHERE t.id = trip_reparto_fields.trip_id
        AND t.client_id = public.auth_client_id()
    )
  );

CREATE POLICY trip_reparto_fields_modify_staff ON public.trip_reparto_fields
  FOR UPDATE TO authenticated
  USING (public.auth_is_staff())
  WITH CHECK (public.auth_is_staff());

CREATE POLICY trip_reparto_fields_delete_staff ON public.trip_reparto_fields
  FOR DELETE TO authenticated
  USING (public.auth_is_staff());

-- =========================================================================
-- 11. trip_assignments
-- =========================================================================
-- Staff lee/escribe todo. Cliente lee asignaciones de sus viajes (sin
-- detalles sensibles). Chofer lee solo las propias.
CREATE POLICY trip_assignments_select ON public.trip_assignments
  FOR SELECT TO authenticated
  USING (
    public.auth_is_staff()
    OR driver_id = public.auth_driver_id()
    OR EXISTS (
      SELECT 1 FROM public.trips t
      WHERE t.id = trip_assignments.trip_id
        AND t.client_id = public.auth_client_id()
    )
  );

CREATE POLICY trip_assignments_modify_staff ON public.trip_assignments
  FOR ALL TO authenticated
  USING (public.auth_is_staff())
  WITH CHECK (public.auth_is_staff());

-- =========================================================================
-- 12. trip_events
-- =========================================================================
-- Staff lee todos. Chofer lee/escribe los de sus viajes asignados.
-- Cliente lee los de sus viajes.
CREATE POLICY trip_events_select ON public.trip_events
  FOR SELECT TO authenticated
  USING (
    public.auth_is_staff()
    OR EXISTS (
      SELECT 1 FROM public.trips t
      WHERE t.id = trip_events.trip_id
        AND (
          t.client_id = public.auth_client_id()
          OR EXISTS (
            SELECT 1 FROM public.trip_assignments ta
            WHERE ta.trip_id = t.id AND ta.driver_id = public.auth_driver_id()
          )
        )
    )
  );

-- Choferes pueden insertar eventos en sus viajes asignados.
CREATE POLICY trip_events_insert ON public.trip_events
  FOR INSERT TO authenticated
  WITH CHECK (
    public.auth_is_staff()
    OR EXISTS (
      SELECT 1 FROM public.trip_assignments ta
      WHERE ta.trip_id = trip_events.trip_id
        AND ta.driver_id = public.auth_driver_id()
    )
  );

-- Update/delete solo staff (los eventos del chofer son inmutables una vez
-- registrados).
CREATE POLICY trip_events_update_staff ON public.trip_events
  FOR UPDATE TO authenticated
  USING (public.auth_is_staff())
  WITH CHECK (public.auth_is_staff());

CREATE POLICY trip_events_delete_staff ON public.trip_events
  FOR DELETE TO authenticated
  USING (public.auth_is_staff());

-- =========================================================================
-- 13. trip_driver_data
-- =========================================================================
CREATE POLICY trip_driver_data_select ON public.trip_driver_data
  FOR SELECT TO authenticated
  USING (
    public.auth_is_staff()
    OR EXISTS (
      SELECT 1 FROM public.trip_assignments ta
      WHERE ta.trip_id = trip_driver_data.trip_id
        AND ta.driver_id = public.auth_driver_id()
    )
  );

CREATE POLICY trip_driver_data_insert ON public.trip_driver_data
  FOR INSERT TO authenticated
  WITH CHECK (
    public.auth_is_staff()
    OR EXISTS (
      SELECT 1 FROM public.trip_assignments ta
      WHERE ta.trip_id = trip_driver_data.trip_id
        AND ta.driver_id = public.auth_driver_id()
    )
  );

CREATE POLICY trip_driver_data_update ON public.trip_driver_data
  FOR UPDATE TO authenticated
  USING (
    public.auth_is_staff()
    OR EXISTS (
      SELECT 1 FROM public.trip_assignments ta
      WHERE ta.trip_id = trip_driver_data.trip_id
        AND ta.driver_id = public.auth_driver_id()
    )
  )
  WITH CHECK (
    public.auth_is_staff()
    OR EXISTS (
      SELECT 1 FROM public.trip_assignments ta
      WHERE ta.trip_id = trip_driver_data.trip_id
        AND ta.driver_id = public.auth_driver_id()
    )
  );

CREATE POLICY trip_driver_data_delete_staff ON public.trip_driver_data
  FOR DELETE TO authenticated
  USING (public.auth_is_staff());

-- =========================================================================
-- 14. remitos
-- =========================================================================
-- Staff lee todos. Cliente lee los de sus viajes. Chofer lee/sube los suyos.
CREATE POLICY remitos_select ON public.remitos
  FOR SELECT TO authenticated
  USING (
    public.auth_is_staff()
    OR EXISTS (
      SELECT 1 FROM public.trips t
      WHERE t.id = remitos.trip_id
        AND (
          t.client_id = public.auth_client_id()
          OR EXISTS (
            SELECT 1 FROM public.trip_assignments ta
            WHERE ta.trip_id = t.id AND ta.driver_id = public.auth_driver_id()
          )
        )
    )
  );

CREATE POLICY remitos_insert ON public.remitos
  FOR INSERT TO authenticated
  WITH CHECK (
    public.auth_is_staff()
    OR EXISTS (
      SELECT 1 FROM public.trip_assignments ta
      WHERE ta.trip_id = remitos.trip_id
        AND ta.driver_id = public.auth_driver_id()
    )
  );

-- Solo staff valida/rechaza remitos.
CREATE POLICY remitos_update_staff ON public.remitos
  FOR UPDATE TO authenticated
  USING (public.auth_is_staff())
  WITH CHECK (public.auth_is_staff());

CREATE POLICY remitos_delete_staff ON public.remitos
  FOR DELETE TO authenticated
  USING (public.auth_is_staff());

-- =========================================================================
-- 15. shift_logs
-- =========================================================================
-- Staff ve todos. Chofer ve/escribe los suyos.
CREATE POLICY shift_logs_select ON public.shift_logs
  FOR SELECT TO authenticated
  USING (
    public.auth_is_staff()
    OR driver_id = public.auth_driver_id()
  );

CREATE POLICY shift_logs_insert ON public.shift_logs
  FOR INSERT TO authenticated
  WITH CHECK (
    public.auth_is_staff()
    OR driver_id = public.auth_driver_id()
  );

CREATE POLICY shift_logs_update ON public.shift_logs
  FOR UPDATE TO authenticated
  USING (
    public.auth_is_staff()
    OR driver_id = public.auth_driver_id()
  )
  WITH CHECK (
    public.auth_is_staff()
    OR driver_id = public.auth_driver_id()
  );

CREATE POLICY shift_logs_delete_staff ON public.shift_logs
  FOR DELETE TO authenticated
  USING (public.auth_is_staff());

-- =========================================================================
-- 16. inspections
-- =========================================================================
-- Staff ve todas. Chofer ve/escribe las suyas.
CREATE POLICY inspections_select ON public.inspections
  FOR SELECT TO authenticated
  USING (
    public.auth_is_staff()
    OR driver_id = public.auth_driver_id()
  );

CREATE POLICY inspections_insert ON public.inspections
  FOR INSERT TO authenticated
  WITH CHECK (
    public.auth_is_staff()
    OR driver_id = public.auth_driver_id()
  );

CREATE POLICY inspections_update ON public.inspections
  FOR UPDATE TO authenticated
  USING (
    public.auth_is_staff()
    OR driver_id = public.auth_driver_id()
  )
  WITH CHECK (
    public.auth_is_staff()
    OR driver_id = public.auth_driver_id()
  );

CREATE POLICY inspections_delete_staff ON public.inspections
  FOR DELETE TO authenticated
  USING (public.auth_is_staff());

-- =========================================================================
-- 17. inspection_items
-- =========================================================================
-- Visibilidad heredada de la inspeccion padre.
CREATE POLICY inspection_items_select ON public.inspection_items
  FOR SELECT TO authenticated
  USING (
    public.auth_is_staff()
    OR EXISTS (
      SELECT 1 FROM public.inspections i
      WHERE i.id = inspection_items.inspection_id
        AND i.driver_id = public.auth_driver_id()
    )
  );

CREATE POLICY inspection_items_insert ON public.inspection_items
  FOR INSERT TO authenticated
  WITH CHECK (
    public.auth_is_staff()
    OR EXISTS (
      SELECT 1 FROM public.inspections i
      WHERE i.id = inspection_items.inspection_id
        AND i.driver_id = public.auth_driver_id()
    )
  );

CREATE POLICY inspection_items_update ON public.inspection_items
  FOR UPDATE TO authenticated
  USING (
    public.auth_is_staff()
    OR EXISTS (
      SELECT 1 FROM public.inspections i
      WHERE i.id = inspection_items.inspection_id
        AND i.driver_id = public.auth_driver_id()
    )
  )
  WITH CHECK (
    public.auth_is_staff()
    OR EXISTS (
      SELECT 1 FROM public.inspections i
      WHERE i.id = inspection_items.inspection_id
        AND i.driver_id = public.auth_driver_id()
    )
  );

CREATE POLICY inspection_items_delete_staff ON public.inspection_items
  FOR DELETE TO authenticated
  USING (public.auth_is_staff());
