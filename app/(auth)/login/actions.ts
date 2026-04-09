"use server";

import { redirect } from "next/navigation";
import { LoginSchema } from "@/lib/validators/auth";
import { createClient } from "@/lib/supabase/server";
import { homePathForRole, type UserRole } from "@/lib/server/auth/get-current-user";

export type LoginState = {
  error?: string;
  fieldErrors?: {
    email?: string;
    password?: string;
  };
};

/**
 * Server Action de login. Valida con Zod, autentica con Supabase Auth,
 * lee el rol del perfil y redirige al home correspondiente.
 *
 * Mensaje de error generico para no revelar si el email existe
 * (criterio HU-AUTH-001).
 */
export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const fieldErrors: LoginState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as "email" | "password";
      if (!fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    return { fieldErrors };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: "Email o contrasena incorrectos" };
  }

  // Sesion creada. Leer el rol del perfil para redirigir al home correcto.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Error al iniciar sesion. Intenta nuevamente." };
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile?.role) {
    await supabase.auth.signOut();
    return {
      error:
        "Tu cuenta no tiene un perfil asociado. Contacta al administrador.",
    };
  }

  const next = (formData.get("next") as string | null) ?? null;
  const target =
    next && next.startsWith("/") && !next.startsWith("//")
      ? next
      : homePathForRole(profile.role as UserRole);

  redirect(target);
}
