import { notFound } from "next/navigation";
import { getClientById } from "@/lib/server/clients/queries";
import { ClientForm } from "@/components/operador/client-form";

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

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h2 className="text-lg font-semibold text-neutral-900">
        Editar cliente: {client.nombre}
      </h2>
      <ClientForm client={client} />
    </div>
  );
}
