"use server";

import { redirect } from "next/navigation";
import { ResetPasswordSchema } from "@/lib/validators/auth";
import { createClient } from "@/lib/supabase/server";
import { homePathForRole, type UserRole } from "@/lib/server/auth/get-current-user";

export type ResetState = {
  error?: string;
  fieldErrors?: {
    password?: string;
    confirmPassword?: string;
  };
};

/**
 * Server Action de restablecer contrasena.
 *
 * Solo funciona si el usuario llego a esta pagina via el link del email
 * de recuperacion (Supabase ya creo una sesion temporal en /auth/callback).
 * Actualiza la contrasena via `auth.updateUser` y redirige al home.
 */
export async function resetPasswordAction(
  _prev: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const parsed = ResetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    const fieldErrors: ResetState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as "password" | "confirmPassword";
      if (!fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    return { fieldErrors };
  }

  const supabase = createClient();

  // Verificamos que el usuario tenga sesion (deberia estarlo por el callback).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error:
        "El link expiro o ya fue utilizado. Solicita uno nuevo desde 'Olvide mi contrasena'.",
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { error: "No se pudo actualizar la contrasena. Intenta nuevamente." };
  }

  // Leer rol para redirigir al home correcto.
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const target = profile?.role
    ? homePathForRole(profile.role as UserRole)
    : "/login";

  redirect(target);
}
