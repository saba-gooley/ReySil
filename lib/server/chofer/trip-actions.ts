"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/server/auth/get-current-user";
import { z } from "zod";

export type ChoferActionState = {
  error?: string;
  success?: boolean;
};

// =========================================================================
// HU-CHO-003: Trip events (llegada/salida cliente)
// =========================================================================

export async function registerTripEventAction(
  tripId: string,
  eventType: string,
  ocurridoAt: string,
): Promise<ChoferActionState> {
  try {
    const user = await getCurrentUser();
    const driverId = user.profile.driver_id;
    if (!driverId) return { error: "Usuario no vinculado a un chofer" };

    const supabase = createAdminClient();

    const { error: evErr } = await supabase.from("trip_events").insert({
      trip_id: tripId,
      tipo: eventType,
      ocurrido_at: ocurridoAt,
    });
    if (evErr) return { error: `Error al registrar evento: ${evErr.message}` };

    // Update trip estado to EN_CURSO if it's ASIGNADO
    await supabase
      .from("trips")
      .update({ estado: "EN_CURSO" })
      .eq("id", tripId)
      .eq("estado", "ASIGNADO");

    revalidatePath("/chofer");
    return { success: true };
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err) throw err;
    console.error("[registerTripEventAction] error:", err);
    return { error: `Error inesperado: ${err instanceof Error ? err.message : String(err)}` };
  }
}

// =========================================================================
// HU-CHO-003: Trip driver data (km, pernocto, obs)
// =========================================================================

const TripDataSchema = z.object({
  trip_id: z.string().uuid(),
  km_inicial: z.coerce.number().optional().nullable(),
  km_50_porc: z.coerce.number().optional().nullable(),
  km_100_porc: z.coerce.number().optional().nullable(),
  km_final: z.coerce.number().optional().nullable(),
  pernocto: z.boolean().optional().default(false),
  observaciones: z.string().optional().default(""),
});

export async function registerTripDataAction(
  _prev: ChoferActionState,
  formData: FormData,
): Promise<ChoferActionState> {
  try {
    const user = await getCurrentUser();
    const driverId = user.profile.driver_id;
    if (!driverId) return { error: "Usuario no vinculado a un chofer" };

    const raw = JSON.parse(formData.get("payload") as string);
    const parsed = TripDataSchema.safeParse(raw);
    if (!parsed.success) {
      return { error: Object.values(parsed.error.flatten().fieldErrors).flat().join(", ") };
    }

    const d = parsed.data;
    const supabase = createAdminClient();

    // Upsert trip_driver_data
    const { data: existing } = await supabase
      .from("trip_driver_data")
      .select("id")
      .eq("trip_id", d.trip_id)
      .maybeSingle();

    const driverDataPayload = {
      trip_id: d.trip_id,
      km_inicial: d.km_inicial ?? null,
      km_50_porc: d.km_50_porc ?? null,
      km_100_porc: d.km_100_porc ?? null,
      km_final: d.km_final ?? null,
      pernocto: d.pernocto,
      observaciones: d.observaciones || null,
      registrado_by: user.id,
    };

    if (existing) {
      const { error } = await supabase
        .from("trip_driver_data")
        .update(driverDataPayload)
        .eq("id", existing.id);
      if (error) return { error: error.message };
    } else {
      const { error } = await supabase
        .from("trip_driver_data")
        .insert(driverDataPayload);
      if (error) return { error: error.message };
    }

    revalidatePath("/chofer");
    return { success: true };
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err) throw err;
    console.error("[registerTripDataAction] error:", err);
    return { error: `Error inesperado: ${err instanceof Error ? err.message : String(err)}` };
  }
}

// =========================================================================
// Finalizar viaje
// =========================================================================

export async function finalizeTripAction(
  tripId: string,
  skipRemito: boolean,
): Promise<ChoferActionState> {
  try {
    const user = await getCurrentUser();
    const driverId = user.profile.driver_id;
    if (!driverId) return { error: "Usuario no vinculado a un chofer" };

    const supabase = createAdminClient();

    // Validate trip exists and belongs to driver
    const { data: assignment } = await supabase
      .from("trip_assignments")
      .select("trip_id")
      .eq("trip_id", tripId)
      .eq("driver_id", driverId)
      .maybeSingle();

    if (!assignment) return { error: "Viaje no asignado a este chofer" };

    // Validate events
    const { data: events } = await supabase
      .from("trip_events")
      .select("tipo")
      .eq("trip_id", tripId);

    const eventTypes = new Set((events ?? []).map((e) => e.tipo));
    if (!eventTypes.has("LLEGADA_DESTINO_CLIENTE")) {
      return { error: "Falta registrar la llegada al cliente" };
    }
    if (!eventTypes.has("SALIDA_CLIENTE")) {
      return { error: "Falta registrar la salida del cliente" };
    }

    // Validate driver data (km)
    const { data: driverData } = await supabase
      .from("trip_driver_data")
      .select("km_50_porc, km_100_porc")
      .eq("trip_id", tripId)
      .maybeSingle();

    if (!driverData || (driverData.km_50_porc == null && driverData.km_100_porc == null)) {
      return { error: "Falta registrar los km del viaje" };
    }

    // Validate remito (warn only)
    if (!skipRemito) {
      const { data: remitos } = await supabase
        .from("remitos")
        .select("id")
        .eq("trip_id", tripId)
        .limit(1);

      if (!remitos || remitos.length === 0) {
        return { error: "__NO_REMITO__" };
      }
    }

    // Finalize
    const { error } = await supabase
      .from("trips")
      .update({
        estado: "FINALIZADO",
        updated_at: new Date().toISOString(),
      })
      .eq("id", tripId);

    if (error) return { error: error.message };

    revalidatePath("/chofer");
    revalidatePath("/operador/en-curso");
    revalidatePath("/operador/finalizadas");
    return { success: true };
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err) throw err;
    console.error("[finalizeTripAction] error:", err);
    return { error: `Error inesperado: ${err instanceof Error ? err.message : String(err)}` };
  }
}
