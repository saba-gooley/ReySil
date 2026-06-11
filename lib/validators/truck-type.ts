import { z } from "zod";

export const TruckTypeSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, "Nombre requerido")
    .max(50, "Máximo 50 caracteres"),
});

export type TruckTypeInput = z.infer<typeof TruckTypeSchema>;
