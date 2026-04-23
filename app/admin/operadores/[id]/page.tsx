import { notFound } from "next/navigation";
import { getOperatorById } from "@/lib/server/operators/queries";
import { OperatorForm, ResetPasswordForm } from "@/components/admin/operator-form";

export const metadata = { title: "Editar Operador — Admin ReySil" };

export default async function EditOperadorPage({ params }: { params: { id: string } }) {
  let operator;
  try {
    operator = await getOperatorById(params.id);
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h2 className="text-lg font-semibold text-neutral-900">
        Editar operador: {operator.full_name}
      </h2>
      <OperatorForm operator={operator} />
      <ResetPasswordForm operator={operator} />
    </div>
  );
}
