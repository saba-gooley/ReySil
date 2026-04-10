import { createClient } from "@/lib/supabase/server";

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
  } | null;
  remitos: {
    id: string;
    drive_url: string;
    estado: string;
  }[];
};

/**
 * Supabase returns all joined relations as arrays. For 1:1 relations
 * (trip_assignments, trip_reparto_fields, containers) we normalize
 * them to single objects or null.
 */
function normalizeTrips(rows: unknown[]): TripRow[] {
  return (rows as Record<string, unknown>[]).map((r) => {
    const raw = r as Record<string, unknown>;
    const assignments = raw.trip_assignments as unknown[] | null;
    const fields = raw.trip_reparto_fields as unknown[] | null;
    const cont = raw.containers as unknown[] | null;
    return {
      ...raw,
      trip_assignments: assignments?.[0] ?? null,
      trip_reparto_fields: fields?.[0] ?? null,
      containers: cont?.[0] ?? null,
      trip_events: (raw.trip_events as unknown[]) ?? [],
      remitos: (raw.remitos as unknown[]) ?? [],
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
  containers(numero, tipo, peso_carga_kg),
  remitos(id, drive_url, estado)
`;

/**
 * Viajes activos del cliente (PENDIENTE, ASIGNADO, EN_CURSO).
 * HU-CLI-004
 */
export async function listActiveTrips(clientId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("trips")
    .select(TRIP_SELECT)
    .eq("client_id", clientId)
    .in("estado", ["PENDIENTE", "ASIGNADO", "EN_CURSO"])
    .order("created_at", { ascending: false });

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
  const supabase = createClient();
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 20;
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from("trips")
    .select(TRIP_SELECT, { count: "exact" })
    .eq("client_id", clientId)
    .in("estado", ["FINALIZADO", "CANCELADO"])
    .order("created_at", { ascending: false })
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
  const supabase = createClient();
  const { data, error } = await supabase
    .from("client_deposits")
    .select("id, nombre, direccion, tipo, activo")
    .eq("client_id", clientId)
    .eq("activo", true)
    .order("nombre");

  if (error) throw error;
  return data;
}
