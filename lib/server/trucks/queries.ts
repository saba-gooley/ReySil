import { createAdminClient } from "@/lib/supabase/server";

export type Truck = {
  id: string;
  marca: string;
  modelo: string;
  patente: string;
  is_active: boolean;
  created_at: string;
};

export type TruckWithStatus = Truck & {
  estado: "LIBRE" | "PREASIGNADO" | "ASIGNADO";
};

/**
 * Obtener todos los camiones activos
 */
export async function listActiveTrucks(): Promise<Truck[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("trucks")
    .select("*")
    .eq("is_active", true)
    .order("patente", { ascending: true });

  if (error) {
    console.error("[listActiveTrucks] Error:", error);
    return [];
  }

  return data || [];
}

/**
 * Obtener estado de camiones para una fecha específica
 * Incluye si están LIBRE, PREASIGNADO o ASIGNADO
 */
export async function getTruckStatusByDate(fecha: string): Promise<TruckWithStatus[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("truck_daily_status")
    .select("*")
    .eq("fecha", fecha);

  if (error) {
    console.error("[getTruckStatusByDate] Error:", error);
    return [];
  }

  // Para camiones sin viajes ese día, retornar LIBRE
  const allTrucks = await listActiveTrucks();
  const statusMap = new Map(data?.map(t => [t.id, t.estado]) || []);

  return allTrucks.map(truck => ({
    ...truck,
    estado: (statusMap.get(truck.id) || "LIBRE") as "LIBRE" | "PREASIGNADO" | "ASIGNADO",
  }));
}

/**
 * Obtener estado de choferes para una fecha específica
 */
export async function getDriverStatusByDate(fecha: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("driver_daily_status")
    .select("*")
    .eq("fecha", fecha);

  if (error) {
    console.error("[getDriverStatusByDate] Error:", error);
    return [];
  }

  return data || [];
}

/**
 * Obtener un camión por ID
 */
export async function getTruckById(id: string): Promise<Truck | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("trucks")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("[getTruckById] Error:", error);
    return null;
  }

  return data;
}

/**
 * Obtener un camión por patente
 */
export async function getTruckByPatente(patente: string): Promise<Truck | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("trucks")
    .select("*")
    .eq("patente", patente)
    .single();

  if (error) {
    console.error("[getTruckByPatente] Error:", error);
    return null;
  }

  return data;
}

/**
 * Obtener todos los camiones (activos e inactivos)
 */
export async function getAllTrucks(): Promise<Truck[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("trucks")
    .select("*")
    .order("patente", { ascending: true });

  if (error) {
    console.error("[getAllTrucks] Error:", error);
    return [];
  }

  return data || [];
}
