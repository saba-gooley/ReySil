"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/server/auth/get-current-user";

export type OperatorEditState = {
  error?: string;
  success?: boolean;
};

/**
 * Req. 2.9 — El operador edita la hora de un hito del viaje.
 * Aplica a viajes EN_CURSO y FINALIZADOS (sin restricción de estado).
 */
export async function updateTripEventByOperatorAction(
  eventId: string,
  ocurridoAt: string,
): Promise<OperatorEditState> {
  try {
    await requireRole("OPERADOR", "ADMIN");
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("trip_events")
      .update({ ocurrido_at: ocurridoAt })
      .eq("id", eventId);
    if (error) return { error: error.message };
    revalidatePath("/operador");
    return { success: true };
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err) throw err;
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Req. 2.9 — El operador edita km/pernoctada/obs del viaje.
 * Upserta trip_driver_data para el trip_id dado.
 */
export async function updateTripDriverDataByOperatorAction(
  tripId: string,
  data: {
    km_50_porc?: number | null;
    km_100_porc?: number | null;
    pernocto?: boolean;
    observaciones?: string | null;
  },
): Promise<OperatorEditState> {
  try {
    await requireRole("OPERADOR", "ADMIN");
    const supabase = createAdminClient();
    const { data: existing } = await supabase
      .from("trip_driver_data")
      .select("id")
      .eq("trip_id", tripId)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("trip_driver_data")
        .update({ ...data })
        .eq("id", existing.id);
      if (error) return { error: error.message };
    } else {
      const { error } = await supabase
        .from("trip_driver_data")
        .insert({ trip_id: tripId, ...data });
      if (error) return { error: error.message };
    }
    revalidatePath("/operador");
    return { success: true };
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err) throw err;
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
