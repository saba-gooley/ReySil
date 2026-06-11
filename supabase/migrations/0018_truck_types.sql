-- =========================================================================
-- 0018 — ABM Tipos de Camion (req. 2.15 — Modulo 11)
-- El campo "Tipo de Camion" del formulario de Reparto deja de ser un enum
-- hardcodeado y pasa a ser configurable. Baja logica via is_active para no
-- romper viajes historicos.
-- =========================================================================

CREATE TABLE public.truck_types (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      TEXT UNIQUE NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_truck_types_updated_at
BEFORE UPDATE ON public.truck_types
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.truck_types ENABLE ROW LEVEL SECURITY;

-- Lectura: cualquier usuario autenticado (los forms de Reparto cargan las opciones)
CREATE POLICY "authenticated_view_truck_types" ON public.truck_types
  FOR SELECT TO authenticated
  USING (true);

-- Escritura: solo ADMIN
CREATE POLICY "admin_insert_truck_types" ON public.truck_types
  FOR INSERT TO authenticated
  WITH CHECK (public.auth_role() = 'ADMIN');

CREATE POLICY "admin_update_truck_types" ON public.truck_types
  FOR UPDATE TO authenticated
  USING (public.auth_role() = 'ADMIN')
  WITH CHECK (public.auth_role() = 'ADMIN');

-- Seed con los valores hoy hardcodeados en los formularios
INSERT INTO public.truck_types (nombre) VALUES
  ('CHASIS'),
  ('SEMI'),
  ('710'),
  ('PICK UP'),
  ('Balancín'),
  ('Doble Piso'),
  ('Otro')
ON CONFLICT (nombre) DO NOTHING;
