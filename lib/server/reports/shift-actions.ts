"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";

type ShiftField =
  | "llegada_deposito"
  | "salida_deposito"
  | "vuelta_deposito"
  | "fin_turno";

export type ShiftTimeActionState = {
  error?: string;
  success?: boolean;
};

export async function updateShiftTimeAction(
  shiftId: string,
  field: ShiftField,
  timeAR: string, // HH:MM in Argentina time
): Promise<ShiftTimeActionState> {
  try {
    const supabase = createAdminClient();

    // Get the fecha of this shift (DATE stored as AR date)
    const { data: shift, error: fetchErr } = await supabase
      .from("shift_logs")
      .select("fecha")
      .eq("id", shiftId)
      .single();

    if (fetchErr || !shift) return { error: "Turno no encontrado" };

    // Reconstruct ISO timestamp with AR offset (-03:00).
    // PostgreSQL stores as UTC automatically from the offset.
    const isoWithOffset = `${shift.fecha}T${timeAR}:00.000-03:00`;

    const { error } = await supabase
      .from("shift_logs")
      .update({ [field]: isoWithOffset, updated_at: new Date().toISOString() })
      .eq("id", shiftId);

    if (error) return { error: error.message };

    revalidatePath("/operador/reportes/turnos");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
