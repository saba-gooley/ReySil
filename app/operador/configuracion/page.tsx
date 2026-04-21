import { ReysilNotificationEmails } from "@/components/operador/reysil-notification-emails";
import { getAllReysilNotificationEmails } from "@/lib/server/notifications/client-preferences-queries";

export const dynamic = "force-dynamic";

export default async function ConfiguracionPage() {
  const reysilEmails = await getAllReysilNotificationEmails();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Configuración</h1>
        <p className="text-sm text-neutral-500 mt-2">
          Administra notificaciones y preferencias internas de ReySil
        </p>
      </div>

      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <ReysilNotificationEmails emails={reysilEmails} />
      </div>
    </div>
  );
}
