"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/server/auth/get-current-user";

export type ChoferActionState = {
  error?: string;
  success?: boolean;
};

// =========================================================================
// HU-CHO-005: Inspection sections definition
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

// =========================================================================
// HU-CHO-005: Start inspection
// =========================================================================

export async function startInspectionAction(
  patente: string,
): Promise<{ id: string } | { error: string }> {
  try {
    const user = await getCurrentUser();
    const driverId = user.profile.driver_id;
    if (!driverId) return { error: "Usuario no vinculado a un chofer" };

    const supabase = createAdminClient();
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
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err) throw err;
    console.error("[startInspectionAction] error:", err);
    return { error: `Error inesperado: ${err instanceof Error ? err.message : String(err)}` };
  }
}

// =========================================================================
// HU-CHO-005: Update inspection item
// =========================================================================

export async function updateInspectionItemAction(
  itemId: string,
  estado: "CUMPLE" | "NO_CUMPLE" | "NA",
  observaciones?: string,
): Promise<ChoferActionState> {
  try {
    await getCurrentUser();
    const supabase = createAdminClient();

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
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err) throw err;
    console.error("[updateInspectionItemAction] error:", err);
    return { error: `Error inesperado: ${err instanceof Error ? err.message : String(err)}` };
  }
}

// =========================================================================
// HU-CHO-005: Complete inspection
// =========================================================================

export async function completeInspectionAction(
  inspectionId: string,
  observaciones?: string,
): Promise<ChoferActionState> {
  try {
    const user = await getCurrentUser();
    const supabase = createAdminClient();

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
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err) throw err;
    console.error("[completeInspectionAction] error:", err);
    return { error: `Error inesperado: ${err instanceof Error ? err.message : String(err)}` };
  }
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

  const { generateAndUploadInspectionPdf } = await import("@/lib/server/pdf/generate-inspection");
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
