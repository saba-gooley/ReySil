-- Fix: truck_daily_status usaba truck_id (siempre NULL) para el JOIN.
-- Las acciones de asignación guardan patente (texto), no truck_id.
-- Se cambia el JOIN a trucks.patente = trip_assignments.patente,
-- que es clave única y funciona con todos los datos históricos.

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
LEFT JOIN trip_assignments ON trucks.patente = trip_assignments.patente
LEFT JOIN trips ON trip_assignments.trip_id = trips.id
WHERE trucks.is_active = true
GROUP BY DATE(trips.fecha_solicitada), trucks.id, trucks.patente, trucks.marca, trucks.modelo;
