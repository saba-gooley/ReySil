import { createAdminClient } from "@/lib/supabase/server";
import { sendEmail } from "./send-email";
import {
  assignmentSubject,
  assignmentHtml,
  type AssignmentEmailData,
} from "./templates";

/**
 * HU-NOT-001: Send email to all client emails when a driver + patente
 * is assigned (or reassigned) to a trip.
 *
 * Runs fire-and-forget — never throws. Uses service role client
 * to bypass RLS and read client emails.
 */
export async function notifyAssignment(tripId: string): Promise<void> {
  try {
    const supabase = createAdminClient();

    // Fetch trip with client, assignment, and driver in one query
    const { data: trip, error } = await supabase
      .from("trips")
      .select(`
        id,
        tipo,
        fecha_solicitada,
        destino_descripcion,
        client_id,
        clients!inner ( nombre ),
        trip_assignments!inner ( patente, drivers!inner ( nombre, apellido ) )
      `)
      .eq("id", tripId)
      .single();

    if (error || !trip) {
      console.error("[notify-assignment] Trip fetch error:", error?.message);
      return;
    }

    // Get all emails for this client
    const { data: emails } = await supabase
      .from("client_emails")
      .select("email")
      .eq("client_id", trip.client_id);

    const recipients = (emails ?? []).map((e) => e.email);
    if (recipients.length === 0) {
      console.warn("[notify-assignment] No emails for client", trip.client_id);
      return;
    }

    // Supabase returns joined relations as arrays
    const client = Array.isArray(trip.clients) ? trip.clients[0] : trip.clients;
    const assignment = Array.isArray(trip.trip_assignments)
      ? trip.trip_assignments[0]
      : trip.trip_assignments;
    const driver = Array.isArray(assignment.drivers)
      ? assignment.drivers[0]
      : assignment.drivers;

    const data: AssignmentEmailData = {
      clientName: (client as { nombre: string }).nombre,
      driverName: `${(driver as { nombre: string; apellido: string }).nombre} ${(driver as { nombre: string; apellido: string }).apellido}`,
      patente: assignment.patente,
      tipoViaje: trip.tipo === "REPARTO" ? "Reparto" : "Contenedor",
      destino: trip.destino_descripcion ?? "—",
      fecha: trip.fecha_solicitada
        ? new Date(trip.fecha_solicitada).toLocaleDateString("es-AR")
        : "—",
    };

    await sendEmail({
      to: recipients,
      subject: assignmentSubject(data),
      html: assignmentHtml(data),
    });
  } catch (err) {
    console.error("[notify-assignment] Unexpected error:", err);
  }
}
