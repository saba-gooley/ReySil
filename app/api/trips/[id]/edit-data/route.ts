import { getCurrentUser } from "@/lib/server/auth/get-current-user";
import { createAdminClient } from "@/lib/supabase/server";
import { getRepartoForEdit } from "@/lib/server/trips/queries";
import { listActiveTruckTypes } from "@/lib/server/truck-types/queries";
import { isTripEditable, NOT_EDITABLE_ERROR } from "@/lib/server/trips/editable";
import { repartoToInitialValues } from "@/lib/utils/reparto-form";

export const dynamic = "force-dynamic";

/**
 * Req. 2.16 — Datos para rellenar el formulario de edicion de un Reparto.
 *
 * Se resuelve al abrir el dialogo en vez de precargarlo en cada fila de la
 * grilla: son datos pesados y solo hacen falta para el viaje que se edita.
 *
 * Repite las mismas validaciones que updateRepartoAction. No alcanza con
 * validar al guardar: si no, cualquiera podria leer por aca una solicitud
 * ajena.
 */
export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const user = await getCurrentUser();
  const role = user.profile.role;
  const isStaff = role === "OPERADOR" || role === "ADMIN";

  const trip = await getRepartoForEdit(params.id);
  if (!trip) {
    return Response.json({ error: "Solicitud no encontrada" }, { status: 404 });
  }

  const isOwnerClient =
    role === "CLIENTE" &&
    !!user.profile.client_id &&
    user.profile.client_id === trip.client_id;

  if (!isStaff && !isOwnerClient) {
    return Response.json({ error: "No autorizado" }, { status: 403 });
  }

  if (!isTripEditable(trip.estado)) {
    return Response.json({ error: NOT_EDITABLE_ERROR }, { status: 409 });
  }

  const supabase = createAdminClient();
  const [{ data: client }, truckTypes, { data: deposits }] = await Promise.all([
    supabase.from("clients").select("nombre").eq("id", trip.client_id).maybeSingle(),
    listActiveTruckTypes(),
    supabase
      .from("client_deposits")
      .select("id, nombre, direccion, tipo")
      .eq("client_id", trip.client_id)
      .eq("activo", true)
      .order("nombre"),
  ]);

  return Response.json({
    initialValues: repartoToInitialValues(trip),
    clientName: client?.nombre ?? "—",
    truckTypes: truckTypes.map((t) => t.nombre),
    deposits: deposits ?? [],
  });
}
