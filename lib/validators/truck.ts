import { z } from "zod";

export const TruckSchema = {
  create: z.object({
    marca: z.string().min(1, "Marca requerida").transform((v) => v.trim()),
    modelo: z.string().min(1, "Modelo requerido").transform((v) => v.trim()),
    patente: z
      .string()
      .min(1, "Patente requerida")
      .transform((v) => v.trim().toUpperCase())
      .refine(
        (v) => /^[A-Z]{2,3}\d{1,3}[A-Z]{2}$/.test(v),
        "Patente inválida (formato: AAA123BB)"
      ),
  }),
  update: z.object({
    marca: z.string().min(1, "Marca requerida").transform((v) => v.trim()),
    modelo: z.string().min(1, "Modelo requerido").transform((v) => v.trim()),
    patente: z
      .string()
      .min(1, "Patente requerida")
      .transform((v) => v.trim().toUpperCase())
      .refine(
        (v) => /^[A-Z]{2,3}\d{1,3}[A-Z]{2}$/.test(v),
        "Patente inválida (formato: AAA123BB)"
      ),
  }),
};

export type CreateTruckInput = z.infer<typeof TruckSchema.create>;
export type UpdateTruckInput = z.infer<typeof TruckSchema.update>;
