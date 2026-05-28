import { createAdminClient } from "@/lib/supabase/server";

const TZ = "America/Argentina/Buenos_Aires";

export type ShiftReportFilters = {
  fechaDesde: string; // YYYY-MM-DD
  fechaHasta: string; // YYYY-MM-DD
  driverId?: string;
  llegadaDespuesDe?: string; // HH:MM in AR time
};

export type ShiftReportStop = {
  id: string;
  hora: string;
  motivo: string;
  observaciones: string | null;
};

export type ShiftReportRow = {
  id: string;
  driver_id: string;
  codigo: string;
  nombre: string;
  apellido: string;
  fecha: string;
  llegada_deposito: string | null;
  salida_deposito: string | null;
  vuelta_deposito: string | null;
  fin_turno: string | null;
  km_50: number | null;
  km_100: number | null;
  pernoctada: boolean;
  carga_peligrosa: boolean;
  paradas_count: number;
  paradas: ShiftReportStop[];
};

function timeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function timestampToARMinutes(ts: string): number {
  const arTime = new Date(ts).toLocaleTimeString("en-GB", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
  });
  return timeToMinutes(arTime);
}

export async function listShiftReport(
  filters: ShiftReportFilters,
): Promise<ShiftReportRow[]> {
  const supabase = createAdminClient();

  let query = supabase
    .from("shift_logs")
    .select(
      `
      id, driver_id, fecha,
      llegada_deposito, salida_deposito, vuelta_deposito, fin_turno,
      km_50, km_100, pernoctada, carga_peligrosa,
      drivers (codigo, nombre, apellido),
      shift_stops (id, hora, motivo, observaciones)
    `,
    )
    .gte("fecha", filters.fechaDesde)
    .lte("fecha", filters.fechaHasta)
    .order("fecha", { ascending: false })
    .order("llegada_deposito", { ascending: true });

  if (filters.driverId) {
    query = query.eq("driver_id", filters.driverId);
  }

  const { data, error } = await query;
  if (error) throw error;

  type RawRow = {
    id: string;
    driver_id: string;
    fecha: string;
    llegada_deposito: string | null;
    salida_deposito: string | null;
    vuelta_deposito: string | null;
    fin_turno: string | null;
    km_50: number | null;
    km_100: number | null;
    pernoctada: boolean | null;
    carga_peligrosa: boolean | null;
    drivers: { codigo: string; nombre: string; apellido: string } | null;
    shift_stops: { id: string; hora: string; motivo: string; observaciones: string | null }[] | null;
  };

  let rows: ShiftReportRow[] = ((data ?? []) as unknown as RawRow[]).map((row) => {
    const paradas = row.shift_stops ?? [];
    return {
      id: row.id,
      driver_id: row.driver_id,
      codigo: row.drivers?.codigo ?? "",
      nombre: row.drivers?.nombre ?? "",
      apellido: row.drivers?.apellido ?? "",
      fecha: row.fecha,
      llegada_deposito: row.llegada_deposito,
      salida_deposito: row.salida_deposito,
      vuelta_deposito: row.vuelta_deposito,
      fin_turno: row.fin_turno,
      km_50: row.km_50,
      km_100: row.km_100,
      pernoctada: row.pernoctada ?? false,
      carga_peligrosa: row.carga_peligrosa ?? false,
      paradas_count: paradas.length,
      paradas,
    };
  });

  // Filter by AR time: apply per-day after fetching (handles midnight wrap-around correctly)
  if (filters.llegadaDespuesDe) {
    const filterMinutes = timeToMinutes(filters.llegadaDespuesDe);
    rows = rows.filter((row) => {
      if (!row.llegada_deposito) return false;
      return timestampToARMinutes(row.llegada_deposito) > filterMinutes;
    });
  }

  return rows;
}

export function listAllDriversForFilter() {
  const supabase = createAdminClient();
  return supabase
    .from("drivers")
    .select("id, codigo, nombre, apellido")
    .eq("activo", true)
    .order("apellido", { ascending: true });
}
