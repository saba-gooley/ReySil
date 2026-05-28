"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/server/auth/get-current-user";
import { todayAR } from "@/lib/utils/date";
import { AddShiftStopSchema, UpdateShiftStopSchema } from "@/lib/validators/shift-stop";

export type ChoferActionState = {
  error?: string;
  success?: boolean;
};

type ShiftField =
  | "llegada_deposito"
  | "salida_deposito"
  | "vuelta_deposito"
  | "fin_turno";

export async function registerShiftEvent(
  field: ShiftField,
  timestamp?: string,
): Promise<ChoferActionState> {
  try {
    const user = await getCurrentUser();
    const driverId = user.profile.driver_id;
    if (!driverId) return { error: "Usuario no vinculado a un chofer" };

    const supabase = createAdminClient();
    const today = todayAR();
    const value = timestamp ?? new Date().toISOString();

    const { data: existing } = await supabase
      .from("shift_logs")
      .select("id")
      .eq("driver_id", driverId)
      .eq("fecha", today)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("shift_logs")
        .update({ [field]: value, updated_at: new Date().toISOString() })
        .eq("id", existing.id);
      if (error) return { error: error.message };
    } else {
      const { error } = await supabase.from("shift_logs").insert({
        driver_id: driverId,
        fecha: today,
        [field]: value,
      });
      if (error) return { error: error.message };
    }

    revalidatePath("/chofer/turno");
    return { success: true };
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err) throw err;
    return { error: `Error: ${err instanceof Error ? err.message : String(err)}` };
  }
}

export async function addShiftStopAction(
  shiftId: string,
  fecha: string,
  rawData: { hora: string; motivo: string; observaciones?: string; duracion_min?: number | null },
): Promise<ChoferActionState> {
  try {
    const parsed = AddShiftStopSchema.safeParse(rawData);
    if (!parsed.success) return { error: parsed.error.errors[0].message };

    const supabase = createAdminClient();
    const isoWithOffset = `${fecha}T${parsed.data.hora}:00.000-03:00`;

    const { error } = await supabase.from("shift_stops").insert({
      shift_id: shiftId,
      hora: isoWithOffset,
      motivo: parsed.data.motivo,
      observaciones: parsed.data.observaciones || null,
      duracion_min: parsed.data.duracion_min ?? null,
    });

    if (error) return { error: error.message };
    revalidatePath("/chofer/turno");
    return { success: true };
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err) throw err;
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

export async function updateShiftStopAction(
  stopId: string,
  fecha: string,
  rawData: { hora: string; motivo: string; observaciones?: string; duracion_min?: number | null },
): Promise<ChoferActionState> {
  try {
    const parsed = UpdateShiftStopSchema.safeParse(rawData);
    if (!parsed.success) return { error: parsed.error.errors[0].message };

    const supabase = createAdminClient();
    const isoWithOffset = `${fecha}T${parsed.data.hora}:00.000-03:00`;

    const { error } = await supabase
      .from("shift_stops")
      .update({
        hora: isoWithOffset,
        motivo: parsed.data.motivo,
        observaciones: parsed.data.observaciones || null,
        duracion_min: parsed.data.duracion_min ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", stopId);

    if (error) return { error: error.message };
    revalidatePath("/chofer/turno");
    return { success: true };
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err) throw err;
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

export async function deleteShiftStopAction(
  stopId: string,
): Promise<ChoferActionState> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("shift_stops")
      .delete()
      .eq("id", stopId);

    if (error) return { error: error.message };
    revalidatePath("/chofer/turno");
    return { success: true };
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err) throw err;
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

export async function updateShiftData(
  shiftId: string,
  data: {
    km_50?: number | null;
    km_100?: number | null;
    pernoctada?: boolean;
    carga_peligrosa?: boolean;
  },
): Promise<ChoferActionState> {
  try {
    const supabase = createAdminClient();

    const updateData: Record<string, unknown> = {};
    if (data.km_50 !== undefined) updateData.km_50 = data.km_50;
    if (data.km_100 !== undefined) updateData.km_100 = data.km_100;
    if (data.pernoctada !== undefined) updateData.pernoctada = data.pernoctada;
    if (data.carga_peligrosa !== undefined) updateData.carga_peligrosa = data.carga_peligrosa;
    updateData.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from("shift_logs")
      .update(updateData)
      .eq("id", shiftId);

    if (error) return { error: error.message };

    revalidatePath("/chofer/turno");
    return { success: true };
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err) throw err;
    return { error: `Error: ${err instanceof Error ? err.message : String(err)}` };
  }
}
