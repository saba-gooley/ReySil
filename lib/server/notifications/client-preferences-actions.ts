"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import {
  ClientNotificationPreferenceSchema,
  ReysilNotificationEmailSchema,
} from "@/lib/validators/shift-assignment";

export type PreferenceActionState = {
  error?: string;
  success?: boolean;
};

/**
 * Agregar email a preferencias de notificación del cliente
 */
export async function addClientNotificationPreference(
  _prev: PreferenceActionState,
  formData: FormData,
): Promise<PreferenceActionState> {
  try {
    const raw = JSON.parse(formData.get("payload") as string);
    const parsed = ClientNotificationPreferenceSchema.safeParse(raw);

    if (!parsed.success) {
      return {
        error: Object.values(parsed.error.flatten().fieldErrors)
          .flat()
          .join(", "),
      };
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("client_notification_preferences")
      .insert(parsed.data);

    if (error) {
      return { error: `Error al agregar email: ${error.message}` };
    }

    revalidatePath("/operador/clientes");
    return { success: true };
  } catch (err) {
    return {
      error: `Error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * Actualizar preferencias de notificación (qué tipos de mails enviar)
 */
export async function updateClientNotificationPreference(
  _prev: PreferenceActionState,
  formData: FormData,
): Promise<PreferenceActionState> {
  try {
    const raw = JSON.parse(formData.get("payload") as string);
    const { id, enviar_al_crear_solicitud, enviar_al_asignar_chofer } = raw;

    if (!id) {
      return { error: "ID de preferencia requerido" };
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("client_notification_preferences")
      .update({
        enviar_al_crear_solicitud,
        enviar_al_asignar_chofer,
      })
      .eq("id", id);

    if (error) {
      return { error: `Error al actualizar: ${error.message}` };
    }

    revalidatePath("/operador/clientes");
    return { success: true };
  } catch (err) {
    return {
      error: `Error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * Eliminar email de preferencias de notificación
 */
export async function deleteClientNotificationPreference(
  _prev: PreferenceActionState,
  formData: FormData,
): Promise<PreferenceActionState> {
  try {
    const id = formData.get("id") as string;

    if (!id) {
      return { error: "ID de preferencia requerido" };
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("client_notification_preferences")
      .delete()
      .eq("id", id);

    if (error) {
      return { error: `Error al eliminar: ${error.message}` };
    }

    revalidatePath("/operador/clientes");
    return { success: true };
  } catch (err) {
    return {
      error: `Error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * Agregar email interno de ReySil para notificaciones
 */
export async function addReysilNotificationEmail(
  _prev: PreferenceActionState,
  formData: FormData,
): Promise<PreferenceActionState> {
  try {
    const raw = JSON.parse(formData.get("payload") as string);
    const parsed = ReysilNotificationEmailSchema.safeParse(raw);

    if (!parsed.success) {
      return {
        error: Object.values(parsed.error.flatten().fieldErrors)
          .flat()
          .join(", "),
      };
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("reysil_notification_emails")
      .insert(parsed.data);

    if (error) {
      if (error.code === "23505") {
        return {
          error: `Este email ya existe`,
        };
      }
      return { error: `Error al agregar email: ${error.message}` };
    }

    revalidatePath("/operador/configuracion");
    return { success: true };
  } catch (err) {
    return {
      error: `Error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * Actualizar qué tipos de notificaciones enviar a un email interno
 */
export async function updateReysilNotificationEmail(
  _prev: PreferenceActionState,
  formData: FormData,
): Promise<PreferenceActionState> {
  try {
    const raw = JSON.parse(formData.get("payload") as string);
    const { id, enviar_solicitudes, enviar_asignaciones } = raw;

    if (!id) {
      return { error: "ID de email requerido" };
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("reysil_notification_emails")
      .update({
        enviar_solicitudes,
        enviar_asignaciones,
      })
      .eq("id", id);

    if (error) {
      return { error: `Error al actualizar: ${error.message}` };
    }

    revalidatePath("/operador/configuracion");
    return { success: true };
  } catch (err) {
    return {
      error: `Error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * Eliminar email interno de ReySil
 */
export async function deleteReysilNotificationEmail(
  _prev: PreferenceActionState,
  formData: FormData,
): Promise<PreferenceActionState> {
  try {
    const id = formData.get("id") as string;

    if (!id) {
      return { error: "ID de email requerido" };
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("reysil_notification_emails")
      .delete()
      .eq("id", id);

    if (error) {
      return { error: `Error al eliminar: ${error.message}` };
    }

    revalidatePath("/operador/configuracion");
    return { success: true };
  } catch (err) {
    return {
      error: `Error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}
