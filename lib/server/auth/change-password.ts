"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "./get-current-user";

export type ChangePasswordState = {
  error?: string;
  success?: boolean;
};

/**
 * Allow a logged-in user to change their password.
 * Validates that oldPassword matches before allowing the change.
 */
export async function changePasswordAction(
  _prev: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  try {
    const user = await getCurrentUser();
    const oldPassword = formData.get("oldPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return { error: "Todos los campos son requeridos" };
    }

    if (newPassword.length < 8) {
      return { error: "La contraseña debe tener al menos 8 caracteres" };
    }

    if (newPassword !== confirmPassword) {
      return { error: "Las contraseñas no coinciden" };
    }

    const supabase = createClient();

    // Try to re-authenticate with old password
    // Note: Supabase client doesn't have a built-in "verify password" method
    // So we attempt to sign in with the old password - if it fails, the password is wrong
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email || "",
      password: oldPassword,
    });

    if (signInError) {
      return { error: "Contraseña actual incorrecta" };
    }

    // Now update the password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      return { error: `Error al cambiar contraseña: ${updateError.message}` };
    }

    return { success: true };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Error desconocido",
    };
  }
}
