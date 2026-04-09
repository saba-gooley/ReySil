import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type UserRole = "CLIENTE" | "OPERADOR" | "CHOFER" | "ADMIN";

export type CurrentUser = {
  id: string;
  email: string;
  profile: {
    role: UserRole;
    full_name: string | null;
    client_id: string | null;
    driver_id: string | null;
    operator_id: string | null;
  };
};

/**
 * Devuelve el usuario autenticado y su perfil. Si no hay sesion o falta el
 * perfil, redirige a /login.
 *
 * Uso desde Server Components y Server Actions de rutas protegidas.
 *
 * IMPORTANTE: usa supabase.auth.getUser() (verifica el token contra el
 * server de Supabase). NO usar getSession() que solo lee la cookie.
 */
export async function getCurrentUser(): Promise<CurrentUser> {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("role, full_name, client_id, driver_id, operator_id")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    // Usuario autenticado pero sin perfil - cerrar sesion y mandar a login.
    await supabase.auth.signOut();
    redirect("/login");
  }

  return {
    id: user.id,
    email: user.email ?? "",
    profile: profile as CurrentUser["profile"],
  };
}

/**
 * Variante que NO redirige. Devuelve null si no hay sesion o falta perfil.
 * Para usar en lugares donde la ausencia de usuario es valida (ej: layouts
 * publicos que muestran un boton de login si no hay sesion).
 */
export async function tryGetCurrentUser(): Promise<CurrentUser | null> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role, full_name, client_id, driver_id, operator_id")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  return {
    id: user.id,
    email: user.email ?? "",
    profile: profile as CurrentUser["profile"],
  };
}

/**
 * Mapea un rol al path home correspondiente. Usado por el middleware y los
 * helpers de redireccion post-login.
 */
export function homePathForRole(role: UserRole): string {
  switch (role) {
    case "CLIENTE":
      return "/cliente";
    case "OPERADOR":
      return "/operador";
    case "CHOFER":
      return "/chofer";
    case "ADMIN":
      return "/admin";
  }
}

/**
 * Verifica que el usuario actual tenga uno de los roles permitidos.
 * Si no, redirige a su home (no a /login - el usuario esta autenticado,
 * solo no tiene permisos para esta ruta).
 */
export async function requireRole(
  ...allowed: UserRole[]
): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!allowed.includes(user.profile.role)) {
    redirect(homePathForRole(user.profile.role));
  }
  return user;
}
