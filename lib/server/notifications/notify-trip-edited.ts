import { createAdminClient } from "@/lib/supabase/server";
import { sendEmail } from "./send-email";
import { getReysilNotificationEmails } from "./client-preferences-queries";
import { tripEditedSubject, tripEditedHtml, type TripEditedEmailData } from "./templates";

/** Devuelve el primer elemento si Supabase anido un array, o el objeto tal cual. */
function unwrapOne<T>(val: unknown): T | null {
  if (Array.isArray(val)) return (val[0] ?? null) as T | null;
  return (val ?? null) as T | null;
}

/**
 * Req. 2.16 — Avisa a ReySil que el cliente modifico una solicitud.
 *
 * Solo se dispara cuando edita el CLIENTE. Cuando edita el operador no se
 * manda nada, porque es quien esta mirando el viaje.
 *
 * Nunca lanza: un fallo de mail no puede tumbar una edicion ya guardada.
 */
export async function notifyTripEditedByClient(tripId: string): Promise<void> {
  try {
    const supabase = createAdminClient();

    const { data: trip, error } = await supabase
      .from("trips")
      .select(`
        id,
        codigo,
        estado,
        fecha_solicitada,
        origen_descripcion,
        destino_descripcion,
        clients!inner ( nombre ),
        trip_assignments ( drivers ( nombre, apellido ) ),
        trip_destinations ( id )
      `)
      .eq("id", tripId)
      .single();

    if (error || !trip) {
      console.error("[notify-trip-edited] Trip fetch error:", error?.message);
      return;
    }

    const recipients = await getReysilNotificationEmails("ediciones");

    if (recipients.length === 0) {
      console.warn("[notify-trip-edited] No hay mails de ReySil configurados para ediciones");
      return;
    }

    const row = trip as unknown as Record<string, unknown>;
    const client = unwrapOne<{ nombre: string }>(row.clients);
    const assignment = unwrapOne<{ drivers: unknown }>(row.trip_assignments);
    const driver = assignment
      ? unwrapOne<{ nombre: string; apellido: string }>(assignment.drivers)
      : null;

    const destinos = (row.trip_destinations as unknown[]) ?? [];
    const destino =
      destinos.length > 1
        ? `${trip.destino_descripcion ?? "—"} (+${destinos.length - 1} destinos más)`
        : trip.destino_descripcion || "—";

    const data: TripEditedEmailData = {
      codigo: trip.codigo,
      clientName: client?.nombre ?? "—",
      origen: trip.origen_descripcion || "—",
      destino,
      fecha: trip.fecha_solicitada
        ? new Date(trip.fecha_solicitada + "T00:00:00").toLocaleDateString("es-AR")
        : "—",
      estado: trip.estado,
      choferAsignado: driver ? `${driver.nombre} ${driver.apellido}` : undefined,
    };

    await sendEmail({
      to: recipients,
      subject: tripEditedSubject(data),
      html: tripEditedHtml(data),
    });
  } catch (err) {
    console.error("[notify-trip-edited] Unexpected error:", err);
  }
}
