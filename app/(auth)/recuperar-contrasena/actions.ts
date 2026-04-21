"use server";

import { headers } from "next/headers";
import { RecoverPasswordSchema } from "@/lib/validators/auth";
import { createClient } from "@/lib/supabase/server";

export type RecoverState = {
  error?: string;
  fieldErrors?: { email?: string };
  success?: boolean;
};

/**
 * Server Action de recuperacion de contrasena.
 *
 * Llama a `resetPasswordForEmail` con un redirectTo al callback de auth.
 * Supabase envia un email con un magic link que, al usarse, exchange un
 * code por una sesion temporal y redirige a /restablecer-contrasena.
 *
 * SIEMPRE devuelve success aunque el email no exista (para no revelar la
 * existencia de cuentas). El error solo se reporta si la validacion fallo
 * o el servicio de Supabase tiro un error tecnico real.
 */
export async function recoverPasswordAction(
  _prev: RecoverState,
  formData: FormData,
): Promise<RecoverState> {
  const parsed = RecoverPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    const fieldErrors: RecoverState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as "email";
      if (!fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    return { fieldErrors };
  }

  // Construir el redirectTo absoluto. IMPORTANTE: debe coincidir exactamente con
  // "Authorized redirect URLs" en Supabase Auth > URL Configuration.
  // Preferir NEXT_PUBLIC_APP_URL; fallback solo si no estamos en produccion.
  let origin = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");

  if (!origin) {
    // Solo para desarrollo local
    const headersList = headers();
    const host = headersList.get("host");
    const proto = headersList.get("x-forwarded-proto") ?? "https";
    origin = host ? `${proto}://${host}` : "";
  }

  if (!origin) {
    return {
      error:
        "Error de configuracion: NEXT_PUBLIC_APP_URL no esta configurado.",
    };
  }

  const redirectUrl = `${origin}/auth/callback`;
  console.log(`[recoverPassword] Using redirectTo: ${redirectUrl}`);

  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    {
      redirectTo: redirectUrl,
    },
  );

  if (error) {
    console.error("[recoverPassword] Supabase error:", {
      message: error.message,
      status: error.status,
      code: (error as any).code,
    });
  }

  // Si el error es de configuracion (URL invalida, etc), lo reportamos.
  // Pero si es "email not found" o similar, lo silenciamos por seguridad.
  if (error && error.status && error.status >= 500) {
    return {
      error:
        "No se pudo enviar el email en este momento. Intenta mas tarde.",
    };
  }

  return { success: true };
}
