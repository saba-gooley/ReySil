"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/server/auth/get-current-user";
import { todayAR } from "@/lib/utils/date";

export type OperatorRemitoActionState = {
  error?: string;
  success?: boolean;
};

const REMITO_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_REMITOS;

/**
 * Req. 2.8 — El operador sube un remito desde el back office para un viaje
 * EN_CURSO o FINALIZADO (caso excepcional: el chofer no pudo usar la app).
 */
export async function uploadRemitoFromOperatorAction(
  _prev: OperatorRemitoActionState,
  formData: FormData,
): Promise<OperatorRemitoActionState> {
  try {
    const user = await requireRole("OPERADOR", "ADMIN");

    const tripId = formData.get("trip_id") as string;
    if (!tripId) return { error: "Viaje no especificado" };

    const file = formData.get("remito_file") as File | null;
    if (!file || file.size === 0) return { error: "Selecciona un archivo" };

    if (!REMITO_FOLDER_ID) return { error: "Google Drive no configurado" };

    const supabase = createAdminClient();

    const { data: trip } = await supabase
      .from("trips")
      .select("codigo, fecha_solicitada, estado, clients!inner(nombre)")
      .eq("id", tripId)
      .single();

    if (!trip) return { error: "Viaje no encontrado" };
    if (!["EN_CURSO", "FINALIZADO"].includes(trip.estado)) {
      return { error: "Solo se pueden cargar remitos para viajes EN_CURSO o FINALIZADOS" };
    }

    const clientObj = trip.clients;
    const clientName = (Array.isArray(clientObj) ? clientObj[0] : clientObj)?.nombre ?? "Cliente";
    const fecha = trip.fecha_solicitada ?? todayAR();
    const ext = file.name.split(".").pop() ?? "jpg";
    const codigo = trip.codigo;
    const rand = Math.random().toString(36).slice(2, 6);
    const fileName = `${codigo}-${clientName}-${fecha}-${rand}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let driveUrl: string;
    let driveFileId: string;
    try {
      const { uploadToDrive } = await import("@/lib/server/drive/upload");
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("drive_timeout")), 25_000),
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
      console.error("[operator-remito] Drive upload error:", err);
      return { error: "No se pudo subir el archivo. Verificá tu conexión e intentá de nuevo." };
    }

    const { error } = await supabase.from("remitos").insert({
      trip_id: tripId,
      drive_url: driveUrl,
      drive_file_id: driveFileId,
      filename: fileName,
      estado: "PENDIENTE",
      uploaded_by: user.id,
    });

    if (error) return { error: `Error al guardar remito: ${error.message}` };

    revalidatePath("/operador");
    return { success: true };
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err) throw err;
    console.error("[uploadRemitoFromOperatorAction] error:", err);
    return { error: `Error inesperado: ${err instanceof Error ? err.message : String(err)}` };
  }
}
