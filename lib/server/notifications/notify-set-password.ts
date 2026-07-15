import { createAdminClient } from "@/lib/supabase/server";
import { sendEmail } from "./send-email";
import {
  setPasswordSubject,
  setPasswordHtml,
  type SetPasswordEmailData,
} from "./templates";

/**
 * Envía al cliente un email con el link para establecer su contraseña.
 *
 * Se dispara al dar de alta un cliente y al agregar un nuevo email de acceso
 * a un cliente existente. Genera un link de tipo "recovery" con Service Role
 * (`generateLink`) y lo envía por el SMTP propio (nodemailer) para mantener el
 * branding, en lugar del email nativo de Supabase.
 *
 * Es un email de acceso/credenciales: se envía SIEMPRE, independiente de las
 * preferencias de notificación del cliente.
 *
 * Nunca lanza excepción — falla en silencio (log) para no bloquear el alta.
 * Fallback del usuario: la opción "¿Olvidaste tu contraseña?" en /login.
 */
export async function notifySetPassword(
  email: string,
  clientName: string,
): Promise<void> {
  try {
    const origin = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");

    if (!origin) {
      console.warn(
        "[notify-set-password] NEXT_PUBLIC_APP_URL no configurado — skipping email",
      );
      return;
    }

    const redirectTo = `${origin}/auth/callback?type=recovery`;

    const admin = createAdminClient();

    const { data, error } = await admin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: { redirectTo },
    });

    if (error || !data?.properties?.action_link) {
      console.error(
        "[notify-set-password] generateLink error:",
        error?.message,
      );
      return;
    }

    const payload: SetPasswordEmailData = {
      clientName,
      email,
      actionLink: data.properties.action_link,
    };

    await sendEmail({
      to: [email],
      subject: setPasswordSubject(payload),
      html: setPasswordHtml(payload),
    });
  } catch (err) {
    console.error("[notify-set-password] Unexpected error:", err);
  }
}
