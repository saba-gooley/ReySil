import { createAdminClient } from "@/lib/supabase/server";

export type ChoferTripRow = {
  id: string;
  tipo: "REPARTO" | "CONTENEDOR";
  estado: string;
  fecha_solicitada: string | null;
  origen_descripcion: string | null;
  destino_descripcion: string | null;
  observaciones_cliente: string | null;
  clients: { nombre: string };
  trip_assignments: {
    patente: string;
  } | null;
  trip_reparto_fields: {
    ndv: string | null;
    peso_kg: number | null;
    toneladas: number | null;
    cantidad_bultos: number | null;
    metadata: Record<string, unknown>;
  } | null;
  containers: {
    numero: string | null;
    tipo: string | null;
    peso_carga_kg: number | null;
  } | null;
  trip_events: {
    id: string;
    tipo: string;
    ocurrido_at: string;
  }[];
  trip_driver_data: {
    id: string;
    km_inicial: number | null;
    km_50_porc: number | null;
    km_100_porc: number | null;
    km_final: number | null;
    pernocto: boolean;
    observaciones: string | null;
  } | null;
  remitos: {
    id: string;
    drive_url: string;
    estado: string;
  }[];
};

const CHOFER_TRIP_SELECT = `
  id, tipo, estado, fecha_solicitada,
  origen_descripcion, destino_descripcion, observaciones_cliente,
  clients(nombre),
  trip_assignments(patente),
  trip_reparto_fields(ndv, peso_kg, toneladas, cantidad_bultos, metadata),
  containers(numero, tipo, peso_carga_kg),
  trip_events(id, tipo, ocurrido_at),
  trip_driver_data(id, km_inicial, km_50_porc, km_100_porc, km_final, pernocto, observaciones),
  remitos(id, drive_url, estado)
`;

function unwrapOne(val: unknown): unknown {
  if (Array.isArray(val)) return val[0] ?? null;
  return val ?? null;
}

function normalizeChoferTrips(rows: unknown[]): ChoferTripRow[] {
  return (rows as Record<string, unknown>[]).map((r) => {
    const raw = r as Record<string, unknown>;
    return {
      ...raw,
      clients: unwrapOne(raw.clients) ?? { nombre: "" },
      trip_assignments: unwrapOne(raw.trip_assignments),
      trip_reparto_fields: unwrapOne(raw.trip_reparto_fields),
      containers: unwrapOne(raw.containers),
      trip_driver_data: unwrapOne(raw.trip_driver_data),
      trip_events: Array.isArray(raw.trip_events) ? raw.trip_events : [],
      remitos: Array.isArray(raw.remitos) ? raw.remitos : [],
    } as ChoferTripRow;
  });
}

/**
 * HU-CHO-001: Viajes asignados al chofer para hoy.
 */
export async function listTodayTrips(driverId: string) {
  const supabase = createAdminClient();
  const today = new Date().toISOString().split("T")[0];

  // First get trip IDs assigned to this driver
  const { data: assignments } = await supabase
    .from("trip_assignments")
    .select("trip_id")
    .eq("driver_id", driverId);

  const assignedTripIds = (assignments ?? []).map((a) => a.trip_id);
  if (assignedTripIds.length === 0) return [];

  const { data, error } = await supabase
    .from("trips")
    .select(CHOFER_TRIP_SELECT)
    .in("id", assignedTripIds)
    .eq("fecha_solicitada", today)
    .in("estado", ["ASIGNADO", "EN_CURSO"])
    .order("created_at", { ascending: true });

  if (error) throw error;
  return normalizeChoferTrips(data);
}

/**
 * HU-CHO-002: Get or create shift log for today.
 */
export async function getTodayShift(driverId: string) {
  const supabase = createAdminClient();
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("shift_logs")
    .select("*")
    .eq("driver_id", driverId)
    .eq("fecha", today)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * HU-CHO-005: Get today's inspection.
 */
export async function getTodayInspection(driverId: string) {
  const supabase = createAdminClient();
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("inspections")
    .select(`
      id, patente, fecha, status, pdf_url, observaciones_generales, completado_at,
      inspection_items(id, seccion, item_codigo, item_descripcion, estado, observaciones)
    `)
    .eq("driver_id", driverId)
    .eq("fecha", today)
    .maybeSingle();

  if (error) throw error;
  return data;
}
