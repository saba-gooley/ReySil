import { createAdminClient } from "@/lib/supabase/server";
import { sendEmail } from "./send-email";
import {
  remitoSubject,
  remitoHtml,
  type RemitoEmailData,
} from "./templates";
import {
  getClientMailsForRemito,
  getReysilNotificationEmails,
} from "./client-preferences-queries";

/**
 * HU-NOT-002: Send email to all client emails when the chofer
 * uploads a signed remito. Triggered directly from the upload action
 * (no operator validation needed).
 *
 * Runs fire-and-forget — never throws.
 */
export async function notifyRemitoUploaded(
  tripId: string,
  remitoUrl: string | null,
): Promise<void> {
  try {
    const supabase = createAdminClient();

    const { data: trip, error } = await supabase
      .from("trips")
      .select(`
        id,
        tipo,
        fecha_solicitada,
        destino_descripcion,
        client_id,
        clients!inner ( nombre ),
        trip_assignments!inner ( patente, drivers!inner ( nombre, apellido ) ),
        containers ( numero, reservations ( mercaderia ) )
      `)
      .eq("id", tripId)
      .single();

    if (error || !trip) {
      console.error("[notify-remito] Trip fetch error:", error?.message);
      return;
    }

    const clientMails = await getClientMailsForRemito(trip.client_id);
    const reysilMails = await getReysilNotificationEmails("remitos");
    const recipients = Array.from(new Set([...clientMails, ...reysilMails]));

    if (recipients.length === 0) {
      console.warn("[notify-remito] No emails configured for trip", tripId);
      return;
    }

    const client = Array.isArray(trip.clients) ? trip.clients[0] : trip.clients;
    const assignment = Array.isArray(trip.trip_assignments)
      ? trip.trip_assignments[0]
      : trip.trip_assignments;
    const driver = Array.isArray(assignment.drivers)
      ? assignment.drivers[0]
      : assignment.drivers;

    const container = Array.isArray(trip.containers) ? trip.containers[0] : trip.containers;
    const reservation = container
      ? (Array.isArray((container as { reservations: unknown }).reservations)
          ? ((container as { reservations: { mercaderia: string | null }[] }).reservations[0])
          : (container as { reservations: { mercaderia: string | null } | null }).reservations)
      : null;

    const data: RemitoEmailData = {
      clientName: (client as { nombre: string }).nombre,
      driverName: `${(driver as { nombre: string; apellido: string }).nombre} ${(driver as { nombre: string; apellido: string }).apellido}`,
      patente: assignment.patente,
      destino: trip.destino_descripcion ?? "—",
      fecha: trip.fecha_solicitada
        ? new Date(trip.fecha_solicitada).toLocaleDateString("es-AR")
        : "—",
      remitoUrl,
      numeroContenedor: (container as { numero: string | null } | null)?.numero ?? undefined,
      tipoMercaderia: (reservation as { mercaderia: string | null } | null)?.mercaderia ?? undefined,
    };

    await sendEmail({
      to: recipients,
      subject: remitoSubject(data),
      html: remitoHtml(data),
    });
  } catch (err) {
    console.error("[notify-remito] Unexpected error:", err);
  }
}
