"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/server/auth/get-current-user";
import { z } from "zod";

export type AssignmentActionState = {
  error?: string;
  success?: boolean;
};

const AssignSchema = z.object({
  trip_id: z.string().uuid(),
  driver_id: z.string().uuid(),
  patente: z.string().min(1, "Patente requerida"),
  patente_acoplado: z.string().optional().default(""),
});

/**
 * HU-OPE-002/003: Assign driver + patente to a trip.
 * Creates trip_assignments row and updates trip estado to ASIGNADO.
 */
export async function assignTripAction(
  _prev: AssignmentActionState,
  formData: FormData,
): Promise<AssignmentActionState> {
  const user = await getCurrentUser();

  const raw = JSON.parse(formData.get("payload") as string);
  const parsed = AssignSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: Object.values(parsed.error.flatten().fieldErrors).flat().join(", ") };
  }

  const d = parsed.data;
  const supabase = createClient();

  // Check trip exists and is PENDIENTE
  const { data: trip, error: tripCheckErr } = await supabase
    .from("trips")
    .select("id, estado")
    .eq("id", d.trip_id)
    .single();

  if (tripCheckErr || !trip) {
    return { error: "Viaje no encontrado" };
  }

  if (trip.estado !== "PENDIENTE") {
    return { error: `El viaje ya tiene estado ${trip.estado}` };
  }

  // Insert assignment
  const { error: assignErr } = await supabase
    .from("trip_assignments")
    .insert({
      trip_id: d.trip_id,
      driver_id: d.driver_id,
      patente: d.patente,
      patente_acoplado: d.patente_acoplado || null,
      asignado_by: user.id,
    });

  if (assignErr) {
    return { error: `Error al asignar: ${assignErr.message}` };
  }

  // Update trip estado
  const { error: updateErr } = await supabase
    .from("trips")
    .update({ estado: "ASIGNADO" })
    .eq("id", d.trip_id);

  if (updateErr) {
    return { error: `Error al actualizar estado: ${updateErr.message}` };
  }

  revalidatePath("/operador/pendientes");
  revalidatePath("/operador/chofer-asignado");
  return { success: true };
}

/**
 * HU-OPE-004: Reassign driver/patente on an ASIGNADO trip.
 */
export async function reassignTripAction(
  _prev: AssignmentActionState,
  formData: FormData,
): Promise<AssignmentActionState> {
  await getCurrentUser();

  const raw = JSON.parse(formData.get("payload") as string);
  const parsed = AssignSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: Object.values(parsed.error.flatten().fieldErrors).flat().join(", ") };
  }

  const d = parsed.data;
  const supabase = createClient();

  // Check trip is ASIGNADO (not EN_CURSO)
  const { data: trip, error: tripCheckErr } = await supabase
    .from("trips")
    .select("id, estado")
    .eq("id", d.trip_id)
    .single();

  if (tripCheckErr || !trip) {
    return { error: "Viaje no encontrado" };
  }

  if (trip.estado !== "ASIGNADO") {
    return { error: `No se puede reasignar: el viaje tiene estado ${trip.estado}` };
  }

  // Update existing assignment
  const { error: updateErr } = await supabase
    .from("trip_assignments")
    .update({
      driver_id: d.driver_id,
      patente: d.patente,
      patente_acoplado: d.patente_acoplado || null,
    })
    .eq("trip_id", d.trip_id);

  if (updateErr) {
    return { error: `Error al reasignar: ${updateErr.message}` };
  }

  revalidatePath("/operador/chofer-asignado");
  return { success: true };
}

/**
 * Confirm assignment — used when operator wants to "confirm" a pre-filled assignment.
 * Changes estado from PENDIENTE to ASIGNADO in one step.
 */
export async function confirmAssignmentAction(
  tripId: string,
): Promise<AssignmentActionState> {
  await getCurrentUser();
  const supabase = createClient();

  const { error } = await supabase
    .from("trips")
    .update({ estado: "ASIGNADO" })
    .eq("id", tripId)
    .eq("estado", "PENDIENTE");

  if (error) {
    return { error: `Error al confirmar: ${error.message}` };
  }

  revalidatePath("/operador/pendientes");
  revalidatePath("/operador/chofer-asignado");
  return { success: true };
}
