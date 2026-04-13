import { createAdminClient } from "@/lib/supabase/server";

export type TripRow = {
  id: string;
  client_id: string;
  tipo: "REPARTO" | "CONTENEDOR";
  estado: string;
  container_id: string | null;
  origen_deposit_id: string | null;
  destino_deposit_id: string | null;
  origen_descripcion: string | null;
  destino_descripcion: string | null;
  fecha_solicitada: string | null;
  observaciones_cliente: string | null;
  created_at: string;
  trip_assignments: {
    patente: string;
    drivers: { nombre: string; apellido: string };
  } | null;
  trip_reparto_fields: {
    ndv: string | null;
    pal: number | null;
    cat: string | null;
    nro_un: string | null;
    cantidad_bultos: number | null;
    peso_kg: number | null;
    toneladas: number | null;
    metadata: Record<string, unknown>;
  } | null;
  trip_events: {
    id: string;
    tipo: string;
    ocurrido_at: string;
    observaciones: string | null;
  }[];
  containers: {
    numero: string | null;
    tipo: string | null;
    peso_carga_kg: number | null;
    precintos: string[] | null;
    observaciones: string | null;
    reservations: {
      numero_booking: string | null;
      naviera: string | null;
      buque: string | null;
      fecha_arribo: string | null;
      fecha_carga: string | null;
      observaciones: string | null;
      orden: string | null;
      mercaderia: string | null;
      despacho: string | null;
      carga: string | null;
      terminal: string | null;
      devuelve_en: string | null;
      libre_hasta: string | null;
    } | null;
  } | null;
  remitos: {
    id: string;
    drive_url: string;
    estado: string;
  }[];
};

/** Unwrap a value that may be an array (anon key) or a single object (service role). */
function unwrapOne(val: unknown): unknown {
  if (Array.isArray(val)) return val[0] ?? null;
  return val ?? null;
}

function normalizeTrips(rows: unknown[]): TripRow[] {
  return (rows as Record<string, unknown>[]).map((r) => {
    const raw = r as Record<string, unknown>;

    // Normalize container + nested reservation
    const container = unwrapOne(raw.containers) as Record<string, unknown> | null;
    let normalizedContainer = null;
    if (container) {
      normalizedContainer = {
        ...container,
        reservations: unwrapOne(container.reservations) ?? null,
      };
    }

    // Normalize assignment + nested drivers
    const assignment = unwrapOne(raw.trip_assignments) as Record<string, unknown> | null;
    let normalizedAssignment = null;
    if (assignment) {
      normalizedAssignment = {
        ...assignment,
        drivers: unwrapOne(assignment.drivers) ?? null,
      };
    }

    return {
      ...raw,
      trip_assignments: normalizedAssignment,
      trip_reparto_fields: unwrapOne(raw.trip_reparto_fields),
      containers: normalizedContainer,
      trip_events: Array.isArray(raw.trip_events) ? raw.trip_events : [],
      remitos: Array.isArray(raw.remitos) ? raw.remitos : [],
    } as TripRow;
  });
}

const TRIP_SELECT = `
  id, client_id, tipo, estado, container_id,
  origen_deposit_id, destino_deposit_id,
  origen_descripcion, destino_descripcion,
  fecha_solicitada, observaciones_cliente, created_at,
  trip_assignments(patente, drivers(nombre, apellido)),
  trip_reparto_fields(ndv, pal, cat, nro_un, cantidad_bultos, peso_kg, toneladas, metadata),
  trip_events(id, tipo, ocurrido_at, observaciones),
  containers(numero, tipo, peso_carga_kg, precintos, observaciones, reservations(numero_booking, naviera, buque, fecha_arribo, fecha_carga, observaciones, orden, mercaderia, despacho, carga, terminal, devuelve_en, libre_hasta)),
  remitos(id, drive_url, estado)
`;

/**
 * Viajes activos del cliente (PENDIENTE, ASIGNADO, EN_CURSO).
 * HU-CLI-004
 */
export async function listActiveTrips(clientId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("trips")
    .select(TRIP_SELECT)
    .eq("client_id", clientId)
    .in("estado", ["PENDIENTE", "PREASIGNADO", "ASIGNADO", "EN_CURSO"])
    .order("fecha_solicitada", { ascending: true });

  if (error) throw error;
  return normalizeTrips(data);
}

/**
 * Historial de viajes finalizados/cancelados del cliente.
 * HU-CLI-005
 */
export async function listTripHistory(
  clientId: string,
  options?: { from?: string; to?: string; page?: number; pageSize?: number },
) {
  const supabase = createAdminClient();
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 20;
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from("trips")
    .select(TRIP_SELECT, { count: "exact" })
    .eq("client_id", clientId)
    .in("estado", ["FINALIZADO", "CANCELADO"])
    .order("fecha_solicitada", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (options?.from) {
    query = query.gte("fecha_solicitada", options.from);
  }
  if (options?.to) {
    query = query.lte("fecha_solicitada", options.to);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: normalizeTrips(data), total: count ?? 0 };
}

/**
 * Depositos preestablecidos del cliente para selectores de origen/destino.
 */
export async function listClientDeposits(clientId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("client_deposits")
    .select("id, nombre, direccion, tipo, activo")
    .eq("client_id", clientId)
    .eq("activo", true)
    .order("nombre");

  if (error) throw error;
  return data;
}
