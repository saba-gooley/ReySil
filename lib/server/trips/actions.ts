"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/server/auth/get-current-user";
import { CreateRepartoSchema, CreateContenedorSchema } from "@/lib/validators/trip";

export type TripActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
};

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
      origen_descripcion: d.origen_descripcion || null,
      destino_descripcion: d.destino_descripcion || null,
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

  for (let i = 0; i < rows.length; i++) {
    const parsed = CreateRepartoSchema.safeParse(rows[i]);
    if (!parsed.success) {
      return { error: `Fila ${i + 1}: ${Object.values(parsed.error.flatten().fieldErrors).flat().join(", ")}` };
    }

    const d = parsed.data;

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
        origen_descripcion: d.origen_descripcion || null,
        destino_descripcion: d.destino_descripcion || null,
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
        observaciones: c.observaciones || null,
      })
      .select("id")
      .single();

    if (contError) {
      return { error: `Contenedor ${i + 1}: ${contError.message}` };
    }

    const { error: tripError } = await supabase.from("trips").insert({
      client_id: user.profile.client_id,
      tipo: "CONTENEDOR",
      estado: "PENDIENTE",
      container_id: container.id,
      origen_deposit_id: d.origen_deposit_id || null,
      origen_descripcion: d.origen_descripcion || null,
      destino_descripcion: d.destino_descripcion || null,
      fecha_solicitada: d.fecha_carga || null,
      observaciones_cliente: d.observaciones || null,
      created_by: user.id,
    });

    if (tripError) {
      return { error: `Viaje del contenedor ${i + 1}: ${tripError.message}` };
    }
  }

  revalidatePath("/cliente/solicitudes");
  revalidatePath("/cliente/seguimiento");
  revalidatePath("/operador/pendientes");
  return { success: true };
}
