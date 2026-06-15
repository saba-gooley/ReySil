"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/server/auth/get-current-user";
import { z } from "zod";
import { notifySalidaDeposito } from "@/lib/server/notifications/notify-salida-deposito";

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

    // Trigger email notification on departure from depot
    if (eventType === "SALIDA_DEPOSITO") {
      await notifySalidaDeposito(tripId, ocurridoAt);
    }

    revalidatePath("/chofer");
    return { success: true };
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err) throw err;
    console.error("[registerTripEventAction] error:", err);
    return { error: `Error inesperado: ${err instanceof Error ? err.message : String(err)}` };
  }
}

/**
 * Req. 2.10 — El chofer puede corregir la hora de un evento ya registrado
 * en un viaje EN_CURSO.
 */
export async function updateTripEventAction(
  eventId: string,
  ocurridoAt: string,
): Promise<ChoferActionState> {
  try {
    const user = await getCurrentUser();
    const driverId = user.profile.driver_id;
    if (!driverId) return { error: "Usuario no vinculado a un chofer" };

    const supabase = createAdminClient();

    // Verify the event belongs to a trip assigned to this driver and is EN_CURSO
    const { data: ev } = await supabase
      .from("trip_events")
      .select("trip_id, trips!inner(estado, trip_assignments!inner(driver_id))")
      .eq("id", eventId)
      .maybeSingle();

    if (!ev) return { error: "Evento no encontrado" };

    const trip = Array.isArray(ev.trips) ? ev.trips[0] : ev.trips as { estado: string; trip_assignments: { driver_id: string }[] | { driver_id: string } };
    if (!trip || trip.estado !== "EN_CURSO") {
      return { error: "Solo se pueden editar eventos de viajes en curso" };
    }
    const assignment = Array.isArray(trip.trip_assignments) ? trip.trip_assignments[0] : trip.trip_assignments;
    if ((assignment as { driver_id: string })?.driver_id !== driverId) {
      return { error: "No autorizado para editar este evento" };
    }

    const { error } = await supabase
      .from("trip_events")
      .update({ ocurrido_at: ocurridoAt })
      .eq("id", eventId);

    if (error) return { error: error.message };

    revalidatePath("/chofer");
    return { success: true };
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err) throw err;
    console.error("[updateTripEventAction] error:", err);
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

    // Validate trip and events in parallel
    const [{ data: assignment }, { data: events }, { data: destinations }] = await Promise.all([
      supabase
        .from("trip_assignments")
        .select("trip_id")
        .eq("trip_id", tripId)
        .eq("driver_id", driverId)
        .maybeSingle(),
      supabase
        .from("trip_events")
        .select("tipo")
        .eq("trip_id", tripId),
      supabase
        .from("trip_destinations")
        .select("id, hora_llegada, hora_salida")
        .eq("trip_id", tripId),
    ]);

    if (!assignment) return { error: "Viaje no asignado a este chofer" };

    if (destinations && destinations.length > 0) {
      if (!destinations.every((d) => d.hora_llegada)) {
        return { error: "Falta registrar la llegada en todos los destinos" };
      }
      if (!destinations.every((d) => d.hora_salida)) {
        return { error: "Falta registrar la salida en todos los destinos" };
      }
    } else {
      const eventTypes = new Set((events ?? []).map((e) => e.tipo));
      if (!eventTypes.has("LLEGADA_DESTINO_CLIENTE")) {
        return { error: "Falta registrar la llegada al cliente" };
      }
      if (!eventTypes.has("SALIDA_CLIENTE")) {
        return { error: "Falta registrar la salida del cliente" };
      }
    }

    // Soft check — remito cargado (la validacion de km se hace al cierre del turno, req. 2.14)
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

    revalidatePath("/operador/en-curso");
    revalidatePath("/operador/finalizadas");
    return { success: true };
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err) throw err;
    console.error("[finalizeTripAction] error:", err);
    return { error: `Error inesperado: ${err instanceof Error ? err.message : String(err)}` };
  }
}

// =========================================================================
// Req. 2.12 extensión — Registrar hora de llegada/salida por destino
// =========================================================================

export async function updateDestinationHoraAction(
  destinationId: string,
  tipo: "llegada" | "salida",
  hora?: string, // HH:MM — if provided, timestamp built from today + this time; otherwise uses now
): Promise<ChoferActionState> {
  try {
    const user = await getCurrentUser();
    const driverId = user.profile.driver_id;
    if (!driverId) return { error: "Usuario no vinculado a un chofer" };

    const supabase = createAdminClient();

    const { data: dest } = await supabase
      .from("trip_destinations")
      .select("id, trip_id, trips!inner(estado, trip_assignments!inner(driver_id))")
      .eq("id", destinationId)
      .maybeSingle();

    if (!dest) return { error: "Destino no encontrado" };

    const trip = Array.isArray((dest as Record<string, unknown>).trips)
      ? ((dest as Record<string, unknown>).trips as Record<string, unknown>[])[0]
      : (dest as Record<string, unknown>).trips as Record<string, unknown>;

    const estado = trip?.estado as string;
    if (estado !== "EN_CURSO" && estado !== "ASIGNADO") {
      return { error: "Solo se pueden registrar horas en viajes asignados o en curso" };
    }

    const assignment = Array.isArray(trip.trip_assignments)
      ? (trip.trip_assignments as Record<string, unknown>[])[0]
      : trip.trip_assignments as Record<string, unknown>;

    if ((assignment as { driver_id: string })?.driver_id !== driverId) {
      return { error: "No autorizado para este viaje" };
    }

    let timestamp: string;
    if (hora) {
      const today = new Date().toISOString().split("T")[0];
      timestamp = new Date(`${today}T${hora}:00`).toISOString();
    } else {
      timestamp = new Date().toISOString();
    }

    const field = tipo === "llegada" ? "hora_llegada" : "hora_salida";
    const { error } = await supabase
      .from("trip_destinations")
      .update({ [field]: timestamp })
      .eq("id", destinationId);

    if (error) return { error: error.message };

    // Transition ASIGNADO → EN_CURSO when driver registers first hora_llegada
    if (tipo === "llegada" && estado === "ASIGNADO") {
      const tripId = (dest as Record<string, unknown>).trip_id as string;
      await supabase
        .from("trips")
        .update({ estado: "EN_CURSO" })
        .eq("id", tripId)
        .eq("estado", "ASIGNADO");
    }

    revalidatePath("/chofer");
    return { success: true };
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err) throw err;
    console.error("[updateDestinationHoraAction] error:", err);
    return { error: `Error inesperado: ${err instanceof Error ? err.message : String(err)}` };
  }
}
