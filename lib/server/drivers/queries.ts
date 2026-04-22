import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";

export type DriverRow = {
  id: string;
  codigo: string;
  dni: string;
  nombre: string;
  apellido: string;
  telefono: string | null;
  activo: boolean;
  created_at: string;
};

export type DriverWithStatus = DriverRow & {
  estado: "LIBRE" | "PREASIGNADO" | "ASIGNADO";
};

export async function listDrivers() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("drivers")
    .select("id, codigo, dni, nombre, apellido, telefono, activo, created_at")
    .order("apellido", { ascending: true });

  if (error) throw error;
  return data as DriverRow[];
}

export async function getDriverById(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("drivers")
    .select("id, codigo, dni, nombre, apellido, telefono, activo, created_at")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as DriverRow;
}

/**
 * Obtener estado de choferes para una fecha específica
 * Incluye si están LIBRE, PREASIGNADO o ASIGNADO
 */
export async function getDriverStatusByDate(
  fecha: string
): Promise<DriverWithStatus[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("driver_daily_status")
    .select("*")
    .eq("fecha", fecha);

  if (error) {
    console.error("[getDriverStatusByDate] Error:", error);
    return [];
  }

  // Para choferes sin viajes ese día, retornar LIBRE
  const allDrivers = await listActiveDrivers();
  const statusMap = new Map(data?.map((d) => [d.id, d.estado]) || []);

  return allDrivers.map((driver) => ({
    ...driver,
    estado: (statusMap.get(driver.id) || "LIBRE") as
      | "LIBRE"
      | "PREASIGNADO"
      | "ASIGNADO",
  }));
}

/**
 * Obtener todos los choferes activos
 */
export async function listActiveDrivers(): Promise<DriverRow[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("drivers")
    .select("*")
    .eq("activo", true)
    .order("apellido", { ascending: true });

  if (error) {
    console.error("[listActiveDrivers] Error:", error);
    return [];
  }

  return data || [];
}
