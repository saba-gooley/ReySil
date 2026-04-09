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
  const rawNext = searchParams.get("next");
  const next =
    rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//")
      ? rawNext
      : "/";

  if (!code) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const supabase = createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
