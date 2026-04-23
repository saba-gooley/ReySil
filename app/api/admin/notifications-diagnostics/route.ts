import { createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createAdminClient();

  // Get client notification preferences
  const { data: clientPrefs, error: clientPrefsError } = await supabase
    .from("client_notification_preferences")
    .select("*")
    .order("email");

  // Get ReySil notification emails
  const { data: reysilEmails, error: reysilEmailsError } = await supabase
    .from("reysil_notification_emails")
    .select("*")
    .order("email");

  // Check if SENDGRID_API_KEY is set
  const sendGridConfigured = !!process.env.SENDGRID_API_KEY;

  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST ?? "smtp.gmail.com";
  const smtpPort = process.env.SMTP_PORT ?? "587";
  const smtpFromEmail = process.env.SMTP_FROM_EMAIL ?? smtpUser ?? "(not set)";
  const smtpFromName = process.env.SMTP_FROM_NAME ?? "Transportes ReySil";
  const smtpConfigured = !!smtpUser && !!smtpPass;

  return Response.json({
    smtp: {
      configured: smtpConfigured,
      host: smtpHost,
      port: smtpPort,
      user: smtpUser ? `${smtpUser.slice(0, 4)}...` : "(not set)",
      passSet: !!smtpPass,
      fromEmail: smtpFromEmail,
      fromName: smtpFromName,
    },
    sendGridConfigured,
    clientNotificationPreferencesCount: clientPrefs?.length ?? 0,
    clientNotificationPreferences: clientPrefs,
    clientNotificationPreferencesError: clientPrefsError?.message,
    reysilNotificationEmailsCount: reysilEmails?.length ?? 0,
    reysilNotificationEmails: reysilEmails,
    reysilNotificationEmailsError: reysilEmailsError?.message,
    diagnostic: {
      smtp: smtpConfigured
        ? `✓ SMTP configured (${smtpHost}:${smtpPort}, user: ${smtpUser?.slice(0, 4)}...)`
        : `✗ SMTP not configured — SMTP_USER=${smtpUser ? "set" : "MISSING"}, SMTP_PASS=${smtpPass ? "set" : "MISSING"}`,
      clientPrefs:
        (clientPrefs?.length ?? 0) > 0
          ? `✓ ${clientPrefs?.length} preferences set`
          : "✗ No client notification preferences configured",
      reysilEmails:
        (reysilEmails?.length ?? 0) > 0
          ? `✓ ${reysilEmails?.length} internal emails configured`
          : "✗ No ReySil internal emails configured",
    },
  });
}
