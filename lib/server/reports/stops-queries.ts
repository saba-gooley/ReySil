import { createAdminClient } from "@/lib/supabase/server";

export type StopsReportFilters = {
  fechaDesde: string; // YYYY-MM-DD
  fechaHasta: string; // YYYY-MM-DD
  driverId?: string;
  motivo?: string;
};

export type StopsReportRow = {
  id: string;
  fecha: string;
  hora: string; // ISO timestamp
  driver_id: string;
  codigo: string;
  nombre: string;
  apellido: string;
  motivo: string;
  duracion_min: number | null;
  observaciones: string | null;
};

export async function listStopsReport(
  filters: StopsReportFilters,
): Promise<StopsReportRow[]> {
  const supabase = createAdminClient();

  let query = supabase
    .from("shift_logs")
    .select(
      `
      id, fecha, driver_id,
      drivers(codigo, nombre, apellido),
      shift_stops(id, hora, motivo, observaciones, duracion_min)
    `,
    )
    .gte("fecha", filters.fechaDesde)
    .lte("fecha", filters.fechaHasta)
    .order("fecha", { ascending: false });

  if (filters.driverId) {
    query = query.eq("driver_id", filters.driverId);
  }

  const { data, error } = await query;
  if (error) throw error;

  type RawShiftLog = {
    id: string;
    fecha: string;
    driver_id: string;
    drivers: { codigo: string; nombre: string; apellido: string } | null;
    shift_stops: {
      id: string;
      hora: string;
      motivo: string;
      observaciones: string | null;
      duracion_min: number | null;
    }[] | null;
  };

  const rows: StopsReportRow[] = [];
  for (const log of (data ?? []) as unknown as RawShiftLog[]) {
    for (const stop of log.shift_stops ?? []) {
      rows.push({
        id: stop.id,
        fecha: log.fecha,
        hora: stop.hora,
        driver_id: log.driver_id,
        codigo: log.drivers?.codigo ?? "",
        nombre: log.drivers?.nombre ?? "",
        apellido: log.drivers?.apellido ?? "",
        motivo: stop.motivo,
        duracion_min: stop.duracion_min,
        observaciones: stop.observaciones,
      });
    }
  }

  if (filters.motivo) {
    return rows.filter((r) => r.motivo === filters.motivo);
  }

  return rows;
}
