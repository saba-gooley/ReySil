import { createAdminClient } from "@/lib/supabase/server";

export type TruckType = {
  id: string;
  nombre: string;
  is_active: boolean;
  created_at: string;
};

/**
 * Tipos de camion activos, disponibles para seleccion en los forms de Reparto.
 */
export async function listActiveTruckTypes(): Promise<TruckType[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("truck_types")
    .select("id, nombre, is_active, created_at")
    .eq("is_active", true)
    .order("nombre", { ascending: true });

  if (error) {
    console.error("[listActiveTruckTypes] Error:", error);
    return [];
  }
  return data || [];
}

/**
 * Todos los tipos de camion (activos e inactivos) para el ABM.
 */
export async function getAllTruckTypes(): Promise<TruckType[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("truck_types")
    .select("id, nombre, is_active, created_at")
    .order("nombre", { ascending: true });

  if (error) {
    console.error("[getAllTruckTypes] Error:", error);
    return [];
  }
  return data || [];
}
