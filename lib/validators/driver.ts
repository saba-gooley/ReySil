import { z } from "zod";

export const CreateDriverSchema = z.object({
  codigo: z
    .string()
    .min(1, "Codigo requerido")
    .transform((v) => v.trim().toUpperCase()),
  dni: z
    .string()
    .min(1, "DNI requerido")
    .transform((v) => v.trim()),
  nombre: z.string().min(1, "Nombre requerido").transform((v) => v.trim()),
  apellido: z.string().min(1, "Apellido requerido").transform((v) => v.trim()),
  telefono: z
    .string()
    .optional()
    .default("")
    .transform((v) => v.trim()),
});

export type CreateDriverInput = z.infer<typeof CreateDriverSchema>;

export const UpdateDriverSchema = z.object({
  id: z.string().uuid(),
  codigo: z
    .string()
    .min(1, "Codigo requerido")
    .transform((v) => v.trim().toUpperCase()),
  dni: z
    .string()
    .min(1, "DNI requerido")
    .transform((v) => v.trim()),
  nombre: z.string().min(1, "Nombre requerido").transform((v) => v.trim()),
  apellido: z.string().min(1, "Apellido requerido").transform((v) => v.trim()),
  telefono: z
    .string()
    .optional()
    .default("")
    .transform((v) => v.trim()),
});

export type UpdateDriverInput = z.infer<typeof UpdateDriverSchema>;
