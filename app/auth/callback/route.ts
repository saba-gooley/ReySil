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

  if (!code) {
    console.log("[auth/callback] No code found, redirecting to login");
    return NextResponse.redirect(`${origin}/login`);
  }

  const supabase = createClient();
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
