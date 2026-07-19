import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Verificacion de OTP por `token_hash` (flujo SSR recomendado por Supabase).
 *
 * Los emails de recovery/invite usan `{{ .TokenHash }}` en la plantilla y
 * apuntan a esta ruta. `verifyOtp` valida el token del lado del SERVIDOR y
 * crea la sesion en cookies httpOnly — por eso funciona en CUALQUIER
 * dispositivo, a diferencia del flujo PKCE (`?code=`) que necesita un code
 * verifier guardado en el navegador que originalmente pidio el link.
 *
 * Esto es lo que hace que el mail de "establecer contrasena" del alta (que
 * abre el cliente en otro dispositivo) funcione, ademas de blindar el flujo
 * normal de "recuperar contrasena".
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  if (token_hash && type) {
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });

    if (!error) {
      // recovery -> a fijar la nueva contrasena; el resto -> login
      const dest = type === "recovery" ? "/restablecer-contrasena" : "/login";
      return NextResponse.redirect(`${origin}${dest}`);
    }

    console.error("[auth/confirm] verifyOtp error:", error.message);
  }

  // Token ausente, invalido o expirado: a recuperar con aviso
  return NextResponse.redirect(
    `${origin}/recuperar-contrasena?error=link_invalido`,
  );
}
