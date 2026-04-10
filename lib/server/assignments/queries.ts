import { createClient } from "@/lib/supabase/server";

export type OperatorTripRow = {
  id: string;
  client_id: string;
  tipo: "REPARTO" | "CONTENEDOR";
  estado: string;
  container_id: string | null;
  origen_deposit_id: string | null;
  origen_descripcion: string | null;
  destino_descripcion: string | null;
  fecha_solicitada: string | null;
  observaciones_cliente: string | null;
  created_at: string;
  clients: {
    nombre: string;
    codigo: string;
  };
  trip_assignments: {
    id: string;
    patente: string;
    patente_acoplado: string | null;
    driver_id: string;
    drivers: { id: string; nombre: string; apellido: string; codigo: string };
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
  containers: {
    id: string;
    numero: string | null;
    tipo: string | null;
    peso_carga_kg: number | null;
    reservation_id: string;
    reservations: {
      numero_booking: string | null;
      naviera: string | null;
      buque: string | null;
    };
  } | null;
  trip_events: {
    id: string;
    tipo: string;
    ocurrido_at: string;
    observaciones: string | null;
  }[];
  remitos: {
    id: string;
    drive_url: string;
    estado: string;
    uploaded_at: string;
  }[];
};

const OPERATOR_TRIP_SELECT = `
  id, client_id, tipo, estado, container_id,
  origen_deposit_id,
  origen_descripcion, destino_descripcion,
  fecha_solicitada, observaciones_cliente, created_at,
  clients(nombre, codigo),
  trip_assignments(id, patente, patente_acoplado, driver_id, drivers(id, nombre, apellido, codigo)),
  trip_reparto_fields(ndv, pal, cat, nro_un, cantidad_bultos, peso_kg, toneladas, metadata),
  containers(id, numero, tipo, peso_carga_kg, reservation_id, reservations(numero_booking, naviera, buque)),
  trip_events(id, tipo, ocurrido_at, observaciones),
  remitos(id, drive_url, estado, uploaded_at)
`;

function normalizeOperatorTrips(rows: unknown[]): OperatorTripRow[] {
  return (rows as Record<string, unknown>[]).map((r) => {
    const raw = r as Record<string, unknown>;
    const assignments = raw.trip_assignments as unknown[] | null;
    const fields = raw.trip_reparto_fields as unknown[] | null;
    const cont = raw.containers as unknown[] | null;
    const clients = raw.clients as unknown[] | null;
    return {
      ...raw,
      clients: clients?.[0] ?? { nombre: "", codigo: "" },
      trip_assignments: assignments?.[0] ?? null,
      trip_reparto_fields: fields?.[0] ?? null,
      containers: cont?.[0] ?? null,
      trip_events: (raw.trip_events as unknown[]) ?? [],
      remitos: (raw.remitos as unknown[]) ?? [],
    } as OperatorTripRow;
  });
}

/**
 * HU-OPE-001: Viajes pendientes de asignación (estado PENDIENTE).
 */
export async function listPendingTrips() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("trips")
    .select(OPERATOR_TRIP_SELECT)
    .eq("estado", "PENDIENTE")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return normalizeOperatorTrips(data);
}

/**
 * HU-OPE-004: Viajes con chofer asignado (estado ASIGNADO).
 */
export async function listAssignedTrips() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("trips")
    .select(OPERATOR_TRIP_SELECT)
    .eq("estado", "ASIGNADO")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return normalizeOperatorTrips(data);
}

/**
 * HU-OPE-005: Viajes en curso.
 */
export async function listInProgressTrips() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("trips")
    .select(OPERATOR_TRIP_SELECT)
    .eq("estado", "EN_CURSO")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return normalizeOperatorTrips(data);
}

/**
 * HU-OPE-005: Viajes finalizados con paginación.
 */
export async function listFinishedTrips(options?: {
  page?: number;
  pageSize?: number;
  from?: string;
  to?: string;
}) {
  const supabase = createClient();
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 20;
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from("trips")
    .select(OPERATOR_TRIP_SELECT, { count: "exact" })
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
  return { data: normalizeOperatorTrips(data), total: count ?? 0 };
}

/**
 * HU-OPE-007: Toneladas por camión para una fecha.
 */
export async function getToneladasByDate(fecha: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("trips")
    .select(`
      id, fecha_solicitada,
      trip_assignments(patente, drivers(nombre, apellido)),
      trip_reparto_fields(toneladas, peso_kg)
    `)
    .eq("tipo", "REPARTO")
    .eq("fecha_solicitada", fecha)
    .in("estado", ["ASIGNADO", "EN_CURSO", "FINALIZADO"]);

  if (error) throw error;

  // Aggregate by patente
  const byPatente = new Map<
    string,
    { patente: string; chofer: string; totalToneladas: number; totalKg: number; viajes: number }
  >();

  for (const row of data as Record<string, unknown>[]) {
    const assignments = row.trip_assignments as unknown[] | null;
    const fields = row.trip_reparto_fields as unknown[] | null;
    const assignment = assignments?.[0] as Record<string, unknown> | undefined;
    const field = fields?.[0] as Record<string, unknown> | undefined;

    if (!assignment) continue;

    const patente = assignment.patente as string;
    const drivers = assignment.drivers as Record<string, string> | null;
    const chofer = drivers ? `${drivers.nombre} ${drivers.apellido}` : "—";
    const toneladas = (field?.toneladas as number) ?? 0;
    const pesoKg = (field?.peso_kg as number) ?? 0;

    const existing = byPatente.get(patente);
    if (existing) {
      existing.totalToneladas += toneladas;
      existing.totalKg += pesoKg;
      existing.viajes += 1;
    } else {
      byPatente.set(patente, {
        patente,
        chofer,
        totalToneladas: toneladas,
        totalKg: pesoKg,
        viajes: 1,
      });
    }
  }

  return Array.from(byPatente.values()).sort((a, b) =>
    a.patente.localeCompare(b.patente),
  );
}

/**
 * HU-OPE-008: Reportes — viajes por cliente y por chofer en rango de fechas.
 */
export async function getReportData(from: string, to: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("trips")
    .select(`
      id, tipo, estado, fecha_solicitada,
      clients(nombre, codigo),
      trip_assignments(drivers(nombre, apellido, codigo))
    `)
    .gte("fecha_solicitada", from)
    .lte("fecha_solicitada", to)
    .in("estado", ["ASIGNADO", "EN_CURSO", "FINALIZADO", "CANCELADO"]);

  if (error) throw error;

  const byClient = new Map<string, { nombre: string; codigo: string; count: number }>();
  const byDriver = new Map<string, { nombre: string; codigo: string; count: number }>();

  for (const row of data as Record<string, unknown>[]) {
    const clients = row.clients as unknown[] | null;
    const client = clients?.[0] as Record<string, string> | undefined;
    if (client) {
      const key = client.codigo;
      const existing = byClient.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        byClient.set(key, { nombre: client.nombre, codigo: client.codigo, count: 1 });
      }
    }

    const assignments = row.trip_assignments as unknown[] | null;
    const assignment = assignments?.[0] as Record<string, unknown> | undefined;
    if (assignment) {
      const drivers = assignment.drivers as Record<string, string> | null;
      if (drivers) {
        const key = drivers.codigo;
        const existing = byDriver.get(key);
        if (existing) {
          existing.count += 1;
        } else {
          byDriver.set(key, {
            nombre: `${drivers.nombre} ${drivers.apellido}`,
            codigo: drivers.codigo,
            count: 1,
          });
        }
      }
    }
  }

  return {
    byClient: Array.from(byClient.values()).sort((a, b) => b.count - a.count),
    byDriver: Array.from(byDriver.values()).sort((a, b) => b.count - a.count),
    total: data.length,
  };
}

/**
 * HU-OPE-006: Remitos con filtros.
 */
export async function listRemitos(options?: {
  from?: string;
  to?: string;
  clientId?: string;
  page?: number;
  pageSize?: number;
}) {
  const supabase = createClient();
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 20;
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from("remitos")
    .select(
      `
      id, drive_url, estado, observaciones, uploaded_at, filename,
      trips!inner(id, tipo, fecha_solicitada, destino_descripcion, client_id, clients(nombre, codigo))
    `,
      { count: "exact" },
    )
    .order("uploaded_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (options?.from) {
    query = query.gte("uploaded_at", `${options.from}T00:00:00`);
  }
  if (options?.to) {
    query = query.lte("uploaded_at", `${options.to}T23:59:59`);
  }
  if (options?.clientId) {
    query = query.eq("trips.client_id", options.clientId);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  const normalized = (data as Record<string, unknown>[]).map((r) => {
    const trips = r.trips as unknown[] | Record<string, unknown>;
    const trip = Array.isArray(trips) ? trips[0] : trips;
    const tripObj = trip as Record<string, unknown>;
    const clients = tripObj?.clients as unknown[] | Record<string, unknown>;
    const client = Array.isArray(clients) ? clients[0] : clients;
    return {
      id: r.id as string,
      drive_url: r.drive_url as string,
      estado: r.estado as string,
      observaciones: r.observaciones as string | null,
      uploaded_at: r.uploaded_at as string,
      filename: r.filename as string | null,
      trip: {
        id: tripObj?.id as string,
        tipo: tripObj?.tipo as string,
        fecha_solicitada: tripObj?.fecha_solicitada as string | null,
        destino_descripcion: tripObj?.destino_descripcion as string | null,
      },
      client: client as { nombre: string; codigo: string } | null,
    };
  });

  return { data: normalized, total: count ?? 0 };
}

/**
 * List active drivers for assignment selectors.
 */
export async function listActiveDrivers() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("drivers")
    .select("id, codigo, nombre, apellido")
    .eq("activo", true)
    .order("apellido");

  if (error) throw error;
  return data;
}
