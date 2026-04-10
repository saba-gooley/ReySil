import { listClients } from "@/lib/server/clients/queries";
import { ClientTable } from "@/components/operador/client-table";

export const metadata = { title: "Clientes — ReySil" };

export default async function ClientesPage() {
  const clients = await listClients();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-neutral-900">Clientes</h2>
      <ClientTable clients={clients} />
    </div>
  );
}
