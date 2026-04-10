"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { CreateClientSchema, UpdateClientSchema } from "@/lib/validators/client";

export type ClientActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
};

/**
 * Crea un cliente con sus emails y depositos.
 * Para cada email, crea un auth.users + user_profiles con rol CLIENTE
 * vinculado al client_id. Usa Service Role para saltear RLS en la
 * creacion de usuarios.
 */
export async function createClientAction(
  _prev: ClientActionState,
  formData: FormData,
): Promise<ClientActionState> {
  const raw = JSON.parse(formData.get("payload") as string);
  const parsed = CreateClientSchema.safeParse(raw);

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { codigo, nombre, cuit, telefono, direccion, emails, depositos } =
    parsed.data;

  const supabase = createClient();
  const admin = createAdminClient();

  // Check unique codigo
  const { data: existing } = await supabase
    .from("clients")
    .select("id")
    .eq("codigo", codigo)
    .maybeSingle();

  if (existing) {
    return { error: `Ya existe un cliente con el codigo "${codigo}"` };
  }

  // Check unique emails across all client_emails
  for (const entry of emails) {
    const { data: emailExists } = await supabase
      .from("client_emails")
      .select("id")
      .eq("email", entry.email)
      .maybeSingle();

    if (emailExists) {
      return { error: `El email "${entry.email}" ya esta en uso` };
    }
  }

  // 1. Insert client
  const { data: client, error: clientError } = await supabase
    .from("clients")
    .insert({ codigo, nombre, cuit: cuit || null, telefono: telefono || null, direccion: direccion || null })
    .select("id")
    .single();

  if (clientError) {
    return { error: `Error al crear cliente: ${clientError.message}` };
  }

  // 2. Insert client_emails
  const emailRows = emails.map((e) => ({
    client_id: client.id,
    email: e.email,
    es_principal: e.es_principal,
  }));

  const { error: emailsError } = await supabase
    .from("client_emails")
    .insert(emailRows);

  if (emailsError) {
    return { error: `Error al crear emails: ${emailsError.message}` };
  }

  // 3. Insert depositos
  if (depositos.length > 0) {
    const depositRows = depositos.map((d) => ({
      client_id: client.id,
      nombre: d.nombre,
      direccion: d.direccion || null,
      tipo: d.tipo,
      activo: d.activo,
    }));

    const { error: depError } = await supabase
      .from("client_deposits")
      .insert(depositRows);

    if (depError) {
      return { error: `Error al crear depositos: ${depError.message}` };
    }
  }

  // 4. Create auth users + user_profiles for each email
  const tempPassword = generateTempPassword();

  for (const entry of emails) {
    const { data: authUser, error: authError } =
      await admin.auth.admin.createUser({
        email: entry.email,
        password: tempPassword,
        email_confirm: true,
      });

    if (authError) {
      return {
        error: `Error al crear usuario para ${entry.email}: ${authError.message}`,
      };
    }

    const { error: profileError } = await admin
      .from("user_profiles")
      .insert({
        id: authUser.user.id,
        role: "CLIENTE",
        full_name: nombre,
        client_id: client.id,
        driver_id: null,
        operator_id: null,
      });

    if (profileError) {
      return {
        error: `Error al crear perfil para ${entry.email}: ${profileError.message}`,
      };
    }
  }

  revalidatePath("/operador/clientes");
  return { success: true };
}

/**
 * Actualiza un cliente existente, incluyendo emails y depositos.
 * Emails nuevos crean auth.users + user_profiles.
 * Emails removidos desactivan (ban) al usuario de auth.
 */
export async function updateClientAction(
  _prev: ClientActionState,
  formData: FormData,
): Promise<ClientActionState> {
  const raw = JSON.parse(formData.get("payload") as string);
  const parsed = UpdateClientSchema.safeParse(raw);

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { id, codigo, nombre, cuit, telefono, direccion, emails, depositos } =
    parsed.data;

  const supabase = createClient();
  const admin = createAdminClient();

  // Check unique codigo (excluding self)
  const { data: existing } = await supabase
    .from("clients")
    .select("id")
    .eq("codigo", codigo)
    .neq("id", id)
    .maybeSingle();

  if (existing) {
    return { error: `Ya existe un cliente con el codigo "${codigo}"` };
  }

  // Check unique emails (excluding own client_emails)
  for (const entry of emails) {
    const { data: emailExists } = await supabase
      .from("client_emails")
      .select("id, client_id")
      .eq("email", entry.email)
      .maybeSingle();

    if (emailExists && emailExists.client_id !== id) {
      return { error: `El email "${entry.email}" ya esta en uso por otro cliente` };
    }
  }

  // 1. Update client
  const { error: clientError } = await supabase
    .from("clients")
    .update({ codigo, nombre, cuit: cuit || null, telefono: telefono || null, direccion: direccion || null })
    .eq("id", id);

  if (clientError) {
    return { error: `Error al actualizar cliente: ${clientError.message}` };
  }

  // 2. Sync emails: determine added, removed, kept
  const { data: currentEmails } = await supabase
    .from("client_emails")
    .select("id, email, es_principal")
    .eq("client_id", id);

  const currentEmailSet = new Set((currentEmails ?? []).map((e) => e.email));
  const newEmailSet = new Set(emails.map((e) => e.email));

  const toAdd = emails.filter((e) => !currentEmailSet.has(e.email));
  const toRemove = (currentEmails ?? []).filter(
    (e) => !newEmailSet.has(e.email),
  );
  const toUpdate = emails.filter((e) => currentEmailSet.has(e.email));

  // Remove old emails + ban their auth users
  for (const old of toRemove) {
    await supabase.from("client_emails").delete().eq("id", old.id);

    // Find and ban the auth user
    const { data: profile } = await admin
      .from("user_profiles")
      .select("id")
      .eq("client_id", id)
      .maybeSingle();

    // Look up auth user by email to ban
    const { data: authUsers } = await admin.auth.admin.listUsers();
    const authUser = authUsers?.users.find((u) => u.email === old.email);
    if (authUser) {
      await admin.auth.admin.updateUserById(authUser.id, {
        ban_duration: "876600h",
      });
    }
  }

  // Update es_principal on existing emails
  for (const entry of toUpdate) {
    await supabase
      .from("client_emails")
      .update({ es_principal: entry.es_principal })
      .eq("client_id", id)
      .eq("email", entry.email);
  }

  // Add new emails + create auth users
  if (toAdd.length > 0) {
    const emailRows = toAdd.map((e) => ({
      client_id: id,
      email: e.email,
      es_principal: e.es_principal,
    }));

    const { error: emailsError } = await supabase
      .from("client_emails")
      .insert(emailRows);

    if (emailsError) {
      return { error: `Error al agregar emails: ${emailsError.message}` };
    }

    const tempPassword = generateTempPassword();

    for (const entry of toAdd) {
      const { data: authUser, error: authError } =
        await admin.auth.admin.createUser({
          email: entry.email,
          password: tempPassword,
          email_confirm: true,
        });

      if (authError) {
        return {
          error: `Error al crear usuario para ${entry.email}: ${authError.message}`,
        };
      }

      const { error: profileError } = await admin
        .from("user_profiles")
        .insert({
          id: authUser.user.id,
          role: "CLIENTE",
          full_name: nombre,
          client_id: id,
          driver_id: null,
          operator_id: null,
        });

      if (profileError) {
        return {
          error: `Error al crear perfil para ${entry.email}: ${profileError.message}`,
        };
      }
    }
  }

  // 3. Sync depositos: delete all + re-insert (simpler for small sets)
  await supabase.from("client_deposits").delete().eq("client_id", id);

  if (depositos.length > 0) {
    const depositRows = depositos.map((d) => ({
      client_id: id,
      nombre: d.nombre,
      direccion: d.direccion || null,
      tipo: d.tipo,
      activo: d.activo,
    }));

    const { error: depError } = await supabase
      .from("client_deposits")
      .insert(depositRows);

    if (depError) {
      return { error: `Error al actualizar depositos: ${depError.message}` };
    }
  }

  revalidatePath("/operador/clientes");
  return { success: true };
}

/**
 * Baja logica: toggle del campo activo.
 * Si se desactiva, banea a todos los usuarios auth del cliente.
 * Si se reactiva, desbanea.
 */
export async function toggleClientAction(
  clientId: string,
  activo: boolean,
): Promise<ClientActionState> {
  const supabase = createClient();
  const admin = createAdminClient();

  const { error } = await supabase
    .from("clients")
    .update({ activo })
    .eq("id", clientId);

  if (error) {
    return { error: `Error al actualizar estado: ${error.message}` };
  }

  // Ban/unban all auth users linked to this client
  const { data: profiles } = await admin
    .from("user_profiles")
    .select("id")
    .eq("client_id", clientId);

  if (profiles) {
    for (const profile of profiles) {
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
  }

  revalidatePath("/operador/clientes");
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
