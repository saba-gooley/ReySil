import { z } from "zod";

export const MOTIVOS_PARADA = [
  "Almorzar",
  "Descanso",
  "Combustible",
  "Control policial",
  "Choque",
  "Otros",
] as const;

export type MotivoParada = (typeof MOTIVOS_PARADA)[number];

const shiftStopBase = z.object({
  hora: z.string().min(1, "Hora requerida"),
  motivo: z.enum(MOTIVOS_PARADA, { required_error: "Motivo requerido" }),
  observaciones: z.string().optional(),
  duracion_min: z.number().int().positive("Debe ser mayor a 0").nullable().optional(),
});

export const AddShiftStopSchema = shiftStopBase;
export const UpdateShiftStopSchema = shiftStopBase;

export type AddShiftStopInput = z.infer<typeof AddShiftStopSchema>;
export type UpdateShiftStopInput = z.infer<typeof UpdateShiftStopSchema>;
