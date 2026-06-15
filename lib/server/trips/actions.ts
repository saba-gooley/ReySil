"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/server/auth/get-current-user";
import { CreateRepartoSchema, CreateContenedorSchema } from "@/lib/validators/trip";
import { notifyRepartoCreated, notifyContenedorCreated } from "@/lib/server/notifications/notify-reparto";

export type TripActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
};

async function insertTripDestinations(
  supabase: ReturnType<typeof createClient>,
  tripId: string,
  destinos: { destino: string; observaciones?: string }[],
): Promise<void> {
  if (destinos.length === 0) return;
  await supabase.from("trip_destinations").insert(
    destinos.map((d, i) => ({
      trip_id: tripId,
      destino: d.destino,
      observaciones: d.observaciones || null,
      orden: i,
    })),
  );
}

async function resolveOrigenDescripcion(
  supabase: ReturnType<typeof createClient>,
  clientId: string,
  origenDepositId: string | null | undefined,
  origenDescripcion: string | null | undefined,
): Promise<string | null> {
  if (!origenDepositId) {
    return origenDescripcion?.trim() || null;
  }

  const { data: deposit } = await supabase
    .from("client_deposits")
    .select("nombre, direccion")
    .eq("id", origenDepositId)
    .eq("client_id", clientId)
    .maybeSingle();

  const resolved = deposit?.direccion?.trim() || deposit?.nombre?.trim() || "";
  return resolved || origenDescripcion?.trim() || null;
}

/**
 * Crea un viaje tipo REPARTO (HU-CLI-001).
 * Inserta en trips + trip_reparto_fields.
 */
export async function createRepartoAction(
  _prev: TripActionState,
  formData: FormData,
): Promise<TripActionState> {
  const user = await getCurrentUser();

  if (!user.profile.client_id) {
    return { error: "Tu usuario no esta vinculado a un cliente" };
  }

  const raw = JSON.parse(formData.get("payload") as string);
  const parsed = CreateRepartoSchema.safeParse(raw);

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const d = parsed.data;
  const supabase = createClient();
  const origenDescripcion = await resolveOrigenDescripcion(
    supabase,
    user.profile.client_id,
    d.origen_deposit_id,
    d.origen_descripcion,
  );

  // Validate fecha_entrega >= fecha_solicitada if provided
  if (d.fecha_entrega && d.fecha_solicitada && d.fecha_entrega < d.fecha_solicitada) {
    return { error: "La fecha de entrega no puede ser anterior a la fecha de carga" };
  }

  // 1. Insert trip
  const { data: trip, error: tripError } = await supabase
    .from("trips")
    .insert({
      client_id: user.profile.client_id,
      tipo: "REPARTO",
      estado: "PENDIENTE",
      origen_deposit_id: d.origen_deposit_id || null,
      origen_descripcion: origenDescripcion,
      destino_descripcion: (d.multiples_destinos && d.destinos && d.destinos.length > 0) ? d.destinos[0].destino : (d.destino_descripcion || null),
      fecha_solicitada: d.fecha_solicitada || null,
      observaciones_cliente: d.observaciones_cliente || null,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (tripError) {
    return { error: `Error al crear viaje: ${tripError.message}` };
  }

  // 2. Insert trip_reparto_fields
  const metadata: Record<string, unknown> = {};
  if (d.fecha_entrega) metadata.fecha_entrega = d.fecha_entrega;
  if (d.codigo_postal) metadata.codigo_postal = d.codigo_postal;
  if (d.zona_tarifa) metadata.zona_tarifa = d.zona_tarifa;
  if (d.horario) metadata.horario = d.horario;
  if (d.tipo_camion) metadata.tipo_camion = d.tipo_camion;
  if (d.peon) metadata.peon = d.peon;

  const { error: fieldsError } = await supabase
    .from("trip_reparto_fields")
    .insert({
      trip_id: trip.id,
      ndv: d.ndv || null,
      pal: d.pal ?? null,
      cat: d.cat || null,
      nro_un: d.nro_un || null,
      cantidad_bultos: d.cantidad_bultos ?? null,
      peso_kg: d.peso_kg ?? null,
      toneladas: d.toneladas ?? null,
      metadata,
    });

  if (fieldsError) {
    return { error: `Error al crear campos de reparto: ${fieldsError.message}` };
  }

  // Múltiples destinos (req. 2.12)
  if (d.multiples_destinos && d.destinos && d.destinos.length > 0) {
    await insertTripDestinations(supabase as ReturnType<typeof createClient>, trip.id, d.destinos);
  }

  // await so Vercel doesn't cancel before SMTP completes
  await notifyRepartoCreated(trip.id);

  revalidatePath("/cliente/solicitudes");
  revalidatePath("/cliente/seguimiento");
  revalidatePath("/operador/pendientes");
  return { success: true };
}

/**
 * Crea multiples viajes tipo REPARTO de una vez (HU-CLI-002 — grilla).
 * Recibe un array de repartos.
 */
export async function createBulkRepartosAction(
  _prev: TripActionState,
  formData: FormData,
): Promise<TripActionState> {
  const user = await getCurrentUser();

  if (!user.profile.client_id) {
    return { error: "Tu usuario no esta vinculado a un cliente" };
  }

  const rows = JSON.parse(formData.get("payload") as string) as unknown[];
  if (!Array.isArray(rows) || rows.length === 0) {
    return { error: "No hay repartos para guardar" };
  }

  const supabase = createClient();
  let created = 0;

  const depositIds = Array.from(
    new Set(
      rows
        .map((row) => {
          if (!row || typeof row !== "object") return null;
          const candidate = (row as { origen_deposit_id?: unknown }).origen_deposit_id;
          return typeof candidate === "string" && candidate ? candidate : null;
        })
        .filter((id): id is string => !!id),
    ),
  );

  const depositMap = new Map<string, { nombre: string | null; direccion: string | null }>();
  if (depositIds.length > 0) {
    const { data: deposits } = await supabase
      .from("client_deposits")
      .select("id, nombre, direccion")
      .eq("client_id", user.profile.client_id)
      .in("id", depositIds);

    for (const dep of deposits ?? []) {
      depositMap.set(dep.id, {
        nombre: dep.nombre,
        direccion: dep.direccion,
      });
    }
  }

  for (let i = 0; i < rows.length; i++) {
    const parsed = CreateRepartoSchema.safeParse(rows[i]);
    if (!parsed.success) {
      return { error: `Fila ${i + 1}: ${Object.values(parsed.error.flatten().fieldErrors).flat().join(", ")}` };
    }

    const d = parsed.data;
    const deposit = d.origen_deposit_id
      ? depositMap.get(d.origen_deposit_id)
      : undefined;
    const origenDescripcion =
      deposit?.direccion?.trim() ||
      deposit?.nombre?.trim() ||
      d.origen_descripcion?.trim() ||
      null;

    if (d.fecha_entrega && d.fecha_solicitada && d.fecha_entrega < d.fecha_solicitada) {
      return { error: `Fila ${i + 1}: La fecha de entrega no puede ser anterior a la fecha de carga` };
    }

    const { data: trip, error: tripError } = await supabase
      .from("trips")
      .insert({
        client_id: user.profile.client_id,
        tipo: "REPARTO",
        estado: "PENDIENTE",
        origen_deposit_id: d.origen_deposit_id || null,
        origen_descripcion: origenDescripcion,
        destino_descripcion: (d.multiples_destinos && d.destinos && d.destinos.length > 0) ? d.destinos[0].destino : (d.destino_descripcion || null),
        fecha_solicitada: d.fecha_solicitada || null,
        observaciones_cliente: d.observaciones_cliente || null,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (tripError) {
      return { error: `Fila ${i + 1}: ${tripError.message}` };
    }

    const metadata: Record<string, unknown> = {};
    if (d.fecha_entrega) metadata.fecha_entrega = d.fecha_entrega;
    if (d.codigo_postal) metadata.codigo_postal = d.codigo_postal;
    if (d.zona_tarifa) metadata.zona_tarifa = d.zona_tarifa;
    if (d.horario) metadata.horario = d.horario;
    if (d.tipo_camion) metadata.tipo_camion = d.tipo_camion;
    if (d.peon) metadata.peon = d.peon;

    const { error: fieldsError } = await supabase
      .from("trip_reparto_fields")
      .insert({
        trip_id: trip.id,
        ndv: d.ndv || null,
        pal: d.pal ?? null,
        cat: d.cat || null,
        nro_un: d.nro_un || null,
        cantidad_bultos: d.cantidad_bultos ?? null,
        peso_kg: d.peso_kg ?? null,
        toneladas: d.toneladas ?? null,
        metadata,
      });

    if (fieldsError) {
      return { error: `Fila ${i + 1}: ${fieldsError.message}` };
    }

    if (d.multiples_destinos && d.destinos && d.destinos.length > 0) {
      await insertTripDestinations(supabase as ReturnType<typeof createClient>, trip.id, d.destinos);
    }

    created++;
  }

  revalidatePath("/cliente/solicitudes");
  revalidatePath("/cliente/seguimiento");
  revalidatePath("/operador/pendientes");
  return { success: true };
}

/**
 * Crea una reserva de contenedores (HU-CLI-003).
 * Inserta en reservations + containers + trips (uno por contenedor).
 */
export async function createContenedorAction(
  _prev: TripActionState,
  formData: FormData,
): Promise<TripActionState> {
  const user = await getCurrentUser();

  if (!user.profile.client_id) {
    return { error: "Tu usuario no esta vinculado a un cliente" };
  }

  const raw = JSON.parse(formData.get("payload") as string);
  const parsed = CreateContenedorSchema.safeParse(raw);

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const d = parsed.data;
  const supabase = createClient();
  const origenDescripcion = await resolveOrigenDescripcion(
    supabase,
    user.profile.client_id,
    d.origen_deposit_id,
    d.origen_descripcion,
  );

  // 1. Insert reservation
  const { data: reservation, error: resError } = await supabase
    .from("reservations")
    .insert({
      client_id: user.profile.client_id,
      numero_booking: d.numero_booking || null,
      naviera: d.naviera || null,
      buque: d.buque || null,
      fecha_arribo: d.fecha_arribo || null,
      fecha_carga: d.fecha_carga || null,
      fecha_entrega: d.fecha_entrega || null,
      orden: d.orden || null,
      mercaderia: d.mercaderia || null,
      despacho: d.despacho || null,
      carga: d.carga || null,
      terminal: d.terminal || null,
      devuelve_en: d.devuelve_en || null,
      libre_hasta: d.libre_hasta || null,
      observaciones: d.observaciones || null,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (resError) {
    return { error: `Error al crear reserva: ${resError.message}` };
  }

  // 2. For each container: insert container + trip
  for (let i = 0; i < d.containers.length; i++) {
    const c = d.containers[i];

    const { data: container, error: contError } = await supabase
      .from("containers")
      .insert({
        reservation_id: reservation.id,
        numero: c.numero || null,
        tipo: c.tipo || null,
        peso_carga_kg: c.peso_carga_kg ?? null,
        fecha_entrega: c.fecha_entrega || null,
        observaciones: c.observaciones || null,
      })
      .select("id")
      .single();

    if (contError) {
      return { error: `Contenedor ${i + 1}: ${contError.message}` };
    }

    const { data: trip, error: tripError } = await supabase
      .from("trips")
      .insert({
        client_id: user.profile.client_id,
        tipo: "CONTENEDOR",
        estado: "PENDIENTE",
        container_id: container.id,
        origen_deposit_id: d.origen_deposit_id || null,
        origen_descripcion: origenDescripcion,
        destino_descripcion: (d.multiples_destinos && d.destinos && d.destinos.length > 0) ? d.destinos[0].destino : (d.destino_descripcion || null),
        fecha_solicitada: d.fecha_carga || null,
        observaciones_cliente: d.observaciones || null,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (tripError) {
      return { error: `Viaje del contenedor ${i + 1}: ${tripError.message}` };
    }

    if (d.multiples_destinos && d.destinos && d.destinos.length > 0) {
      await insertTripDestinations(supabase as ReturnType<typeof createClient>, trip.id, d.destinos);
    }

    // await so Vercel doesn't cancel before SMTP completes
    await notifyContenedorCreated(trip.id);
  }

  revalidatePath("/cliente/solicitudes");
  revalidatePath("/cliente/seguimiento");
  revalidatePath("/operador/pendientes");
  return { success: true };
}

/**
 * Operador crea un reparto en nombre de un cliente.
 * client_id viene explícito en el payload (no de la sesión).
 */
export async function createRepartoForClientAction(
  _prev: TripActionState,
  formData: FormData,
): Promise<TripActionState> {
  const user = await getCurrentUser();
  const supabase = createAdminClient();

  const raw = JSON.parse(formData.get("payload") as string);
  const parsed = CreateRepartoSchema.extend({
    client_id: z.string().uuid("Seleccioná un cliente"),
  }).safeParse(raw);

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const d = parsed.data;
  const origenDescripcion = await resolveOrigenDescripcion(
    supabase as ReturnType<typeof createClient>,
    d.client_id,
    d.origen_deposit_id,
    d.origen_descripcion,
  );

  if (d.fecha_entrega && d.fecha_solicitada && d.fecha_entrega < d.fecha_solicitada) {
    return { error: "La fecha de entrega no puede ser anterior a la fecha de carga" };
  }

  const { data: trip, error: tripError } = await supabase
    .from("trips")
    .insert({
      client_id: d.client_id,
      tipo: "REPARTO",
      estado: "PENDIENTE",
      origen_deposit_id: d.origen_deposit_id || null,
      origen_descripcion: origenDescripcion,
      destino_descripcion: (d.multiples_destinos && d.destinos && d.destinos.length > 0) ? d.destinos[0].destino : (d.destino_descripcion || null),
      fecha_solicitada: d.fecha_solicitada || null,
      observaciones_cliente: d.observaciones_cliente || null,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (tripError) return { error: `Error al crear viaje: ${tripError.message}` };

  const metadata: Record<string, unknown> = {};
  if (d.fecha_entrega) metadata.fecha_entrega = d.fecha_entrega;
  if (d.codigo_postal) metadata.codigo_postal = d.codigo_postal;
  if (d.zona_tarifa) metadata.zona_tarifa = d.zona_tarifa;
  if (d.horario) metadata.horario = d.horario;
  if (d.tipo_camion) metadata.tipo_camion = d.tipo_camion;
  if (d.peon) metadata.peon = d.peon;

  const { error: fieldsError } = await supabase.from("trip_reparto_fields").insert({
    trip_id: trip.id,
    ndv: d.ndv || null,
    pal: d.pal ?? null,
    cat: d.cat || null,
    nro_un: d.nro_un || null,
    cantidad_bultos: d.cantidad_bultos ?? null,
    peso_kg: d.peso_kg ?? null,
    toneladas: d.toneladas ?? null,
    metadata,
  });

  if (fieldsError) return { error: `Error al crear campos: ${fieldsError.message}` };

  if (d.multiples_destinos && d.destinos && d.destinos.length > 0) {
    await insertTripDestinations(supabase as ReturnType<typeof createClient>, trip.id, d.destinos);
  }

  await notifyRepartoCreated(trip.id);

  revalidatePath("/operador/pendientes");
  revalidatePath("/operador/solicitudes");
  return { success: true };
}

/**
 * Operador crea un contenedor en nombre de un cliente.
 * client_id viene explícito en el payload (no de la sesión).
 */
export async function createContenedorForClientAction(
  _prev: TripActionState,
  formData: FormData,
): Promise<TripActionState> {
  const user = await getCurrentUser();
  const supabase = createAdminClient();

  const raw = JSON.parse(formData.get("payload") as string);
  const parsed = CreateContenedorSchema.extend({
    client_id: z.string().uuid("Seleccioná un cliente"),
  }).safeParse(raw);

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const d = parsed.data;
  const origenDescripcion = await resolveOrigenDescripcion(
    supabase as ReturnType<typeof createClient>,
    d.client_id,
    d.origen_deposit_id,
    d.origen_descripcion,
  );

  const { data: reservation, error: resError } = await supabase
    .from("reservations")
    .insert({
      client_id: d.client_id,
      numero_booking: d.numero_booking || null,
      naviera: d.naviera || null,
      buque: d.buque || null,
      fecha_arribo: d.fecha_arribo || null,
      fecha_carga: d.fecha_carga || null,
      fecha_entrega: d.fecha_entrega || null,
      orden: d.orden || null,
      mercaderia: d.mercaderia || null,
      despacho: d.despacho || null,
      carga: d.carga || null,
      terminal: d.terminal || null,
      devuelve_en: d.devuelve_en || null,
      libre_hasta: d.libre_hasta || null,
      observaciones: d.observaciones || null,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (resError) return { error: `Error al crear reserva: ${resError.message}` };

  for (let i = 0; i < d.containers.length; i++) {
    const c = d.containers[i];

    const { data: container, error: contError } = await supabase
      .from("containers")
      .insert({
        reservation_id: reservation.id,
        numero: c.numero || null,
        tipo: c.tipo || null,
        peso_carga_kg: c.peso_carga_kg ?? null,
        fecha_entrega: c.fecha_entrega || null,
        observaciones: c.observaciones || null,
      })
      .select("id")
      .single();

    if (contError) return { error: `Contenedor ${i + 1}: ${contError.message}` };

    const { data: trip, error: tripError } = await supabase
      .from("trips")
      .insert({
        client_id: d.client_id,
        tipo: "CONTENEDOR",
        estado: "PENDIENTE",
        container_id: container.id,
        origen_deposit_id: d.origen_deposit_id || null,
        origen_descripcion: origenDescripcion,
        destino_descripcion: (d.multiples_destinos && d.destinos && d.destinos.length > 0) ? d.destinos[0].destino : (d.destino_descripcion || null),
        fecha_solicitada: d.fecha_carga || null,
        observaciones_cliente: d.observaciones || null,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (tripError) return { error: `Viaje del contenedor ${i + 1}: ${tripError.message}` };

    if (d.multiples_destinos && d.destinos && d.destinos.length > 0) {
      await insertTripDestinations(supabase as ReturnType<typeof createClient>, trip.id, d.destinos);
    }

    await notifyContenedorCreated(trip.id);
  }

  revalidatePath("/operador/pendientes");
  revalidatePath("/operador/solicitudes");
  return { success: true };
}

// =========================================================================
// Req. 2.12 extensión — Reordenar destinos (solo PENDIENTE/PREASIGNADO/ASIGNADO)
// =========================================================================

const REORDER_ALLOWED_STATES = ["PENDIENTE", "PREASIGNADO", "ASIGNADO"];

export async function reorderDestinationsAction(
  tripId: string,
  orderedIds: string[],
): Promise<TripActionState> {
  try {
    const user = await getCurrentUser();
    if (!["OPERADOR", "ADMIN"].includes(user.profile.role)) {
      return { error: "Solo operadores pueden reordenar destinos" };
    }

    const supabase = createAdminClient();

    const { data: trip } = await supabase
      .from("trips")
      .select("estado")
      .eq("id", tripId)
      .maybeSingle();

    if (!trip) return { error: "Viaje no encontrado" };
    if (!REORDER_ALLOWED_STATES.includes(trip.estado)) {
      return { error: "No se puede reordenar destinos de un viaje en curso o finalizado" };
    }

    await Promise.all(
      orderedIds.map((id, index) =>
        supabase
          .from("trip_destinations")
          .update({ orden: index })
          .eq("id", id)
          .eq("trip_id", tripId),
      ),
    );

    revalidatePath("/operador");
    return { success: true };
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err) throw err;
    console.error("[reorderDestinationsAction] error:", err);
    return { error: `Error inesperado: ${err instanceof Error ? err.message : String(err)}` };
  }
}
