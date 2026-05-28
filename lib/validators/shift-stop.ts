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

export const AddShiftStopSchema = z.object({
  hora: z.string().min(1, "Hora requerida"),
  motivo: z.enum(MOTIVOS_PARADA),
  observaciones: z.string().optional(),
});

export type AddShiftStopInput = z.infer<typeof AddShiftStopSchema>;
