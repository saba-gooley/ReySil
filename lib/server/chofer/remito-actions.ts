"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/server/auth/get-current-user";

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
      .select("fecha_solicitada, clients!inner(nombre)")
      .eq("id", tripId)
      .single();

    const clientObj = trip?.clients;
    const clientName = (Array.isArray(clientObj) ? clientObj[0] : clientObj)?.nombre ?? "Cliente";
    const fecha = trip?.fecha_solicitada ?? new Date().toISOString().split("T")[0];
    const ext = file.name.split(".").pop() ?? "jpg";
    const fileName = `${clientName}-${fecha}-${tripId.slice(0, 8)}.${ext}`;

    // Upload to Google Drive
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let driveUrl: string;
    let driveFileId: string;
    try {
      const { uploadToDrive } = await import("@/lib/server/drive/upload");
      const result = await uploadToDrive({
        fileName,
        mimeType: file.type || "image/jpeg",
        body: buffer,
        folderId: REMITO_FOLDER_ID,
      });
      driveUrl = result.webViewLink;
      driveFileId = result.fileId;
    } catch (err) {
      console.error("[upload-remito] Drive upload error:", err);
      return { error: "Error al subir archivo a Google Drive" };
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

    // HU-NOT-002: fire-and-forget email to client with remito link
    import("@/lib/server/notifications/notify-remito").then(({ notifyRemitoUploaded }) =>
      notifyRemitoUploaded(tripId, driveUrl).catch(() => {}),
    );

    revalidatePath("/chofer");
    return { success: true };
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err) throw err;
    console.error("[uploadRemitoAction] error:", err);
    return { error: `Error inesperado: ${err instanceof Error ? err.message : String(err)}` };
  }
}
