"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/server/auth/get-current-user";
import { UpdateRepartoSchema } from "@/lib/validators/trip";
import { isTripEditable, NOT_EDITABLE_ERROR } from "./editable";
import { replaceTripDestinations, resolveDestinoDescripcion } from "./destinations";
import { notifyTripEditedByClient } from "@/lib/server/notifications/notify-trip-edited";
import type { TripActionState } from "./actions";

/**
 * Req. 2.16 — Editar una solicitud de REPARTO.
 *
 * La usan tanto el operador/admin como el propio cliente. Quien edita sale de
 * la sesion, nunca del payload.
 *
 * La edicion solo se permite en PENDIENTE, PREASIGNADO y ASIGNADO. El estado
 * se relee aca (no se confia en el que vio la UI) porque entre que se abre el
 * formulario y se guarda, el chofer puede haber arrancado el viaje.
 *
 * La misma regla vive en las policies RLS de la migracion 0024: si esta accion
 * tuviera un bug, la base sigue rechazando la escritura.
 */
export async function updateRepartoAction(
  _prev: TripActionState,
  formData: FormData,
): Promise<TripActionState> {
  const user = await getCurrentUser();

  const raw = JSON.parse(formData.get("payload") as string);
  const parsed = UpdateRepartoSchema.safeParse(raw);

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const d = parsed.data;
  const supabase = createAdminClient();

  const { data: trip, error: readError } = await supabase
    .from("trips")
    .select("id, client_id, tipo, estado")
    .eq("id", d.trip_id)
    .maybeSingle();

  if (readError) return { error: `Error al leer el viaje: ${readError.message}` };
  if (!trip) return { error: "Viaje no encontrado" };

  const role = user.profile.role;
  const isStaff = role === "OPERADOR" || role === "ADMIN";
  const isOwnerClient =
    role === "CLIENTE" &&
    !!user.profile.client_id &&
    user.profile.client_id === trip.client_id;

  if (!isStaff && !isOwnerClient) {
    return { error: "No autorizado para editar este viaje" };
  }

  if (trip.tipo !== "REPARTO") {
    return { error: "Por ahora solo se pueden editar las solicitudes de Reparto" };
  }

  if (!isTripEditable(trip.estado)) {
    return { error: NOT_EDITABLE_ERROR };
  }

  if (d.fecha_entrega && d.fecha_solicitada && d.fecha_entrega < d.fecha_solicitada) {
    return { error: "La fecha de entrega no puede ser anterior a la fecha de carga" };
  }

  const origenDescripcion = await resolveOrigenDescripcion(
    supabase as ReturnType<typeof createClient>,
    trip.client_id,
    d.origen_deposit_id,
    d.origen_descripcion,
  );

  const destinos = d.multiples_destinos ? (d.destinos ?? []) : [];

  // Los destinos primero: si tienen horas registradas se aborta sin haber
  // tocado nada del viaje.
  const destinosError = await replaceTripDestinations(
    supabase as ReturnType<typeof createClient>,
    trip.id,
    destinos,
  );
  if (destinosError) return { error: destinosError };

  // No se escriben estado ni client_id — el viaje no cambia de dueno ni de
  // etapa al editarse. El trigger de la 0024 lo refuerza en la base.
  const { error: tripError } = await supabase
    .from("trips")
    .update({
      origen_deposit_id: d.origen_deposit_id || null,
      origen_descripcion: origenDescripcion,
      destino_descripcion: resolveDestinoDescripcion(
        d.multiples_destinos ?? false,
        destinos,
        d.destino_descripcion ?? "",
      ),
      fecha_solicitada: d.fecha_solicitada || null,
      observaciones_cliente: d.observaciones_cliente || null,
    })
    .eq("id", trip.id);

  if (tripError) return { error: `Error al guardar el viaje: ${tripError.message}` };

  const metadata: Record<string, unknown> = {};
  if (d.fecha_entrega) metadata.fecha_entrega = d.fecha_entrega;
  if (d.codigo_postal) metadata.codigo_postal = d.codigo_postal;
  if (d.zona_tarifa) metadata.zona_tarifa = d.zona_tarifa;
  if (d.horario) metadata.horario = d.horario;
  if (d.tipo_camion) metadata.tipo_camion = d.tipo_camion;
  if (d.peon) metadata.peon = d.peon;

  const repartoFields = {
    ndv: d.ndv || null,
    pal: d.pal ?? null,
    cat: d.cat || null,
    nro_un: d.nro_un || null,
    cantidad_bultos: d.cantidad_bultos ?? null,
    peso_kg: d.peso_kg ?? null,
    toneladas: d.toneladas ?? null,
    metadata,
  };

  // Los repartos viejos podrian no tener la fila de campos — por eso upsert
  // manual en vez de update a secas.
  const { data: existingFields } = await supabase
    .from("trip_reparto_fields")
    .select("id")
    .eq("trip_id", trip.id)
    .maybeSingle();

  const { error: fieldsError } = existingFields
    ? await supabase
        .from("trip_reparto_fields")
        .update(repartoFields)
        .eq("trip_id", trip.id)
    : await supabase
        .from("trip_reparto_fields")
        .insert({ trip_id: trip.id, ...repartoFields });

  if (fieldsError) {
    return { error: `Error al guardar los campos del reparto: ${fieldsError.message}` };
  }

  // Solo se avisa cuando edita el cliente: si edita el operador, ya lo sabe.
  if (isOwnerClient) {
    await notifyTripEditedByClient(trip.id);
  }

  revalidatePath("/operador/pendientes");
  revalidatePath("/operador/chofer-asignado");
  revalidatePath("/cliente/seguimiento");
  revalidatePath("/cliente/solicitudes");
  return { success: true };
}

/**
 * Resuelve la descripcion del origen a partir del deposito elegido.
 * Duplica la logica del alta (actions.ts) a proposito: son modulos
 * "use server" y exportar el helper desde alli lo convertiria en un
 * endpoint accesible desde el cliente.
 */
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
