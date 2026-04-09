-- =========================================================================
-- ReySil — Schema Inicial
-- Migracion 0001
-- =========================================================================
-- Crea las tablas base del sistema con RLS activado en todas.
-- Las policies de RLS se definen en una migracion posterior (Modulo 2 — Auth).
-- Mientras tanto, RLS activado sin policies = nadie puede leer/escribir
-- excepto via service_role key.
-- =========================================================================

-- ---------- Extensiones ----------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------- Funciones utilitarias ----------

-- Trigger generico para mantener updated_at al dia
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ---------- ENUMs ----------
CREATE TYPE public.user_role AS ENUM ('CLIENTE', 'OPERADOR', 'CHOFER', 'ADMIN');
CREATE TYPE public.trip_type AS ENUM ('REPARTO', 'CONTENEDOR');
CREATE TYPE public.trip_status AS ENUM (
  'PENDIENTE',   -- creado por cliente, sin chofer asignado
  'ASIGNADO',    -- operador asigno chofer/patente, no inicio aun
  'EN_CURSO',    -- chofer en camino o ejecutando hitos
  'FINALIZADO',  -- chofer cargo remito y operador valido
  'CANCELADO'
);
CREATE TYPE public.inspection_state AS ENUM ('PENDIENTE', 'CUMPLE', 'NO_CUMPLE', 'NA');
CREATE TYPE public.inspection_status AS ENUM ('EN_PROGRESO', 'COMPLETADA');
CREATE TYPE public.remito_status AS ENUM ('PENDIENTE', 'VALIDADO', 'RECHAZADO');
CREATE TYPE public.deposit_type AS ENUM ('DEPOSITO', 'PUERTO', 'OTRO');

-- =========================================================================
-- 1. clients — Empresas clientes de ReySil
-- =========================================================================
CREATE TABLE public.clients (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo      TEXT UNIQUE NOT NULL,
  nombre      TEXT NOT NULL,
  cuit        TEXT,
  telefono    TEXT,
  direccion   TEXT,
  activo      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_clients_updated_at
BEFORE UPDATE ON public.clients
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- 2. client_emails — Emails de acceso por cliente (1..N)
-- =========================================================================
CREATE TABLE public.client_emails (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id     UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  es_principal  BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (client_id, email)
);

CREATE INDEX idx_client_emails_client ON public.client_emails(client_id);
CREATE INDEX idx_client_emails_email ON public.client_emails(lower(email));

ALTER TABLE public.client_emails ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- 3. client_deposits — Depositos/puertos preestablecidos por cliente
-- =========================================================================
CREATE TABLE public.client_deposits (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  nombre      TEXT NOT NULL,
  direccion   TEXT,
  tipo        public.deposit_type NOT NULL DEFAULT 'DEPOSITO',
  activo      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_client_deposits_client ON public.client_deposits(client_id);

ALTER TABLE public.client_deposits ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- 4. drivers — Choferes
-- =========================================================================
CREATE TABLE public.drivers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo      TEXT UNIQUE NOT NULL,
  dni         TEXT UNIQUE NOT NULL,
  nombre      TEXT NOT NULL,
  apellido    TEXT NOT NULL,
  telefono    TEXT,
  activo      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_drivers_updated_at
BEFORE UPDATE ON public.drivers
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- 5. operators — Operadores y administradores de ReySil
-- =========================================================================
CREATE TABLE public.operators (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      TEXT NOT NULL,
  apellido    TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  telefono    TEXT,
  activo      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_operators_updated_at
BEFORE UPDATE ON public.operators
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.operators ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- 6. user_profiles — Perfil extendido vinculado a auth.users
-- Vincula un usuario de Supabase Auth con su rol y entidad de negocio
-- (cliente, chofer u operador).
-- =========================================================================
CREATE TABLE public.user_profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role         public.user_role NOT NULL,
  client_id    UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  driver_id    UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
  operator_id  UUID REFERENCES public.operators(id) ON DELETE SET NULL,
  full_name    TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Cada rol debe vincular su entidad correspondiente y solo esa
  CONSTRAINT user_profiles_role_entity_check CHECK (
    (role = 'CLIENTE'  AND client_id IS NOT NULL AND driver_id IS NULL AND operator_id IS NULL) OR
    (role = 'CHOFER'   AND driver_id IS NOT NULL AND client_id IS NULL AND operator_id IS NULL) OR
    (role IN ('OPERADOR', 'ADMIN') AND operator_id IS NOT NULL AND client_id IS NULL AND driver_id IS NULL)
  )
);

CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX idx_user_profiles_client ON public.user_profiles(client_id) WHERE client_id IS NOT NULL;
CREATE INDEX idx_user_profiles_driver ON public.user_profiles(driver_id) WHERE driver_id IS NOT NULL;
CREATE INDEX idx_user_profiles_operator ON public.user_profiles(operator_id) WHERE operator_id IS NOT NULL;

CREATE TRIGGER trg_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- 7. reservations — Reservas de contenedores (padre de containers)
-- =========================================================================
CREATE TABLE public.reservations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       UUID NOT NULL REFERENCES public.clients(id),
  numero_booking  TEXT,
  naviera         TEXT,
  buque           TEXT,
  fecha_arribo    DATE,
  fecha_carga     DATE,
  observaciones   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by      UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_reservations_client ON public.reservations(client_id);
CREATE INDEX idx_reservations_fecha_carga ON public.reservations(fecha_carga);

CREATE TRIGGER trg_reservations_updated_at
BEFORE UPDATE ON public.reservations
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- 8. containers — Contenedores individuales dentro de una reserva
-- =========================================================================
CREATE TABLE public.containers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id  UUID NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
  numero          TEXT,
  tipo            TEXT, -- "20" | "40" | "40HC"
  precintos       TEXT[],
  peso_carga_kg   NUMERIC,
  observaciones   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_containers_reservation ON public.containers(reservation_id);

ALTER TABLE public.containers ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- 9. trips — Viajes individuales (REPARTO o CONTENEDOR)
-- =========================================================================
CREATE TABLE public.trips (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id                UUID NOT NULL REFERENCES public.clients(id),
  tipo                     public.trip_type NOT NULL,
  estado                   public.trip_status NOT NULL DEFAULT 'PENDIENTE',

  -- Solo para CONTENEDOR
  container_id             UUID REFERENCES public.containers(id),

  -- Origen / destino
  origen_deposit_id        UUID REFERENCES public.client_deposits(id),
  destino_deposit_id       UUID REFERENCES public.client_deposits(id),
  origen_descripcion       TEXT,
  destino_descripcion      TEXT,

  -- Datos generales
  fecha_solicitada         DATE,
  observaciones_cliente    TEXT,

  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by               UUID REFERENCES auth.users(id),

  -- Si es CONTENEDOR debe tener container_id
  CONSTRAINT trips_container_required CHECK (
    (tipo = 'CONTENEDOR' AND container_id IS NOT NULL) OR
    (tipo = 'REPARTO'    AND container_id IS NULL)
  )
);

CREATE INDEX idx_trips_client ON public.trips(client_id);
CREATE INDEX idx_trips_estado ON public.trips(estado);
CREATE INDEX idx_trips_tipo ON public.trips(tipo);
CREATE INDEX idx_trips_fecha_solicitada ON public.trips(fecha_solicitada);
CREATE INDEX idx_trips_container ON public.trips(container_id) WHERE container_id IS NOT NULL;

CREATE TRIGGER trg_trips_updated_at
BEFORE UPDATE ON public.trips
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- 10. trip_reparto_fields — Campos especificos de viajes tipo Reparto
-- (NDV, PAL, CAT, Nro UN, etc — definiciones a confirmar con cliente)
-- =========================================================================
CREATE TABLE public.trip_reparto_fields (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id           UUID NOT NULL UNIQUE REFERENCES public.trips(id) ON DELETE CASCADE,
  ndv               TEXT,
  pal               INTEGER,
  cat               TEXT,
  nro_un            TEXT,
  cantidad_bultos   INTEGER,
  peso_kg           NUMERIC,
  volumen_m3        NUMERIC,
  -- Campos configurables por cliente (forma flexible mientras no haya schema fijo)
  metadata          JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.trip_reparto_fields ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- 11. trip_assignments — Asignacion de chofer y patente al viaje
-- =========================================================================
CREATE TABLE public.trip_assignments (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id            UUID NOT NULL UNIQUE REFERENCES public.trips(id) ON DELETE CASCADE,
  driver_id          UUID NOT NULL REFERENCES public.drivers(id),
  patente            TEXT NOT NULL,
  patente_acoplado   TEXT,
  asignado_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  asignado_by        UUID REFERENCES auth.users(id),
  observaciones      TEXT
);

CREATE INDEX idx_trip_assignments_driver ON public.trip_assignments(driver_id);
CREATE INDEX idx_trip_assignments_asignado_at ON public.trip_assignments(asignado_at);

ALTER TABLE public.trip_assignments ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- 12. trip_events — Hitos registrados por el chofer durante el viaje
-- =========================================================================
CREATE TABLE public.trip_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id         UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  tipo            TEXT NOT NULL,  -- "INICIO_CARGA" | "FIN_CARGA" | "INICIO_VIAJE" | "ARRIBO_DESTINO" | "FIN_DESCARGA"
  ocurrido_at     TIMESTAMPTZ NOT NULL,
  registrado_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  registrado_by   UUID REFERENCES auth.users(id),
  km              NUMERIC,
  observaciones   TEXT,
  metadata        JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX idx_trip_events_trip ON public.trip_events(trip_id);
CREATE INDEX idx_trip_events_ocurrido_at ON public.trip_events(ocurrido_at);

ALTER TABLE public.trip_events ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- 13. trip_driver_data — Datos adicionales por viaje (km, pernocte, etc.)
-- =========================================================================
CREATE TABLE public.trip_driver_data (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id         UUID NOT NULL UNIQUE REFERENCES public.trips(id) ON DELETE CASCADE,
  km_inicial      NUMERIC,
  km_50_porc      NUMERIC,
  km_100_porc     NUMERIC,
  km_final        NUMERIC,
  pernocto        BOOLEAN NOT NULL DEFAULT false,
  observaciones   TEXT,
  registrado_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  registrado_by   UUID REFERENCES auth.users(id)
);

ALTER TABLE public.trip_driver_data ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- 14. remitos — Fotos de remitos firmados con URL de Google Drive
-- =========================================================================
CREATE TABLE public.remitos (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id             UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  drive_url           TEXT NOT NULL,
  drive_file_id       TEXT,
  filename            TEXT,
  estado              public.remito_status NOT NULL DEFAULT 'PENDIENTE',
  observaciones       TEXT,
  uploaded_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  uploaded_by         UUID REFERENCES auth.users(id),
  validated_at        TIMESTAMPTZ,
  validated_by        UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_remitos_trip ON public.remitos(trip_id);
CREATE INDEX idx_remitos_estado ON public.remitos(estado);

ALTER TABLE public.remitos ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- 15. shift_logs — Registro de turno diario del chofer
-- =========================================================================
CREATE TABLE public.shift_logs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id           UUID NOT NULL REFERENCES public.drivers(id),
  fecha               DATE NOT NULL,
  llegada_deposito    TIMESTAMPTZ,
  salida_deposito     TIMESTAMPTZ,
  vuelta_deposito     TIMESTAMPTZ,
  fin_turno           TIMESTAMPTZ,
  observaciones       TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (driver_id, fecha)
);

CREATE INDEX idx_shift_logs_driver_fecha ON public.shift_logs(driver_id, fecha);

CREATE TRIGGER trg_shift_logs_updated_at
BEFORE UPDATE ON public.shift_logs
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.shift_logs ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- 16. inspections — Inspecciones de camion por turno
-- =========================================================================
CREATE TABLE public.inspections (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id                UUID NOT NULL REFERENCES public.drivers(id),
  patente                  TEXT NOT NULL,
  fecha                    DATE NOT NULL,
  status                   public.inspection_status NOT NULL DEFAULT 'EN_PROGRESO',
  pdf_url                  TEXT,
  pdf_drive_file_id        TEXT,
  iniciado_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  completado_at            TIMESTAMPTZ,
  observaciones_generales  TEXT,
  UNIQUE (driver_id, fecha, patente)
);

CREATE INDEX idx_inspections_driver_fecha ON public.inspections(driver_id, fecha);

ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- 17. inspection_items — Items individuales de cada inspeccion
-- =========================================================================
CREATE TABLE public.inspection_items (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id       UUID NOT NULL REFERENCES public.inspections(id) ON DELETE CASCADE,
  seccion             TEXT NOT NULL,           -- "DOCUMENTACION" | "ESTADO_VEHICULO" | etc.
  item_codigo         TEXT NOT NULL,           -- "ART" | "SEGURO" | etc.
  item_descripcion    TEXT NOT NULL,
  estado              public.inspection_state NOT NULL DEFAULT 'PENDIENTE',
  observaciones       TEXT,
  registrado_at       TIMESTAMPTZ
);

CREATE INDEX idx_inspection_items_inspection ON public.inspection_items(inspection_id);
CREATE INDEX idx_inspection_items_seccion ON public.inspection_items(inspection_id, seccion);

ALTER TABLE public.inspection_items ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- Realtime — Habilitar replicacion para tablas que requieren live updates
-- =========================================================================
-- Panel de operadores y seguimiento del cliente se suscriben a estos cambios
ALTER PUBLICATION supabase_realtime ADD TABLE public.trips;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_assignments;
