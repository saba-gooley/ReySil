import type { RepartoForEdit } from "@/lib/server/trips/queries";

export type DestinoEntry = {
  key: number;
  destino: string;
  observaciones: string;
};

/**
 * Estado inicial del formulario de Reparto (req. 2.16).
 * Todo string porque son valores de <input>; la conversion a numero pasa al
 * armar el payload.
 */
export type RepartoInitialValues = {
  tripId: string;
  codigo: string;
  clientId: string;
  fechaSolicitada: string;
  fechaEntrega: string;
  origenDepositId: string;
  origenDescripcion: string;
  destinoDescripcion: string;
  observaciones: string;
  ndv: string;
  pal: string;
  cat: string;
  nroUn: string;
  cantidadBultos: string;
  pesoKg: string;
  toneladas: string;
  codigoPostal: string;
  zonaTarifa: string;
  horario: string;
  tipoCamion: string;
  peon: string;
  multiplesDestinos: boolean;
  destinos: DestinoEntry[];
};

function str(val: unknown): string {
  if (val === null || val === undefined) return "";
  return String(val);
}

/**
 * Convierte una solicitud guardada en los valores que rellenan el formulario.
 *
 * Dos detalles que no son obvios:
 * - El origen puede ser un deposito preestablecido o texto libre. Si no hay
 *   deposit_id pero si descripcion, el selector arranca en "otro".
 * - Que el viaje sea multi-destino lo determina la existencia de filas en
 *   trip_destinations, no un flag guardado.
 */
export function repartoToInitialValues(trip: RepartoForEdit): RepartoInitialValues {
  const fields = trip.trip_reparto_fields;
  const metadata = (fields?.metadata ?? {}) as Record<string, unknown>;
  const destinations = trip.trip_destinations ?? [];
  const multiplesDestinos = destinations.length > 0;

  return {
    tripId: trip.id,
    codigo: trip.codigo,
    clientId: trip.client_id,
    fechaSolicitada: str(trip.fecha_solicitada),
    fechaEntrega: str(metadata.fecha_entrega),
    origenDepositId: trip.origen_deposit_id ?? (trip.origen_descripcion ? "otro" : ""),
    origenDescripcion: str(trip.origen_descripcion),
    destinoDescripcion: str(trip.destino_descripcion),
    observaciones: str(trip.observaciones_cliente),
    ndv: str(fields?.ndv),
    pal: str(fields?.pal),
    cat: str(fields?.cat),
    nroUn: str(fields?.nro_un),
    cantidadBultos: str(fields?.cantidad_bultos),
    pesoKg: str(fields?.peso_kg),
    toneladas: str(fields?.toneladas),
    codigoPostal: str(metadata.codigo_postal),
    zonaTarifa: str(metadata.zona_tarifa),
    horario: str(metadata.horario),
    tipoCamion: str(metadata.tipo_camion),
    peon: str(metadata.peon),
    multiplesDestinos,
    destinos: multiplesDestinos
      ? destinations.map((d, i) => ({
          key: i + 1,
          destino: d.destino,
          observaciones: d.observaciones ?? "",
        }))
      : [{ key: 1, destino: "", observaciones: "" }],
  };
}

/** Valores de un formulario vacio (modo alta). */
export function emptyRepartoValues(): RepartoInitialValues {
  return {
    tripId: "",
    codigo: "",
    clientId: "",
    fechaSolicitada: "",
    fechaEntrega: "",
    origenDepositId: "",
    origenDescripcion: "",
    destinoDescripcion: "",
    observaciones: "",
    ndv: "",
    pal: "",
    cat: "",
    nroUn: "",
    cantidadBultos: "",
    pesoKg: "",
    toneladas: "",
    codigoPostal: "",
    zonaTarifa: "",
    horario: "",
    tipoCamion: "",
    peon: "",
    multiplesDestinos: false,
    destinos: [{ key: 1, destino: "", observaciones: "" }],
  };
}
