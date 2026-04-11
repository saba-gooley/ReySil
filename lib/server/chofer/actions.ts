"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/server/auth/get-current-user";
import { z } from "zod";
import { notifyRemitoUploaded } from "@/lib/server/notifications/notify-remito";
import { generateAndUploadInspectionPdf } from "@/lib/server/pdf/generate-inspection";
import { uploadToDrive } from "@/lib/server/drive/upload";

export type ChoferActionState = {
  error?: string;
  success?: boolean;
};

// =========================================================================
// HU-CHO-002: Shift log events
// =========================================================================

type ShiftField =
  | "llegada_deposito"
  | "salida_deposito"
  | "vuelta_deposito"
  | "fin_turno";

export async function registerShiftEvent(
  field: ShiftField,
): Promise<ChoferActionState> {
  const user = await getCurrentUser();
  const driverId = user.profile.driver_id;
  if (!driverId) return { error: "Usuario no vinculado a un chofer" };

  const supabase = createClient();
  const today = new Date().toISOString().split("T")[0];
  const now = new Date().toISOString();

  // Upsert: create shift if not exists, update the field
  const { data: existing } = await supabase
    .from("shift_logs")
    .select("id")
    .eq("driver_id", driverId)
    .eq("fecha", today)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("shift_logs")
      .update({ [field]: now, updated_at: now })
      .eq("id", existing.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("shift_logs").insert({
      driver_id: driverId,
      fecha: today,
      [field]: now,
    });
    if (error) return { error: error.message };
  }

  revalidatePath("/chofer/turno");
  return { success: true };
}

// =========================================================================
// HU-CHO-003: Trip driver data + events
// =========================================================================

const TripDataSchema = z.object({
  trip_id: z.string().uuid(),
  event_type: z
    .enum([
      "LLEGADA_DEPOSITO_REYSIL",
      "SALIDA_DEPOSITO_REYSIL",
      "LLEGADA_DESTINO_CLIENTE",
      "SALIDA_CLIENTE",
      "FIN_VIAJE",
    ])
    .optional(),
  km_inicial: z.coerce.number().optional().nullable(),
  km_50_porc: z.coerce.number().optional().nullable(),
  km_100_porc: z.coerce.number().optional().nullable(),
  km_final: z.coerce.number().optional().nullable(),
  pernocto: z.boolean().optional().default(false),
  lugar_pernocto: z.string().optional().default(""),
  carga_peligrosa: z.boolean().optional().default(false),
  observaciones: z.string().optional().default(""),
});

export async function registerTripDataAction(
  _prev: ChoferActionState,
  formData: FormData,
): Promise<ChoferActionState> {
  const user = await getCurrentUser();
  const driverId = user.profile.driver_id;
  if (!driverId) return { error: "Usuario no vinculado a un chofer" };

  const raw = JSON.parse(formData.get("payload") as string);
  const parsed = TripDataSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: Object.values(parsed.error.flatten().fieldErrors).flat().join(", ") };
  }

  const d = parsed.data;
  const supabase = createClient();
  const now = new Date().toISOString();

  // Register event if provided
  if (d.event_type) {
    const { error: evErr } = await supabase.from("trip_events").insert({
      trip_id: d.trip_id,
      tipo: d.event_type,
      ocurrido_at: now,
      observaciones: d.observaciones || null,
    });
    if (evErr) return { error: `Error al registrar evento: ${evErr.message}` };

    // Update trip estado to EN_CURSO if it's ASIGNADO
    await supabase
      .from("trips")
      .update({ estado: "EN_CURSO" })
      .eq("id", d.trip_id)
      .eq("estado", "ASIGNADO");

    // If FIN_VIAJE, mark as FINALIZADO
    if (d.event_type === "FIN_VIAJE") {
      await supabase
        .from("trips")
        .update({ estado: "FINALIZADO" })
        .eq("id", d.trip_id);
    }
  }

  // Upsert trip_driver_data
  const { data: existing } = await supabase
    .from("trip_driver_data")
    .select("id")
    .eq("trip_id", d.trip_id)
    .maybeSingle();

  const driverDataPayload = {
    trip_id: d.trip_id,
    km_inicial: d.km_inicial ?? null,
    km_50_porc: d.km_50_porc ?? null,
    km_100_porc: d.km_100_porc ?? null,
    km_final: d.km_final ?? null,
    pernocto: d.pernocto,
    observaciones: d.observaciones || null,
    registrado_by: user.id,
  };

  if (existing) {
    const { error } = await supabase
      .from("trip_driver_data")
      .update(driverDataPayload)
      .eq("id", existing.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from("trip_driver_data")
      .insert(driverDataPayload);
    if (error) return { error: error.message };
  }

  revalidatePath("/chofer");
  return { success: true };
}

// =========================================================================
// HU-CHO-004: Upload remito to Google Drive
// =========================================================================

const REMITO_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_REMITOS;

export async function uploadRemitoAction(
  _prev: ChoferActionState,
  formData: FormData,
): Promise<ChoferActionState> {
  const user = await getCurrentUser();
  const driverId = user.profile.driver_id;
  if (!driverId) return { error: "Usuario no vinculado a un chofer" };

  const tripId = formData.get("trip_id") as string;
  if (!tripId) return { error: "Viaje no especificado" };

  const file = formData.get("remito_file") as File | null;
  if (!file || file.size === 0) return { error: "Selecciona una foto del remito" };

  if (!REMITO_FOLDER_ID) return { error: "Google Drive no configurado" };

  const supabase = createClient();

  // Fetch trip + client name for file naming: [Cliente]-[Fecha]-[seq].jpg
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
  notifyRemitoUploaded(tripId, driveUrl).catch(() => {});

  revalidatePath("/chofer");
  return { success: true };
}

// =========================================================================
// HU-CHO-005: Inspection
// =========================================================================

const INSPECTION_SECTIONS = {
  DOCUMENTACION: [
    { codigo: "ART", desc: "ART" },
    { codigo: "SEGURO_LIC", desc: "Seguro y Licencias" },
    { codigo: "CEDULA_VERDE", desc: "Cedula Verde" },
    { codigo: "RUTA", desc: "RUTA" },
    { codigo: "VTV", desc: "VTV" },
  ],
  ESTADO_VEHICULO: [
    { codigo: "CUBIERTAS", desc: "Cubiertas" },
    { codigo: "LONAS", desc: "Lonas" },
    { codigo: "LUCES", desc: "Luces" },
    { codigo: "SUJECION", desc: "Elementos de Sujecion" },
    { codigo: "COMBUSTIBLE", desc: "Combustible/Aceite" },
    { codigo: "FRENOS", desc: "Frenos" },
    { codigo: "LIMPIEZA", desc: "Limpieza" },
  ],
  SEG_PERSONAL: [
    { codigo: "VESTIMENTA", desc: "Vestimenta" },
    { codigo: "ZAPATOS", desc: "Zapatos" },
    { codigo: "CASCO", desc: "Casco" },
    { codigo: "GUANTES_CUERO", desc: "Guantes cuero" },
    { codigo: "GUANTES_GOMA", desc: "Guantes goma" },
    { codigo: "CHALECO", desc: "Chaleco" },
    { codigo: "MASCARA", desc: "Mascara" },
    { codigo: "BOTIQUIN", desc: "Botiquin" },
  ],
  SEG_VEHICULO: [
    { codigo: "BALIZAS", desc: "Balizas" },
    { codigo: "LINTERNAS", desc: "Linternas" },
    { codigo: "CUARTA_REMOLQUE", desc: "Cuarta de remolque" },
    { codigo: "TACOGRAFO", desc: "Tacografo" },
    { codigo: "ARRESTALLAMAS", desc: "Arrestallamas" },
    { codigo: "CALZAS", desc: "Calzas" },
    { codigo: "ALARMA_RETROCESO", desc: "Alarma de retroceso" },
  ],
  KIT_DERRAMES: [
    { codigo: "MATAFUEGO", desc: "Matafuego" },
    { codigo: "ABSORBENTE", desc: "Absorbente" },
    { codigo: "CONOS", desc: "Conos" },
    { codigo: "BOLSAS", desc: "Bolsas" },
    { codigo: "CINTAS", desc: "Cintas" },
    { codigo: "PALA_ANTICHISPA", desc: "Pala antichispa" },
    { codigo: "PLACAS", desc: "Placas" },
    { codigo: "SIN_FUGAS", desc: "Ausencia de fugas" },
    { codigo: "HOJA_SEGURIDAD", desc: "Hoja de seguridad" },
  ],
};

export { INSPECTION_SECTIONS };

export async function startInspectionAction(
  patente: string,
): Promise<{ id: string } | { error: string }> {
  const user = await getCurrentUser();
  const driverId = user.profile.driver_id;
  if (!driverId) return { error: "Usuario no vinculado a un chofer" };

  const supabase = createClient();
  const today = new Date().toISOString().split("T")[0];

  // Check if inspection already exists
  const { data: existing } = await supabase
    .from("inspections")
    .select("id")
    .eq("driver_id", driverId)
    .eq("fecha", today)
    .eq("patente", patente)
    .maybeSingle();

  if (existing) return { id: existing.id };

  // Create inspection
  const { data: inspection, error: insErr } = await supabase
    .from("inspections")
    .insert({
      driver_id: driverId,
      patente,
      fecha: today,
    })
    .select("id")
    .single();

  if (insErr) return { error: insErr.message };

  // Create all items
  const items: {
    inspection_id: string;
    seccion: string;
    item_codigo: string;
    item_descripcion: string;
  }[] = [];

  for (const [seccion, sectionItems] of Object.entries(INSPECTION_SECTIONS)) {
    for (const item of sectionItems) {
      items.push({
        inspection_id: inspection.id,
        seccion,
        item_codigo: item.codigo,
        item_descripcion: item.desc,
      });
    }
  }

  const { error: itemsErr } = await supabase
    .from("inspection_items")
    .insert(items);

  if (itemsErr) return { error: itemsErr.message };

  revalidatePath("/chofer/inspeccion");
  return { id: inspection.id };
}

export async function updateInspectionItemAction(
  itemId: string,
  estado: "CUMPLE" | "NO_CUMPLE" | "NA",
  observaciones?: string,
): Promise<ChoferActionState> {
  await getCurrentUser();
  const supabase = createClient();

  const { error } = await supabase
    .from("inspection_items")
    .update({
      estado,
      observaciones: observaciones || null,
      registrado_at: new Date().toISOString(),
    })
    .eq("id", itemId);

  if (error) return { error: error.message };
  revalidatePath("/chofer/inspeccion");
  return { success: true };
}

export async function completeInspectionAction(
  inspectionId: string,
  observaciones?: string,
): Promise<ChoferActionState> {
  const user = await getCurrentUser();
  const supabase = createClient();

  const now = new Date().toISOString();

  const { error } = await supabase
    .from("inspections")
    .update({
      status: "COMPLETADA",
      completado_at: now,
      observaciones_generales: observaciones || null,
    })
    .eq("id", inspectionId);

  if (error) return { error: error.message };

  // HU-CHO-006: Generate PDF and upload to Drive (fire-and-forget)
  generateInspectionPdfAsync(inspectionId, user.profile.full_name ?? "Chofer").catch(
    (err) => console.error("[inspection-pdf] Error:", err),
  );

  revalidatePath("/chofer/inspeccion");
  return { success: true };
}

/**
 * Background helper: fetch inspection data, generate PDF, upload to Drive,
 * and update the inspection record with the PDF URL.
 */
async function generateInspectionPdfAsync(
  inspectionId: string,
  driverName: string,
): Promise<void> {
  const { createAdminClient } = await import("@/lib/supabase/server");
  const supabase = createAdminClient();

  const { data: inspection } = await supabase
    .from("inspections")
    .select("patente, fecha, completado_at, observaciones_generales")
    .eq("id", inspectionId)
    .single();

  if (!inspection) return;

  const { data: items } = await supabase
    .from("inspection_items")
    .select("seccion, item_codigo, item_descripcion, estado, observaciones")
    .eq("inspection_id", inspectionId)
    .order("seccion")
    .order("item_codigo");

  if (!items || items.length === 0) return;

  const { pdfUrl, driveFileId } = await generateAndUploadInspectionPdf({
    driverName,
    patente: inspection.patente,
    fecha: inspection.fecha,
    completadoAt: inspection.completado_at
      ? new Date(inspection.completado_at).toLocaleString("es-AR")
      : new Date().toLocaleString("es-AR"),
    observacionesGenerales: inspection.observaciones_generales,
    items,
  });

  await supabase
    .from("inspections")
    .update({ pdf_url: pdfUrl, pdf_drive_file_id: driveFileId })
    .eq("id", inspectionId);

  console.log(`[inspection-pdf] PDF generated for ${inspection.patente}-${inspection.fecha}`);
}
