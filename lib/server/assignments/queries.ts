import { createAdminClient } from "@/lib/supabase/server";

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
  containers(id, numero, tipo, peso_carga_kg, reservation_id, reservations(numero_booking, naviera, buque, fecha_arribo, fecha_carga, observaciones, orden, mercaderia, despacho, carga, terminal, devuelve_en, libre_hasta)),
  trip_events(id, tipo, ocurrido_at, observaciones),
  remitos(id, drive_url, estado, uploaded_at)
`;

/** Unwrap a value that may be an array (anon key) or a single object (service role). */
function unwrapOne(val: unknown): unknown {
  if (Array.isArray(val)) return val[0] ?? null;
  return val ?? null;
}

function normalizeOperatorTrips(rows: unknown[]): OperatorTripRow[] {
  return (rows as Record<string, unknown>[]).map((r) => {
    const raw = r as Record<string, unknown>;
    const clients = unwrapOne(raw.clients) as Record<string, string> | null;
    return {
      ...raw,
      clients: clients ?? { nombre: "", codigo: "" },
      trip_assignments: unwrapOne(raw.trip_assignments),
      trip_reparto_fields: unwrapOne(raw.trip_reparto_fields),
      containers: unwrapOne(raw.containers),
      trip_events: Array.isArray(raw.trip_events) ? raw.trip_events : [],
      remitos: Array.isArray(raw.remitos) ? raw.remitos : [],
    } as OperatorTripRow;
  });
}

/**
 * HU-OPE-001: Viajes pendientes de asignación (estado PENDIENTE).
 */
export async function listPendingTrips() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("trips")
    .select(OPERATOR_TRIP_SELECT)
    .in("estado", ["PENDIENTE", "PREASIGNADO"])
    .order("fecha_solicitada", { ascending: true });

  if (error) throw error;
  return normalizeOperatorTrips(data);
}

/**
 * HU-OPE-004: Viajes con chofer asignado (estado ASIGNADO).
 */
export async function listAssignedTrips() {
  const supabase = createAdminClient();
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
  const supabase = createAdminClient();
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
  const supabase = createAdminClient();
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 20;
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from("trips")
    .select(OPERATOR_TRIP_SELECT, { count: "exact" })
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
  return { data: normalizeOperatorTrips(data), total: count ?? 0 };
}

/**
 * HU-OPE-007: Toneladas por camión para una fecha.
 */
export async function getToneladasByDate(fecha: string) {
  const supabase = createAdminClient();

  // Fetch REPARTO trips by fecha_solicitada
  const { data: repartoData, error: repartoErr } = await supabase
    .from("trips")
    .select(`
      id, tipo, fecha_solicitada,
      trip_assignments(patente, drivers(nombre, apellido)),
      trip_reparto_fields(toneladas, peso_kg)
    `)
    .eq("tipo", "REPARTO")
    .eq("fecha_solicitada", fecha)
    .in("estado", ["PREASIGNADO", "ASIGNADO"]);

  if (repartoErr) throw repartoErr;

  // Fetch CONTENEDOR trips by containers.reservations.fecha_carga
  const { data: contData, error: contErr } = await supabase
    .from("trips")
    .select(`
      id, tipo, fecha_solicitada,
      trip_assignments(patente, drivers(nombre, apellido)),
      trip_reparto_fields(toneladas, peso_kg),
      containers!inner(peso_carga_kg, reservations!inner(fecha_carga))
    `)
    .eq("tipo", "CONTENEDOR")
    .eq("containers.reservations.fecha_carga", fecha)
    .in("estado", ["PREASIGNADO", "ASIGNADO"]);

  if (contErr) throw contErr;

  const allRows = [...(repartoData ?? []), ...(contData ?? [])];

  // Aggregate by patente
  const byPatente = new Map<
    string,
    { patente: string; chofer: string; totalToneladas: number; totalKg: number; viajes: number }
  >();

  for (const row of allRows as Record<string, unknown>[]) {
    const assignment = unwrapOne(row.trip_assignments) as Record<string, unknown> | null;
    const field = unwrapOne(row.trip_reparto_fields) as Record<string, unknown> | null;
    const container = unwrapOne(row.containers) as Record<string, unknown> | null;

    if (!assignment) continue;

    const patente = assignment.patente as string;
    const driverData = unwrapOne(assignment.drivers) as Record<string, string> | null;
    const chofer = driverData ? `${driverData.nombre} ${driverData.apellido}` : "—";
    const toneladas = (field?.toneladas as number) ?? 0;
    const pesoKg = (field?.peso_kg as number) ?? (container?.peso_carga_kg as number) ?? 0;

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
  const supabase = createAdminClient();
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
    const client = unwrapOne(row.clients) as Record<string, string> | null;
    if (client) {
      const key = client.codigo;
      const existing = byClient.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        byClient.set(key, { nombre: client.nombre, codigo: client.codigo, count: 1 });
      }
    }

    const assignment = unwrapOne(row.trip_assignments) as Record<string, unknown> | null;
    if (assignment) {
      const drivers = unwrapOne(assignment.drivers) as Record<string, string> | null;
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
  const supabase = createAdminClient();
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
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("drivers")
    .select("id, codigo, nombre, apellido")
    .eq("activo", true)
    .order("apellido");

  if (error) throw error;
  return data;
}
