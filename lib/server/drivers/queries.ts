import { createClient } from "@/lib/supabase/server";

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
