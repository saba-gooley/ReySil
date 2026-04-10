import { DriverForm } from "@/components/operador/driver-form";

export const metadata = { title: "Nuevo Chofer — ReySil" };

export default function NuevoChoferPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h2 className="text-lg font-semibold text-neutral-900">Nuevo chofer</h2>
      <DriverForm />
    </div>
  );
}
