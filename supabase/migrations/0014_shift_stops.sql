-- =========================================================================
-- ReySil — Migracion 0014
-- Paradas de Turno: registro de paradas durante la jornada del chofer
-- Asociadas al turno del día (shift_logs), no a un viaje individual
-- =========================================================================

CREATE TABLE public.shift_stops (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id        UUID NOT NULL REFERENCES public.shift_logs(id) ON DELETE CASCADE,
  hora            TIMESTAMPTZ NOT NULL,
  motivo          TEXT NOT NULL CHECK (motivo IN (
                    'Almorzar', 'Descanso', 'Combustible',
                    'Control policial', 'Choque', 'Otros'
                  )),
  observaciones   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_shift_stops_shift_id ON public.shift_stops(shift_id);

CREATE TRIGGER trg_shift_stops_updated_at
BEFORE UPDATE ON public.shift_stops
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.shift_stops ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- RLS Policies
-- =========================================================================

-- SELECT: CHOFER ve sus propias paradas (via shift_id → shift_logs.driver_id)
--         OPERADOR/ADMIN ven todas
CREATE POLICY shift_stops_select ON public.shift_stops
  FOR SELECT
  USING (
    (SELECT role FROM public.user_profiles WHERE id = auth.uid()) IN ('OPERADOR', 'ADMIN')
    OR
    shift_id IN (
      SELECT id FROM public.shift_logs
      WHERE driver_id = (
        SELECT driver_id FROM public.user_profiles WHERE id = auth.uid()
      )
    )
  );

-- INSERT: solo el CHOFER dueño del turno
CREATE POLICY shift_stops_insert ON public.shift_stops
  FOR INSERT
  WITH CHECK (
    shift_id IN (
      SELECT id FROM public.shift_logs
      WHERE driver_id = (
        SELECT driver_id FROM public.user_profiles WHERE id = auth.uid()
      )
    )
  );

-- DELETE: solo el CHOFER dueño del turno
CREATE POLICY shift_stops_delete ON public.shift_stops
  FOR DELETE
  USING (
    shift_id IN (
      SELECT id FROM public.shift_logs
      WHERE driver_id = (
        SELECT driver_id FROM public.user_profiles WHERE id = auth.uid()
      )
    )
  );
