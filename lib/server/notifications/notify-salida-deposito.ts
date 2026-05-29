import { createAdminClient } from "@/lib/supabase/server";
import { sendEmail } from "./send-email";
import {
  salidaDepositoSubject,
  salidaDepositoHtml,
  type SalidaDepositoEmailData,
} from "./templates";
import {
  getClientMailsForSalidaDeposito,
  getReysilNotificationEmails,
} from "./client-preferences-queries";

/**
 * Send "Salida del Depósito" email for Contenedor trips.
 * Triggered from registerTripEventAction when eventType === "SALIDA_DEPOSITO".
 * Never throws — logs errors instead.
 */
export async function notifySalidaDeposito(
  tripId: string,
  salidaAt: string,
): Promise<void> {
  try {
    const supabase = createAdminClient();

    const { data: trip, error } = await supabase
      .from("trips")
      .select(`
        id,
        fecha_solicitada,
        origen_descripcion,
        destino_descripcion,
        client_id,
        clients!inner ( nombre ),
        containers (
          reservations (
            orden, mercaderia, despacho, carga, terminal, devuelve_en, libre_hasta
          )
        )
      `)
      .eq("id", tripId)
      .single();

    if (error || !trip) {
      console.error("[notify-salida-deposito] Trip fetch error:", error?.message);
      return;
    }

    const [clientMails, reysilMails] = await Promise.all([
      getClientMailsForSalidaDeposito(trip.client_id),
      getReysilNotificationEmails("salida_deposito"),
    ]);

    const recipients = Array.from(new Set([...clientMails, ...reysilMails]));
    if (recipients.length === 0) {
      console.warn("[notify-salida-deposito] No emails configured for trip", tripId);
      return;
    }

    const client = Array.isArray(trip.clients) ? trip.clients[0] : trip.clients;
    const container = Array.isArray(trip.containers) ? trip.containers[0] : trip.containers;
    const reservationRaw = (container as { reservations?: unknown } | null)?.reservations;
    const reservation = Array.isArray(reservationRaw) ? reservationRaw[0] : reservationRaw;

    type ReservationData = {
      orden: string | null;
      mercaderia: string | null;
      despacho: string | null;
      carga: string | null;
      terminal: string | null;
      devuelve_en: string | null;
      libre_hasta: string | null;
    };

    const res = reservation as ReservationData | null | undefined;

    const horaSalida = new Date(salidaAt).toLocaleTimeString("es-AR", {
      timeZone: "America/Argentina/Buenos_Aires",
      hour: "2-digit",
      minute: "2-digit",
    });

    const data: SalidaDepositoEmailData = {
      clientName: (client as { nombre: string }).nombre,
      fecha: trip.fecha_solicitada
        ? new Date(trip.fecha_solicitada).toLocaleDateString("es-AR")
        : "—",
      horaSalida,
      lugarCarga: trip.origen_descripcion,
      destino: trip.destino_descripcion,
      orden: res?.orden,
      mercaderia: res?.mercaderia,
      despacho: res?.despacho,
      carga: res?.carga,
      terminal: res?.terminal,
      devuelveEn: res?.devuelve_en,
      libreHasta: res?.libre_hasta,
    };

    await sendEmail({
      to: recipients,
      subject: salidaDepositoSubject(data),
      html: salidaDepositoHtml(data),
    });
  } catch (err) {
    console.error("[notify-salida-deposito] Unexpected error:", err);
  }
}
