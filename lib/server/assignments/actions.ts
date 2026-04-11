"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/server/auth/get-current-user";
import { z } from "zod";
import { notifyAssignment } from "@/lib/server/notifications/notify-assignment";

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

  if (trip.estado !== "PENDIENTE" && trip.estado !== "PREASIGNADO") {
    return { error: `El viaje ya tiene estado ${trip.estado}` };
  }

  if (trip.estado === "PREASIGNADO") {
    // Update existing assignment
    const { error: upErr } = await supabase
      .from("trip_assignments")
      .update({
        driver_id: d.driver_id,
        patente: d.patente,
        patente_acoplado: d.patente_acoplado || null,
        asignado_by: user.id,
      })
      .eq("trip_id", d.trip_id);
    if (upErr) return { error: `Error al asignar: ${upErr.message}` };
  } else {
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
    if (assignErr) return { error: `Error al asignar: ${assignErr.message}` };
  }

  // Update trip estado
  const { error: updateErr } = await supabase
    .from("trips")
    .update({ estado: "ASIGNADO" })
    .eq("id", d.trip_id);

  if (updateErr) {
    return { error: `Error al actualizar estado: ${updateErr.message}` };
  }

  // HU-NOT-001: fire-and-forget email to client
  notifyAssignment(d.trip_id).catch(() => {});

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

  // HU-NOT-001: fire-and-forget email on reassignment
  notifyAssignment(d.trip_id).catch(() => {});

  revalidatePath("/operador/chofer-asignado");
  return { success: true };
}

/**
 * Preassign driver + patente to a trip.
 * Creates trip_assignments row and sets estado to PREASIGNADO.
 * Does NOT notify the client yet.
 */
export async function preassignTripAction(
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
    return { error: `Error al preasignar: ${assignErr.message}` };
  }

  const { error: updateErr } = await supabase
    .from("trips")
    .update({ estado: "PREASIGNADO" })
    .eq("id", d.trip_id);

  if (updateErr) {
    return { error: `Error al actualizar estado: ${updateErr.message}` };
  }

  revalidatePath("/operador/pendientes");
  return { success: true };
}
