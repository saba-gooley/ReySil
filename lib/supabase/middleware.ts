import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options: CookieOptions };

// Rutas publicas: accesibles sin sesion. Todo lo demas requiere login.
const PUBLIC_PATHS = [
  "/login",
  "/recuperar-contrasena",
  "/auth/callback",
];

// Rutas que son accesibles SIEMPRE (con o sin sesion). Usado para
// /restablecer-contrasena: el usuario llega con una sesion temporal
// creada por el callback de Supabase y debe poder usarla para fijar
// la nueva password sin que el middleware lo redirija a su home.
const NEUTRAL_PATHS = ["/restablecer-contrasena"];

// Prefijos protegidos por rol. Si un usuario autenticado intenta acceder a un
// prefijo que no le corresponde, lo redirigimos a su home.
const ROLE_PREFIX: Record<string, string> = {
  CLIENTE: "/cliente",
  OPERADOR: "/operador",
  CHOFER: "/chofer",
  ADMIN: "/admin",
};

// Prefijos adicionales a los que un rol puede acceder además de su propio home.
// ADMIN tiene acceso total al panel de operadores ademas de /admin.
const EXTRA_ALLOWED: Record<string, string[]> = {
  ADMIN: ["/operador"],
};

function homePathForRole(role: string | null): string {
  if (!role) return "/login";
  return ROLE_PREFIX[role] ?? "/login";
}

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

function isNeutralPath(pathname: string): boolean {
  return NEUTRAL_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

/**
 * Middleware Edge: refresca la sesion de Supabase y enforce RBAC por ruta.
 *
 * Reglas:
 *   - Rutas publicas (login, recuperar-contrasena, etc): si hay sesion,
 *     redirige al home del rol. Si no, deja pasar.
 *   - Rutas protegidas: si no hay sesion, redirige a /login. Si hay sesion
 *     pero el rol no matchea el prefijo, redirige al home del rol.
 *   - Raiz `/`: redirige al home del rol si hay sesion, a /login si no.
 *
 * IMPORTANTE: getUser() debe llamarse para refrescar tokens, no quitar.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublic = isPublicPath(pathname);
  const isNeutral = isNeutralPath(pathname);

  // Caso 1: Sin sesion
  if (!user) {
    if (isPublic || isNeutral) {
      return supabaseResponse;
    }
    // Ruta protegida sin sesion -> a login
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Caso 2: Con sesion - leemos el rol del perfil
  // Nota: esto agrega un select por request. Para optimizar despues podemos
  // cachear el rol en una cookie httpOnly al momento del login.
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = (profile?.role as string | undefined) ?? null;

  // Sesion valida pero sin perfil: cerramos sesion y mandamos a login
  if (!role) {
    await supabase.auth.signOut();
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  const home = homePathForRole(role);

  // Caso 2a: Rutas neutrales (ej: restablecer-contrasena) - dejar pasar
  // aunque haya sesion. La logica de la pagina/server action maneja la
  // validez de la sesion temporal de recovery.
  if (isNeutral) {
    return supabaseResponse;
  }

  // Caso 2b: Esta en una ruta publica con sesion -> a su home
  if (isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = home;
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Caso 2b: Esta en raiz "/" -> a su home
  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = home;
    return NextResponse.redirect(url);
  }

  // Caso 2c: Esta en un prefijo protegido que no le corresponde -> a su home
  // Solo enforce los 4 prefijos conocidos. Otras rutas (api/, etc) pasan
  // y el codigo del lado server las protege con getCurrentUser().
  for (const [r, prefix] of Object.entries(ROLE_PREFIX)) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      if (r !== role) {
        const extras = EXTRA_ALLOWED[role] ?? [];
        if (!extras.includes(prefix)) {
          const url = request.nextUrl.clone();
          url.pathname = home;
          return NextResponse.redirect(url);
        }
      }
      break;
    }
  }

  return supabaseResponse;
}
