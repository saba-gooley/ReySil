import { z } from "zod";

const emailEntry = z.object({
  email: z
    .string()
    .min(1, "Email requerido")
    .email("Email invalido")
    .transform((v) => v.trim().toLowerCase()),
  es_principal: z.boolean().default(false),
});

const depositEntry = z.object({
  id: z.string().uuid().optional(),
  nombre: z.string().min(1, "Nombre del deposito requerido"),
  direccion: z.string().optional().default(""),
  tipo: z.enum(["DEPOSITO", "PUERTO"]).default("DEPOSITO"),
  activo: z.boolean().default(true),
});

export const CreateClientSchema = z
  .object({
    codigo: z
      .string()
      .min(1, "Codigo requerido")
      .transform((v) => v.trim().toUpperCase()),
    nombre: z.string().min(1, "Nombre requerido").transform((v) => v.trim()),
    cuit: z
      .string()
      .optional()
      .default("")
      .transform((v) => v.trim()),
    telefono: z
      .string()
      .optional()
      .default("")
      .transform((v) => v.trim()),
    direccion: z
      .string()
      .optional()
      .default("")
      .transform((v) => v.trim()),
    emails: z.array(emailEntry).min(1, "Al menos un email es requerido"),
    depositos: z.array(depositEntry).optional().default([]),
  })
  .refine(
    (data) => {
      const principales = data.emails.filter((e) => e.es_principal);
      return principales.length === 1;
    },
    { message: "Debe haber exactamente un email principal", path: ["emails"] },
  );

export type CreateClientInput = z.infer<typeof CreateClientSchema>;

export const UpdateClientSchema = z
  .object({
    id: z.string().uuid(),
    codigo: z
      .string()
      .min(1, "Codigo requerido")
      .transform((v) => v.trim().toUpperCase()),
    nombre: z.string().min(1, "Nombre requerido").transform((v) => v.trim()),
    cuit: z
      .string()
      .optional()
      .default("")
      .transform((v) => v.trim()),
    telefono: z
      .string()
      .optional()
      .default("")
      .transform((v) => v.trim()),
    direccion: z
      .string()
      .optional()
      .default("")
      .transform((v) => v.trim()),
    emails: z.array(emailEntry).min(1, "Al menos un email es requerido"),
    depositos: z.array(depositEntry).optional().default([]),
  })
  .refine(
    (data) => {
      const principales = data.emails.filter((e) => e.es_principal);
      return principales.length === 1;
    },
    { message: "Debe haber exactamente un email principal", path: ["emails"] },
  );

export type UpdateClientInput = z.infer<typeof UpdateClientSchema>;
