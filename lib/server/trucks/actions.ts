"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { TruckSchema } from "@/lib/validators/truck";
import { revalidatePath } from "next/cache";

export async function createTruckAction(input: unknown) {
  const parsed = TruckSchema.create.parse(input);
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("trucks")
    .insert({
      marca: parsed.marca,
      modelo: parsed.modelo,
      patente: parsed.patente.toUpperCase(),
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error("[createTruckAction] Error:", error);
    if (error.code === "23505") {
      // Unique constraint violation on patente
      throw new Error("La patente ya existe en el sistema");
    }
    throw new Error("No se pudo crear el camión");
  }

  revalidatePath("/operador/configuracion/camiones");
  return data;
}

export async function updateTruckAction(
  id: string,
  input: unknown
) {
  const parsed = TruckSchema.update.parse(input);
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("trucks")
    .update({
      marca: parsed.marca,
      modelo: parsed.modelo,
      patente: parsed.patente.toUpperCase(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[updateTruckAction] Error:", error);
    if (error.code === "23505") {
      // Unique constraint violation on patente
      throw new Error("La patente ya existe en el sistema");
    }
    throw new Error("No se pudo actualizar el camión");
  }

  revalidatePath("/operador/configuracion/camiones");
  return data;
}

export async function deactivateTruckAction(id: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("trucks")
    .update({ is_active: false })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[deactivateTruckAction] Error:", error);
    throw new Error("No se pudo desactivar el camión");
  }

  revalidatePath("/operador/configuracion/camiones");
  return data;
}

export async function reactivateTruckAction(id: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("trucks")
    .update({ is_active: true })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[reactivateTruckAction] Error:", error);
    throw new Error("No se pudo reactivar el camión");
  }

  revalidatePath("/operador/configuracion/camiones");
  return data;
}
