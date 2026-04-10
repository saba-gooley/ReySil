"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { CreateDriverSchema, UpdateDriverSchema } from "@/lib/validators/driver";

export type DriverActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
  generatedCredentials?: { email: string; password: string };
};

/**
 * Crea un chofer con credenciales de acceso generadas automaticamente.
 * Crea auth.users + user_profiles con rol CHOFER vinculado al driver_id.
 * Devuelve las credenciales generadas para mostrar UNA vez al operador.
 */
export async function createDriverAction(
  _prev: DriverActionState,
  formData: FormData,
): Promise<DriverActionState> {
  const raw = JSON.parse(formData.get("payload") as string);
  const parsed = CreateDriverSchema.safeParse(raw);

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { codigo, dni, nombre, apellido, telefono } = parsed.data;

  const supabase = createClient();
  const admin = createAdminClient();

  // Check unique codigo
  const { data: existingCodigo } = await supabase
    .from("drivers")
    .select("id")
    .eq("codigo", codigo)
    .maybeSingle();

  if (existingCodigo) {
    return { error: `Ya existe un chofer con el codigo "${codigo}"` };
  }

  // Check unique DNI
  const { data: existingDni } = await supabase
    .from("drivers")
    .select("id")
    .eq("dni", dni)
    .maybeSingle();

  if (existingDni) {
    return { error: `Ya existe un chofer con el DNI "${dni}"` };
  }

  // 1. Insert driver
  const { data: driver, error: driverError } = await supabase
    .from("drivers")
    .insert({
      codigo,
      dni,
      nombre,
      apellido,
      telefono: telefono || null,
    })
    .select("id")
    .single();

  if (driverError) {
    return { error: `Error al crear chofer: ${driverError.message}` };
  }

  // 2. Generate credentials and create auth user
  const generatedEmail = `chofer.${dni}@reysil.app`;
  const generatedPassword = generateTempPassword();

  const { data: authUser, error: authError } =
    await admin.auth.admin.createUser({
      email: generatedEmail,
      password: generatedPassword,
      email_confirm: true,
    });

  if (authError) {
    return {
      error: `Error al crear credenciales: ${authError.message}`,
    };
  }

  // 3. Create user_profiles
  const { error: profileError } = await admin
    .from("user_profiles")
    .insert({
      id: authUser.user.id,
      role: "CHOFER",
      full_name: `${nombre} ${apellido}`,
      client_id: null,
      driver_id: driver.id,
      operator_id: null,
    });

  if (profileError) {
    return {
      error: `Error al crear perfil: ${profileError.message}`,
    };
  }

  revalidatePath("/operador/choferes");
  return {
    success: true,
    generatedCredentials: {
      email: generatedEmail,
      password: generatedPassword,
    },
  };
}

/**
 * Actualiza los datos de un chofer existente.
 * No modifica las credenciales de auth.
 */
export async function updateDriverAction(
  _prev: DriverActionState,
  formData: FormData,
): Promise<DriverActionState> {
  const raw = JSON.parse(formData.get("payload") as string);
  const parsed = UpdateDriverSchema.safeParse(raw);

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { id, codigo, dni, nombre, apellido, telefono } = parsed.data;

  const supabase = createClient();

  // Check unique codigo (excluding self)
  const { data: existingCodigo } = await supabase
    .from("drivers")
    .select("id")
    .eq("codigo", codigo)
    .neq("id", id)
    .maybeSingle();

  if (existingCodigo) {
    return { error: `Ya existe un chofer con el codigo "${codigo}"` };
  }

  // Check unique DNI (excluding self)
  const { data: existingDni } = await supabase
    .from("drivers")
    .select("id")
    .eq("dni", dni)
    .neq("id", id)
    .maybeSingle();

  if (existingDni) {
    return { error: `Ya existe un chofer con el DNI "${dni}"` };
  }

  const { error: driverError } = await supabase
    .from("drivers")
    .update({
      codigo,
      dni,
      nombre,
      apellido,
      telefono: telefono || null,
    })
    .eq("id", id);

  if (driverError) {
    return { error: `Error al actualizar chofer: ${driverError.message}` };
  }

  // Update full_name in user_profiles
  const admin = createAdminClient();
  await admin
    .from("user_profiles")
    .update({ full_name: `${nombre} ${apellido}` })
    .eq("driver_id", id);

  revalidatePath("/operador/choferes");
  return { success: true };
}

/**
 * Baja logica: toggle del campo activo.
 * Si se desactiva, banea al usuario auth del chofer.
 * Si se reactiva, desbanea.
 */
export async function toggleDriverAction(
  driverId: string,
  activo: boolean,
): Promise<DriverActionState> {
  const supabase = createClient();
  const admin = createAdminClient();

  const { error } = await supabase
    .from("drivers")
    .update({ activo })
    .eq("id", driverId);

  if (error) {
    return { error: `Error al actualizar estado: ${error.message}` };
  }

  // Ban/unban the auth user linked to this driver
  const { data: profile } = await admin
    .from("user_profiles")
    .select("id")
    .eq("driver_id", driverId)
    .maybeSingle();

  if (profile) {
    if (activo) {
      await admin.auth.admin.updateUserById(profile.id, {
        ban_duration: "none",
      });
    } else {
      await admin.auth.admin.updateUserById(profile.id, {
        ban_duration: "876600h",
      });
    }
  }

  revalidatePath("/operador/choferes");
  return { success: true };
}

function generateTempPassword(): string {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
