import { OperatorForm } from "@/components/admin/operator-form";

export const metadata = { title: "Nuevo Operador — Admin ReySil" };

export default function NuevoOperadorPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h2 className="text-lg font-semibold text-neutral-900">Nuevo Operador</h2>
      <OperatorForm />
    </div>
  );
}
