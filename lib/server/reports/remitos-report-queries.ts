import { createAdminClient } from "@/lib/supabase/server";

export type RemitosReportRow = {
  trip_id: string;
  codigo: string;
  tipo: string;
  estado: string;
  fecha_solicitada: string | null;
  cliente: string;
  remitos_count: number;
  email_enviado_at: string | null;
};

export interface RemitosReportFilters {
  codigo?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  emailEnviado?: "si" | "no" | "";
}

export async function listRemitosReport(
  filters: RemitosReportFilters,
): Promise<RemitosReportRow[]> {
  const supabase = createAdminClient();

  let query = supabase
    .from("trips")
    .select(`
      id, codigo, tipo, estado, fecha_solicitada, remito_email_enviado_at,
      clients!inner(nombre),
      remitos(id)
    `)
    .in("estado", ["EN_CURSO", "FINALIZADO"])
    .order("fecha_solicitada", { ascending: false });

  if (filters.fechaDesde) query = query.gte("fecha_solicitada", filters.fechaDesde);
  if (filters.fechaHasta) query = query.lte("fecha_solicitada", filters.fechaHasta);
  if (filters.codigo?.trim()) query = query.ilike("codigo", `%${filters.codigo.trim()}%`);

  const { data, error } = await query;
  if (error) throw error;

  let rows: RemitosReportRow[] = ((data ?? []) as Record<string, unknown>[]).map((r) => {
    const clients = r.clients as Record<string, string> | Record<string, string>[];
    const client = Array.isArray(clients) ? clients[0] : clients;
    const remitos = Array.isArray(r.remitos) ? r.remitos : [];
    return {
      trip_id: r.id as string,
      codigo: r.codigo as string,
      tipo: r.tipo as string,
      estado: r.estado as string,
      fecha_solicitada: r.fecha_solicitada as string | null,
      cliente: (client?.nombre as string) ?? "—",
      remitos_count: remitos.length,
      email_enviado_at: r.remito_email_enviado_at as string | null,
    };
  });

  if (filters.emailEnviado === "si") {
    rows = rows.filter((r) => r.email_enviado_at != null);
  } else if (filters.emailEnviado === "no") {
    rows = rows.filter((r) => r.email_enviado_at == null);
  }

  return rows;
}
