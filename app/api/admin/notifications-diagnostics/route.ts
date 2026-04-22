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

  return Response.json({
    sendGridConfigured,
    sendGridApiKeyLength: process.env.SENDGRID_API_KEY?.length ?? 0,
    sendGridFromEmail: process.env.SENDGRID_FROM_EMAIL || "notificaciones@reysil.com",
    clientNotificationPreferencesCount: clientPrefs?.length ?? 0,
    clientNotificationPreferences: clientPrefs,
    clientNotificationPreferencesError: clientPrefsError?.message,
    reysilNotificationEmailsCount: reysilEmails?.length ?? 0,
    reysilNotificationEmails: reysilEmails,
    reysilNotificationEmailsError: reysilEmailsError?.message,
    diagnostic: {
      sendgrid: sendGridConfigured ? "✓ Configured" : "✗ Not configured",
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
