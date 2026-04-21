import { notFound } from "next/navigation";
import { getClientById } from "@/lib/server/clients/queries";
import { getClientNotificationPreferences } from "@/lib/server/notifications/client-preferences-queries";
import { ClientForm } from "@/components/operador/client-form";
import { ClientNotificationPreferences } from "@/components/operador/client-notification-preferences";

export const metadata = { title: "Editar Cliente — ReySil" };

export default async function EditClientePage({
  params,
}: {
  params: { id: string };
}) {
  let client;
  try {
    client = await getClientById(params.id);
  } catch {
    notFound();
  }

  const preferences = await getClientNotificationPreferences(client.id);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h2 className="text-lg font-semibold text-neutral-900">
        Editar cliente: {client.nombre}
      </h2>

      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <ClientForm client={client} />
      </div>

      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <ClientNotificationPreferences
          clientId={client.id}
          preferences={preferences}
        />
      </div>
    </div>
  );
}
