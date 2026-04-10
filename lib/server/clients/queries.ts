import { createClient } from "@/lib/supabase/server";

export type ClientRow = {
  id: string;
  codigo: string;
  nombre: string;
  cuit: string | null;
  telefono: string | null;
  direccion: string | null;
  activo: boolean;
  created_at: string;
  client_emails: { id: string; email: string; es_principal: boolean }[];
  client_deposits: {
    id: string;
    nombre: string;
    direccion: string | null;
    tipo: string;
    activo: boolean;
  }[];
};

export async function listClients() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("clients")
    .select(
      "id, codigo, nombre, cuit, telefono, direccion, activo, created_at, client_emails(id, email, es_principal), client_deposits(id, nombre, direccion, tipo, activo)",
    )
    .order("nombre", { ascending: true });

  if (error) throw error;
  return data as ClientRow[];
}

export async function getClientById(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("clients")
    .select(
      "id, codigo, nombre, cuit, telefono, direccion, activo, created_at, client_emails(id, email, es_principal), client_deposits(id, nombre, direccion, tipo, activo)",
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as ClientRow;
}
