"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/server/auth/get-current-user";
import { TruckTypeSchema } from "@/lib/validators/truck-type";

const ABM_PATH = "/operador/configuracion/tipos-camion";

export async function createTruckTypeAction(input: unknown) {
  await requireRole("ADMIN");
  const parsed = TruckTypeSchema.parse(input);
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("truck_types")
    .insert({ nombre: parsed.nombre, is_active: true })
    .select()
    .single();

  if (error) {
    console.error("[createTruckTypeAction] Error:", error);
    if (error.code === "23505") {
      throw new Error("Ya existe un tipo de camión con ese nombre");
    }
    throw new Error("No se pudo crear el tipo de camión");
  }

  revalidatePath(ABM_PATH);
  return data;
}

export async function updateTruckTypeAction(id: string, input: unknown) {
  await requireRole("ADMIN");
  const parsed = TruckTypeSchema.parse(input);
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("truck_types")
    .update({ nombre: parsed.nombre })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[updateTruckTypeAction] Error:", error);
    if (error.code === "23505") {
      throw new Error("Ya existe un tipo de camión con ese nombre");
    }
    throw new Error("No se pudo actualizar el tipo de camión");
  }

  revalidatePath(ABM_PATH);
  return data;
}

export async function deactivateTruckTypeAction(id: string) {
  await requireRole("ADMIN");
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("truck_types")
    .update({ is_active: false })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[deactivateTruckTypeAction] Error:", error);
    throw new Error("No se pudo dar de baja el tipo de camión");
  }

  revalidatePath(ABM_PATH);
  return data;
}

export async function reactivateTruckTypeAction(id: string) {
  await requireRole("ADMIN");
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("truck_types")
    .update({ is_active: true })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[reactivateTruckTypeAction] Error:", error);
    throw new Error("No se pudo reactivar el tipo de camión");
  }

  revalidatePath(ABM_PATH);
  return data;
}
