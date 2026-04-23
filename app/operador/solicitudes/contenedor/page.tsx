import { listClients } from "@/lib/server/clients/queries";
import { OperatorContenedorForm } from "@/components/operador/operator-contenedor-form";

export const metadata = { title: "Nueva Solicitud de Contenedor — ReySil" };

export default async function OperatorContenedorPage() {
  const allClients = await listClients();
  const clients = allClients
    .filter((c) => c.activo)
    .map((c) => ({ id: c.id, nombre: c.nombre }));

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h2 className="text-lg font-semibold text-neutral-900">
        Nueva Solicitud de Contenedor
      </h2>
      <OperatorContenedorForm clients={clients} />
    </div>
  );
}
