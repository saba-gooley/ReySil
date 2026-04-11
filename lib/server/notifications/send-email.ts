import sgMail from "@sendgrid/mail";

const apiKey = process.env.SENDGRID_API_KEY;
if (apiKey) {
  sgMail.setApiKey(apiKey);
}

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL ?? "notificaciones@reysil.com";
const FROM_NAME = process.env.SENDGRID_FROM_NAME ?? "Transportes ReySil";

type SendEmailParams = {
  to: string[];
  subject: string;
  html: string;
};

/**
 * Send an email via SendGrid. Fails silently (logs error) so that
 * the main business operation is never blocked by email failures.
 */
export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<boolean> {
  if (!apiKey) {
    console.warn("[notifications] SENDGRID_API_KEY not set — skipping email");
    return false;
  }

  if (to.length === 0) {
    console.warn("[notifications] No recipients — skipping email");
    return false;
  }

  try {
    await sgMail.sendMultiple({
      to,
      from: { email: FROM_EMAIL, name: FROM_NAME },
      subject,
      html,
    });
    console.log(`[notifications] Email sent to ${to.length} recipients: ${subject}`);
    return true;
  } catch (err) {
    console.error("[notifications] SendGrid error:", err);
    return false;
  }
}
