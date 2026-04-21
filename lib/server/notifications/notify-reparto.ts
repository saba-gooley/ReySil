import { createAdminClient } from "@/lib/supabase/server";
import { sendEmail } from "./send-email";
import {
  getClientMailsForSolicitud,
  getReysilNotificationEmails,
} from "./client-preferences-queries";
import {
  solicitudSubject,
  solicitudHtml,
  type SolicitudEmailData,
} from "./templates";

/**
 * HU-NOT-003: Send email to client and ReySil when a REPARTO or CONTENEDOR
 * solicitud is created.
 *
 * Runs fire-and-forget — never throws. Uses service role client
 * to bypass RLS.
 */
export async function notifyRepartoCreated(tripId: string): Promise<void> {
  try {
    const supabase = createAdminClient();

    // Fetch trip with client and solicitud details
    const { data: trip, error } = await supabase
      .from("trips")
      .select(`
        id,
        tipo,
        fecha_solicitada,
        origen_descripcion,
        destino_descripcion,
        client_id,
        clients!inner ( nombre ),
        trip_reparto_fields ( ndv, peso_kg ),
        containers ( numero, tipo, peso_carga_kg, reservations ( numero_booking, naviera ) )
      `)
      .eq("id", tripId)
      .single();

    if (error || !trip) {
      console.error("[notify-reparto] Trip fetch error:", error?.message);
      return;
    }

    // Get client emails configured for solicitud notifications
    const clientMails = await getClientMailsForSolicitud(trip.client_id);

    // Get ReySil internal emails configured for solicitudes
    const reysilMails = await getReysilNotificationEmails("solicitudes");

    // Combine and deduplicate
    const recipients = Array.from(new Set([...clientMails, ...reysilMails]));

    if (recipients.length === 0) {
      console.warn("[notify-reparto] No emails configured for trip", tripId);
      return;
    }

    // Unwrap nested data
    const client = Array.isArray(trip.clients)
      ? trip.clients[0]
      : trip.clients;
    const repartoFields = Array.isArray(trip.trip_reparto_fields)
      ? trip.trip_reparto_fields[0]
      : trip.trip_reparto_fields;
    const container = Array.isArray(trip.containers)
      ? trip.containers[0]
      : trip.containers;

    const tipoSolicitud: "Reparto" | "Contenedor" =
      trip.tipo === "REPARTO" ? "Reparto" : "Contenedor";

    // Build detalles string based on tipo
    let detalles = "";
    if (trip.tipo === "REPARTO" && repartoFields) {
      const reparto = repartoFields as {
        ndv: string | null;
        peso_kg: number | null;
      };
      detalles = `NDV: ${reparto.ndv || "—"}, Peso: ${reparto.peso_kg || "—"} kg`;
    } else if (trip.tipo === "CONTENEDOR" && container) {
      const cont = container as {
        numero: string | null;
        tipo: string | null;
      };
      detalles = `Contenedor ${cont.numero || "?"} (${cont.tipo || "?"})`;
    }

    const emailData: SolicitudEmailData = {
      clientName: (client as { nombre: string }).nombre,
      tipoSolicitud,
      origen: trip.origen_descripcion || "—",
      destino: trip.destino_descripcion || "—",
      fecha: trip.fecha_solicitada
        ? new Date(trip.fecha_solicitada).toLocaleDateString("es-AR")
        : "—",
      detalles: detalles || undefined,
    };

    await sendEmail({
      to: recipients,
      subject: solicitudSubject(emailData),
      html: solicitudHtml(emailData),
    });
  } catch (err) {
    console.error("[notify-reparto] Unexpected error:", err);
  }
}

/**
 * Similar a notifyRepartoCreated pero para múltiples contenedores
 * (cuando se crea una solicitud CONTENEDOR con varios contenedores)
 */
export async function notifyContenedorCreated(tripId: string): Promise<void> {
  // Por ahora, reutiliza la lógica general
  // En una iteración futura, puedes agregar un template específico
  // que enumere todos los contenedores
  await notifyRepartoCreated(tripId);
}
