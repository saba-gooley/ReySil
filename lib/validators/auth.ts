import { z } from "zod";

/**
 * Schemas Zod compartidos cliente/servidor para flujos de autenticacion.
 *
 * IMPORTANTE: Los mensajes de error de credenciales invalidas son
 * deliberadamente genericos para no revelar si el usuario existe o no
 * (criterio de aceptacion HU-AUTH-001).
 */

export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, "Ingresa tu email")
    .email("Email invalido")
    .transform((v) => v.trim().toLowerCase()),
  password: z
    .string()
    .min(1, "Ingresa tu contrasena")
    .max(72, "Contrasena demasiado larga"),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const RecoverPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Ingresa tu email")
    .email("Email invalido")
    .transform((v) => v.trim().toLowerCase()),
});

export type RecoverPasswordInput = z.infer<typeof RecoverPasswordSchema>;

export const ResetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Minimo 8 caracteres")
      .max(72, "Maximo 72 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contrasenas no coinciden",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
