import { getCurrentUser } from "@/lib/server/auth/get-current-user";
import { getClientNotificationPreferences } from "@/lib/server/notifications/client-preferences-queries";
import { ClientNotificationPreferences } from "@/components/operador/client-notification-preferences";

export const dynamic = "force-dynamic";
export const metadata = { title: "Configuración — ReySil" };

export default async function ClienteConfiguracionPage() {
  const user = await getCurrentUser();
  const clientId = user.profile.client_id!;
  const preferences = await getClientNotificationPreferences(clientId);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-neutral-900">Configuración</h2>
        <p className="text-sm text-neutral-500">
          Gestioná las preferencias de notificación de tu cuenta.
        </p>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-6">
        <ClientNotificationPreferences
          clientId={clientId}
          preferences={preferences}
        />
      </div>
    </div>
  );
}
