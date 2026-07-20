import { createServerClient } from "@supabase/ssr";

/**
 * Dispara el email de "establecer contrasena" al dar de alta un cliente y al
 * agregar un nuevo email de acceso a un cliente existente.
 *
 * Usa `resetPasswordForEmail` para que **Supabase** envie el email por su
 * propio SMTP (que entrega de forma confiable), en lugar de generar el link
 * a mano y mandarlo por el SMTP de la app (Ferozo lo filtraba como spam por
 * los links a *.vercel.app). El link del email usa `token_hash` y lo procesa
 * `/auth/confirm` del lado del servidor, asi funciona en cualquier dispositivo.
 *
 * Es un email de acceso/credenciales: se envia SIEMPRE, independiente de las
 * preferencias de notificacion del cliente.
 *
 * Nunca lanza excepcion — falla en silencio (log) para no bloquear el alta.
 * Fallback del usuario: la opcion "Olvidaste tu contrasena" en /login.
 */
export async function notifySetPassword(
  email: string,
  _clientName: string,
): Promise<void> {
  try {
    const origin = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");

    if (!origin) {
      console.warn(
        "[notify-set-password] NEXT_PUBLIC_APP_URL no configurado — skipping email",
      );
      return;
    }

    // Cliente anon sin cookies: solo dispara el email de recovery de Supabase.
    // No toca la sesion del operador que esta dando el alta.
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => [],
          setAll: () => {},
        },
      },
    );

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/restablecer-contrasena`,
    });

    if (error) {
      console.error(
        "[notify-set-password] resetPasswordForEmail error:",
        error.message,
      );
    }
  } catch (err) {
    console.error("[notify-set-password] Unexpected error:", err);
  }
}
