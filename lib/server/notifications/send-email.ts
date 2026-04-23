import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST ?? "smtp.gmail.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT ?? "587", 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_EMAIL = process.env.SMTP_FROM_EMAIL ?? SMTP_USER ?? "";
const FROM_NAME = process.env.SMTP_FROM_NAME ?? "Transportes ReySil";

type SendEmailParams = {
  to: string[];
  subject: string;
  html: string;
};

/**
 * Send an email via Google SMTP (nodemailer).
 * Fails silently (logs error) so the main business operation is never blocked.
 */
export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<boolean> {
  if (!SMTP_USER || !SMTP_PASS) {
    console.warn("[notifications] SMTP_USER or SMTP_PASS not set — skipping email");
    return false;
  }

  if (to.length === 0) {
    console.warn("[notifications] No recipients — skipping email");
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: to.join(", "),
      subject,
      html,
    });

    console.log(`[notifications] Email sent to ${to.length} recipient(s): ${subject}`);
    return true;
  } catch (err) {
    console.error("[notifications] SMTP error:", err);
    return false;
  }
}
