import { ClientForm } from "@/components/operador/client-form";

export const metadata = { title: "Nuevo Cliente — ReySil" };

export default function NuevoClientePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h2 className="text-lg font-semibold text-neutral-900">Nuevo cliente</h2>
      <ClientForm />
    </div>
  );
}
