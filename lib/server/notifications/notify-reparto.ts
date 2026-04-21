import { createAdminClient } from "@/lib/supabase/server";
import { sendEmail } from "./send-email";
import {
  getClientMailsForSolicitud,
  getReysilNotificationEmails,
} from "./client-preferences-queries";

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

    // Build email subject and body based on tipo
    const tipoViaje = trip.tipo === "REPARTO" ? "Reparto" : "Contenedor";
    const subject = `Solicitud de ${tipoViaje} — ${(client as { nombre: string }).nombre}`;

    let html = `
      <h2>Nueva Solicitud de ${tipoViaje}</h2>
      <p><strong>Cliente:</strong> ${(client as { nombre: string }).nombre}</p>
      <p><strong>Fecha:</strong> ${trip.fecha_solicitada ? new Date(trip.fecha_solicitada).toLocaleDateString("es-AR") : "—"}</p>
      <p><strong>Origen:</strong> ${trip.origen_descripcion || "—"}</p>
      <p><strong>Destino:</strong> ${trip.destino_descripcion || "—"}</p>
    `;

    if (trip.tipo === "REPARTO" && repartoFields) {
      html += `
        <h3>Detalles del Reparto</h3>
        <ul>
          <li><strong>NDV:</strong> ${(repartoFields as { ndv: string | null }).ndv || "—"}</li>
          <li><strong>Peso:</strong> ${(repartoFields as { peso_kg: number | null }).peso_kg || "—"} kg</li>
        </ul>
      `;
    } else if (trip.tipo === "CONTENEDOR" && container) {
      const cont = container as {
        numero: string | null;
        tipo: string | null;
        peso_carga_kg: number | null;
        reservations: { numero_booking: string | null; naviera: string | null } | null;
      };
      html += `
        <h3>Detalles del Contenedor</h3>
        <ul>
          <li><strong>Número:</strong> ${cont.numero || "—"}</li>
          <li><strong>Tipo:</strong> ${cont.tipo || "—"}</li>
          <li><strong>Peso:</strong> ${cont.peso_carga_kg || "—"} kg</li>
          ${cont.reservations ? `<li><strong>Booking:</strong> ${cont.reservations.numero_booking || "—"}</li>` : ""}
          ${cont.reservations ? `<li><strong>Naviera:</strong> ${cont.reservations.naviera || "—"}</li>` : ""}
        </ul>
      `;
    }

    html += `<p>Por favor, revise la solicitud en el sistema.</p>`;

    await sendEmail({
      to: recipients,
      subject,
      html,
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
