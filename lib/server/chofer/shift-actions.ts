"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/server/auth/get-current-user";

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
    const today = new Date().toISOString().split("T")[0];
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

export async function updateShiftData(
  shiftId: string,
  data: {
    km_50?: number | null;
    km_100?: number | null;
    pernoctada?: boolean;
  },
): Promise<ChoferActionState> {
  try {
    const supabase = createAdminClient();

    const updateData: Record<string, unknown> = {};
    if (data.km_50 !== undefined) updateData.km_50 = data.km_50;
    if (data.km_100 !== undefined) updateData.km_100 = data.km_100;
    if (data.pernoctada !== undefined) updateData.pernoctada = data.pernoctada;
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
