-- Fix: incluir EN_CURSO en el cálculo de disponibilidad de camiones y choferes.
-- Antes, un viaje que pasaba a EN_CURSO dejaba al camión/chofer como LIBRE.

CREATE OR REPLACE VIEW truck_daily_status AS
SELECT
  DATE(trips.fecha_solicitada) as fecha,
  trucks.id,
  trucks.patente,
  trucks.marca,
  trucks.modelo,
  CASE
    WHEN COUNT(CASE WHEN trips.estado IN ('ASIGNADO', 'EN_CURSO') THEN 1 END) > 0 THEN 'ASIGNADO'
    WHEN COUNT(CASE WHEN trips.estado = 'PREASIGNADO' THEN 1 END) > 0 THEN 'PREASIGNADO'
    ELSE 'LIBRE'
  END as estado
FROM trucks
LEFT JOIN trip_assignments ON trucks.id = trip_assignments.truck_id
LEFT JOIN trips ON trip_assignments.trip_id = trips.id
WHERE trucks.is_active = true
GROUP BY DATE(trips.fecha_solicitada), trucks.id, trucks.patente, trucks.marca, trucks.modelo;

CREATE OR REPLACE VIEW driver_daily_status AS
SELECT
  DATE(trips.fecha_solicitada) as fecha,
  drivers.id,
  drivers.codigo,
  drivers.nombre,
  drivers.apellido,
  CASE
    WHEN COUNT(CASE WHEN trips.estado IN ('ASIGNADO', 'EN_CURSO') THEN 1 END) > 0 THEN 'ASIGNADO'
    WHEN COUNT(CASE WHEN trips.estado = 'PREASIGNADO' THEN 1 END) > 0 THEN 'PREASIGNADO'
    ELSE 'LIBRE'
  END as estado
FROM drivers
LEFT JOIN trip_assignments ON drivers.id = trip_assignments.driver_id
LEFT JOIN trips ON trip_assignments.trip_id = trips.id
WHERE drivers.activo = true
GROUP BY DATE(trips.fecha_solicitada), drivers.id, drivers.codigo, drivers.nombre, drivers.apellido;
