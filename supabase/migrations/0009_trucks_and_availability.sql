-- Módulo 9: Gestión de Camiones y Disponibilidad Diaria
-- Crear tabla trucks y vista truck_daily_status

-- Tabla: trucks
-- Registro maestro de camiones con marca, modelo, patente y estado
CREATE TABLE IF NOT EXISTS trucks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marca TEXT NOT NULL,
  modelo TEXT NOT NULL,
  patente TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_trucks_patente ON trucks(patente);
CREATE INDEX IF NOT EXISTS idx_trucks_is_active ON trucks(is_active);

-- RLS: trucks table
ALTER TABLE trucks ENABLE ROW LEVEL SECURITY;

-- Policy: OPERADOR y ADMIN pueden ver todos los camiones activos
CREATE POLICY "operador_admin_view_trucks" ON trucks
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('OPERADOR', 'ADMIN')
    )
  );

-- Policy: OPERADOR y ADMIN pueden crear/editar camiones
CREATE POLICY "operador_admin_manage_trucks" ON trucks
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('OPERADOR', 'ADMIN')
    )
  );

CREATE POLICY "operador_admin_update_trucks" ON trucks
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('OPERADOR', 'ADMIN')
    )
  );

-- Agregar FK truck_id a trip_assignments si no existe
ALTER TABLE trip_assignments
ADD COLUMN IF NOT EXISTS truck_id UUID REFERENCES trucks(id) ON DELETE SET NULL;

-- Crear índice en truck_id
CREATE INDEX IF NOT EXISTS idx_trip_assignments_truck_id ON trip_assignments(truck_id);

-- Vista: truck_daily_status
-- Calcula el estado diario de cada camión (LIBRE/PREASIGNADO/ASIGNADO)
-- Cruzando trips + trip_assignments + trucks
CREATE OR REPLACE VIEW truck_daily_status AS
SELECT
  DATE(trips.fecha_solicitada) as fecha,
  trucks.id,
  trucks.patente,
  trucks.marca,
  trucks.modelo,
  CASE
    WHEN COUNT(CASE WHEN trips.estado = 'ASIGNADO' THEN 1 END) > 0 THEN 'ASIGNADO'
    WHEN COUNT(CASE WHEN trips.estado = 'PREASIGNADO' THEN 1 END) > 0 THEN 'PREASIGNADO'
    ELSE 'LIBRE'
  END as estado
FROM trucks
LEFT JOIN trip_assignments ON trucks.id = trip_assignments.truck_id
LEFT JOIN trips ON trip_assignments.trip_id = trips.id
WHERE trucks.is_active = true
GROUP BY DATE(trips.fecha_solicitada), trucks.id, trucks.patente, trucks.marca, trucks.modelo;

-- Vista: driver_daily_status
-- Calcula el estado diario de cada chofer (LIBRE/PREASIGNADO/ASIGNADO)
CREATE OR REPLACE VIEW driver_daily_status AS
SELECT
  DATE(trips.fecha_solicitada) as fecha,
  drivers.id,
  drivers.codigo,
  drivers.nombre,
  drivers.apellido,
  CASE
    WHEN COUNT(CASE WHEN trips.estado = 'ASIGNADO' THEN 1 END) > 0 THEN 'ASIGNADO'
    WHEN COUNT(CASE WHEN trips.estado = 'PREASIGNADO' THEN 1 END) > 0 THEN 'PREASIGNADO'
    ELSE 'LIBRE'
  END as estado
FROM drivers
LEFT JOIN trip_assignments ON drivers.id = trip_assignments.driver_id
LEFT JOIN trips ON trip_assignments.trip_id = trips.id
WHERE drivers.activo = true
GROUP BY DATE(trips.fecha_solicitada), drivers.id, drivers.codigo, drivers.nombre, drivers.apellido;
