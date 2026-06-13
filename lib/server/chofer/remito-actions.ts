"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/server/auth/get-current-user";
import { todayAR } from "@/lib/utils/date";
import { sendEmail } from "@/lib/server/notifications/send-email";
import { remitosMultipleSubject, remitosMultipleHtml } from "@/lib/server/notifications/templates";
import { getClientMailsForRemito, getReysilNotificationEmails } from "@/lib/server/notifications/client-preferences-queries";

export type ChoferActionState = {
  error?: string;
  success?: boolean;
};

const REMITO_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_REMITOS;

export async function uploadRemitoAction(
  _prev: ChoferActionState,
  formData: FormData,
): Promise<ChoferActionState> {
  try {
    const user = await getCurrentUser();
    const driverId = user.profile.driver_id;
    if (!driverId) return { error: "Usuario no vinculado a un chofer" };

    const tripId = formData.get("trip_id") as string;
    if (!tripId) return { error: "Viaje no especificado" };

    const file = formData.get("remito_file") as File | null;
    if (!file || file.size === 0) return { error: "Selecciona una foto del remito" };

    if (!REMITO_FOLDER_ID) return { error: "Google Drive no configurado" };

    const supabase = createAdminClient();

    // Fetch trip + client name for file naming
    const { data: trip } = await supabase
      .from("trips")
      .select("codigo, fecha_solicitada, clients!inner(nombre)")
      .eq("id", tripId)
      .single();

    const clientObj = trip?.clients;
    const clientName = (Array.isArray(clientObj) ? clientObj[0] : clientObj)?.nombre ?? "Cliente";
    const fecha = trip?.fecha_solicitada ?? todayAR();
    const ext = file.name.split(".").pop() ?? "jpg";
    const codigo = trip?.codigo ?? tripId.slice(0, 8);
    // Sufijo aleatorio 4 chars — diferencia múltiples remitos del mismo viaje sin queries (req. 2.7)
    const rand = Math.random().toString(36).slice(2, 6);
    const fileName = `${codigo}-${clientName}-${fecha}-${rand}.${ext}`;

    // Upload to Google Drive
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let driveUrl: string;
    let driveFileId: string;
    try {
      const { uploadToDrive } = await import("@/lib/server/drive/upload");
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("drive_timeout")),
          25_000,
        ),
      );
      const result = await Promise.race([
        uploadToDrive({
          fileName,
          mimeType: file.type || "image/jpeg",
          body: buffer,
          folderId: REMITO_FOLDER_ID,
        }),
        timeout,
      ]);
      driveUrl = result.webViewLink;
      driveFileId = result.fileId;
    } catch (err) {
      console.error("[upload-remito] Drive upload error:", err);
      return { error: "No se pudo subir el remito. Verificá tu conexión e intentá de nuevo." };
    }

    // Save remito record
    const { error } = await supabase.from("remitos").insert({
      trip_id: tripId,
      drive_url: driveUrl,
      drive_file_id: driveFileId,
      filename: fileName,
      estado: "PENDIENTE",
      uploaded_by: user.id,
    });

    if (error) return { error: `Error al guardar remito: ${error.message}` };

    // Email ya NO se envía automáticamente (req. 2.7) — el chofer/operador usa "Enviar Mail"
    revalidatePath("/chofer");
    return { success: true };
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err) throw err;
    console.error("[uploadRemitoAction] error:", err);
    return { error: `Error inesperado: ${err instanceof Error ? err.message : String(err)}` };
  }
}

/**
 * Req. 2.7/2.8 — Envía todos los remitos del viaje en un único email al cliente
 * y registra el timestamp en trips.remito_email_enviado_at.
 */
export async function sendRemitoEmailAction(
  tripId: string,
): Promise<ChoferActionState> {
  try {
    const supabase = createAdminClient();

    const { data: trip, error } = await supabase
      .from("trips")
      .select(`
        id, tipo, codigo, fecha_solicitada, destino_descripcion, client_id,
        clients!inner(nombre),
        trip_assignments(patente, drivers(nombre, apellido)),
        remitos(id, drive_url, filename),
        containers(numero, reservations(mercaderia, orden))
      `)
      .eq("id", tripId)
      .single();

    if (error || !trip) return { error: "No se encontró el viaje" };

    const remitos = Array.isArray(trip.remitos) ? trip.remitos : [];
    if (remitos.length === 0) return { error: "Este viaje no tiene remitos cargados" };

    const clientMails = await getClientMailsForRemito(trip.client_id);
    const reysilMails = await getReysilNotificationEmails("remitos");
    const recipients = Array.from(new Set([...clientMails, ...reysilMails]));
    if (recipients.length === 0) return { error: "No hay destinatarios configurados para este cliente" };

    const unwrap = (val: unknown) => (Array.isArray(val) ? val[0] : val) as Record<string, unknown> | null;
    const client = unwrap(trip.clients);
    const assignment = unwrap(trip.trip_assignments as unknown);
    const driver = assignment ? unwrap(assignment.drivers as unknown) : null;
    const container = unwrap(trip.containers as unknown);
    const reservation = container ? unwrap(container.reservations as unknown) : null;

    const data = {
      clientName: (client?.nombre as string) ?? "—",
      driverName: driver ? `${driver.nombre} ${driver.apellido}` : "—",
      patente: (assignment?.patente as string) ?? "—",
      destino: trip.destino_descripcion ?? "—",
      fecha: trip.fecha_solicitada
        ? new Date(trip.fecha_solicitada).toLocaleDateString("es-AR")
        : "—",
      codigo: trip.codigo,
      tipoSolicitud: trip.tipo === "REPARTO" ? "Reparto" : "Contenedor",
      numeroContenedor: (container?.numero as string | null) ?? undefined,
      mercaderia: (reservation?.mercaderia as string | null) ?? undefined,
      orden: (reservation?.orden as string | null) ?? undefined,
      remitos: remitos.map((r) => ({
        url: (r as { drive_url: string }).drive_url,
        filename: (r as { filename: string | null }).filename ?? undefined,
      })),
    };

    await sendEmail({
      to: recipients,
      subject: remitosMultipleSubject(data),
      html: remitosMultipleHtml(data),
    });

    // Marcar email enviado en el viaje
    await supabase
      .from("trips")
      .update({ remito_email_enviado_at: new Date().toISOString() })
      .eq("id", tripId);

    revalidatePath("/chofer");
    revalidatePath("/operador");
    return { success: true };
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err) throw err;
    console.error("[sendRemitoEmailAction] error:", err);
    return { error: `Error inesperado: ${err instanceof Error ? err.message : String(err)}` };
  }
}
