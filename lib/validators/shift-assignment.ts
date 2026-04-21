import { z } from "zod";

/**
 * Schema para actualizar turno (shift_logs)
 * KM al 50%, KM al 100%, y pernoctada se registran por turno, no por viaje
 */
export const UpdateShiftSchema = z.object({
  shift_id: z.string().uuid(),
  km_50: z.coerce.number().nonnegative().optional().nullable(),
  km_100: z.coerce.number().nonnegative().optional().nullable(),
  pernoctada: z.boolean().optional().default(false),
});

export type UpdateShiftInput = z.infer<typeof UpdateShiftSchema>;

/**
 * Schema para asignar/reasignar viaje (trip_assignments)
 * Ahora incluye comentario_asignacion que el operador puede escribir
 */
export const AssignTripSchema = z.object({
  trip_id: z.string().uuid(),
  driver_id: z.string().uuid(),
  patente: z.string().min(1, "Patente requerida"),
  patente_acoplado: z.string().optional().nullable(),
  comentario_asignacion: z.string().optional().nullable(),
});

export type AssignTripInput = z.infer<typeof AssignTripSchema>;

/**
 * Schema para preferencias de notificación por cliente
 */
export const ClientNotificationPreferenceSchema = z.object({
  client_id: z.string().uuid(),
  email: z.string().email("Email inválido"),
  enviar_al_crear_solicitud: z.boolean().default(true),
  enviar_al_asignar_chofer: z.boolean().default(true),
});

export type ClientNotificationPreferenceInput = z.infer<
  typeof ClientNotificationPreferenceSchema
>;

/**
 * Schema para mails internos de ReySil
 */
export const ReysilNotificationEmailSchema = z.object({
  email: z.string().email("Email inválido"),
  enviar_solicitudes: z.boolean().default(false),
  enviar_asignaciones: z.boolean().default(false),
});

export type ReysilNotificationEmailInput = z.infer<
  typeof ReysilNotificationEmailSchema
>;
