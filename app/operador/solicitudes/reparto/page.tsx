import { listClients } from "@/lib/server/clients/queries";
import { OperatorRepartoForm } from "@/components/operador/operator-reparto-form";

export const metadata = { title: "Nueva Solicitud de Reparto — ReySil" };

export default async function OperatorRepartoPage() {
  const allClients = await listClients();
  const clients = allClients
    .filter((c) => c.activo)
    .map((c) => ({ id: c.id, nombre: c.nombre }));

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h2 className="text-lg font-semibold text-neutral-900">
        Nueva Solicitud de Reparto
      </h2>
      <OperatorRepartoForm clients={clients} />
    </div>
  );
}
