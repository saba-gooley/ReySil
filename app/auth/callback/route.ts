import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Callback de Supabase Auth.
 *
 * Lo invocan los emails de recuperacion de contrasena (y a futuro magic
 * links si se habilitan). Recibe `?code=...` y opcionalmente `?next=...`.
 *
 * Hace exchange del code por una sesion (cookies httpOnly) y redirige a
 * `next` si es seguro, o a /login si algo falla.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type"); // "recovery", "signup", etc

  console.log(`[auth/callback] code present: ${!!code}, type: ${type}`);

  const supabase = createClient();

  // Si no hay code, verificar si hay una sesión (puede ser del flujo de Supabase /auth/v1/verify)
  if (!code) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // Hay sesión pero no hay code — viene del flujo de /auth/v1/verify de Supabase
      console.log(
        "[auth/callback] No code but valid session (from Supabase verify)"
      );

      if (type === "recovery") {
        console.log(
          "[auth/callback] Recovery flow detected, redirecting to restablecer-contrasena"
        );
        return NextResponse.redirect(`${origin}/restablecer-contrasena`);
      }

      // Si hay sesión pero no es recovery, redirige al login
      console.log(
        "[auth/callback] Session without code and not recovery, redirecting to login"
      );
      return NextResponse.redirect(`${origin}/login`);
    }

    // Sin sesión y sin code → a login
    console.log("[auth/callback] No code and no session found, redirecting to login");
    return NextResponse.redirect(`${origin}/login`);
  }

  // Tiene code — intercambiar por sesión
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback] Exchange failed:", {
      message: error.message,
      status: error.status,
      code: (error as any).code,
    });
    // Para recovery, redirigir a recuperar-contrasena con error
    if (type === "recovery") {
      return NextResponse.redirect(`${origin}/recuperar-contrasena`);
    }
    return NextResponse.redirect(`${origin}/login`);
  }

  // Si fue recovery, ir a restablecer-contrasena
  if (type === "recovery") {
    return NextResponse.redirect(`${origin}/restablecer-contrasena`);
  }

  // Default redirect
  return NextResponse.redirect(`${origin}/login`);
}
