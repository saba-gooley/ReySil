"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { z } from "zod";

export type OperatorActionState = {
  error?: string;
  success?: boolean;
  generatedCredentials?: { email: string; password: string };
};

const CreateOperatorSchema = z.object({
  email: z.string().email("Email inválido"),
  full_name: z.string().min(2, "Nombre requerido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

const UpdateOperatorSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().min(2, "Nombre requerido"),
});

export async function createOperatorAction(
  _prev: OperatorActionState,
  formData: FormData,
): Promise<OperatorActionState> {
  const raw = {
    email: formData.get("email"),
    full_name: formData.get("full_name"),
    password: formData.get("password"),
  };

  const parsed = CreateOperatorSchema.safeParse(raw);
  if (!parsed.success) {
    const msg = Object.values(parsed.error.flatten().fieldErrors).flat().join(", ");
    return { error: msg };
  }

  const { email, full_name, password } = parsed.data;
  const admin = createAdminClient();

  // Check if email already exists
  const { data: existing } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (existing?.users.some((u) => u.email === email)) {
    return { error: `Ya existe un usuario con el email "${email}"` };
  }

  // 1. Create auth user
  const { data: authUser, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) return { error: `Error al crear usuario: ${authError.message}` };

  // 2. Create user_profile with OPERADOR role
  const { error: profileError } = await admin.from("user_profiles").insert({
    id: authUser.user.id,
    role: "OPERADOR",
    full_name,
    client_id: null,
    driver_id: null,
    operator_id: null,
  });

  if (profileError) {
    // Rollback auth user
    await admin.auth.admin.deleteUser(authUser.user.id);
    return { error: `Error al crear perfil: ${profileError.message}` };
  }

  revalidatePath("/admin/operadores");
  return { success: true, generatedCredentials: { email, password } };
}

export async function updateOperatorAction(
  _prev: OperatorActionState,
  formData: FormData,
): Promise<OperatorActionState> {
  const raw = { id: formData.get("id"), full_name: formData.get("full_name") };
  const parsed = UpdateOperatorSchema.safeParse(raw);
  if (!parsed.success) {
    const msg = Object.values(parsed.error.flatten().fieldErrors).flat().join(", ");
    return { error: msg };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("user_profiles")
    .update({ full_name: parsed.data.full_name })
    .eq("id", parsed.data.id)
    .eq("role", "OPERADOR");

  if (error) return { error: `Error al actualizar: ${error.message}` };

  revalidatePath("/admin/operadores");
  return { success: true };
}

export async function deactivateOperatorAction(
  _prev: OperatorActionState,
  formData: FormData,
): Promise<OperatorActionState> {
  const id = formData.get("id") as string;
  if (!id) return { error: "ID requerido" };

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(id, {
    ban_duration: "876600h",
  });

  if (error) return { error: `Error al desactivar: ${error.message}` };

  revalidatePath("/admin/operadores");
  return { success: true };
}

export async function reactivateOperatorAction(
  _prev: OperatorActionState,
  formData: FormData,
): Promise<OperatorActionState> {
  const id = formData.get("id") as string;
  if (!id) return { error: "ID requerido" };

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(id, {
    ban_duration: "none",
  });

  if (error) return { error: `Error al reactivar: ${error.message}` };

  revalidatePath("/admin/operadores");
  return { success: true };
}

export async function resetOperatorPasswordAction(
  _prev: OperatorActionState,
  formData: FormData,
): Promise<OperatorActionState> {
  const id = formData.get("id") as string;
  const newPassword = formData.get("password") as string;

  if (!id || !newPassword || newPassword.length < 8) {
    return { error: "Contraseña debe tener al menos 8 caracteres" };
  }

  const admin = createAdminClient();
  const { data: authUser, error: fetchError } = await admin.auth.admin.getUserById(id);
  if (fetchError) return { error: "Operador no encontrado" };

  const { error } = await admin.auth.admin.updateUserById(id, { password: newPassword });
  if (error) return { error: `Error al resetear contraseña: ${error.message}` };

  revalidatePath("/admin/operadores");
  return {
    success: true,
    generatedCredentials: { email: authUser.user.email ?? "", password: newPassword },
  };
}
