import { createAdminClient } from "@/lib/supabase/server";

export type ClientNotificationPreference = {
  id: string;
  client_id: string;
  email: string;
  enviar_al_crear_solicitud: boolean;
  enviar_al_asignar_chofer: boolean;
  created_at: string;
  updated_at: string;
};

/**
 * Obtener preferencias de notificación de un cliente
 */
export async function getClientNotificationPreferences(
  clientId: string,
): Promise<ClientNotificationPreference[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("client_notification_preferences")
    .select("*")
    .eq("client_id", clientId)
    .order("email");

  if (error) {
    console.error(
      "[notifications] Error fetching client preferences:",
      error,
    );
    return [];
  }

  return (data as ClientNotificationPreference[]) || [];
}

/**
 * Obtener todos los mails donde enviar al crear solicitud para un cliente
 */
export async function getClientMailsForSolicitud(
  clientId: string,
): Promise<string[]> {
  const prefs = await getClientNotificationPreferences(clientId);
  return prefs
    .filter((p) => p.enviar_al_crear_solicitud)
    .map((p) => p.email);
}

/**
 * Obtener todos los mails donde enviar al asignar chofer para un cliente
 */
export async function getClientMailsForAsignacion(
  clientId: string,
): Promise<string[]> {
  const prefs = await getClientNotificationPreferences(clientId);
  return prefs
    .filter((p) => p.enviar_al_asignar_chofer)
    .map((p) => p.email);
}

export type ReysilNotificationEmail = {
  id: string;
  email: string;
  enviar_solicitudes: boolean;
  enviar_asignaciones: boolean;
  created_at: string;
  updated_at: string;
};

/**
 * Obtener mails internos de ReySil para notificaciones
 */
export async function getReysilNotificationEmails(type: "solicitudes" | "asignaciones"): Promise<string[]> {
  const supabase = createAdminClient();

  const column = type === "solicitudes" ? "enviar_solicitudes" : "enviar_asignaciones";

  const { data, error } = await supabase
    .from("reysil_notification_emails")
    .select("email")
    .eq(column, true);

  if (error) {
    console.error("[notifications] Error fetching ReySil emails:", error);
    return [];
  }

  return (data || []).map((row) => (row as { email: string }).email);
}

/**
 * Obtener todos los mails internos de ReySil
 */
export async function getAllReysilNotificationEmails(): Promise<ReysilNotificationEmail[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("reysil_notification_emails")
    .select("*")
    .order("email");

  if (error) {
    console.error("[notifications] Error fetching all ReySil emails:", error);
    return [];
  }

  return (data as ReysilNotificationEmail[]) || [];
}
