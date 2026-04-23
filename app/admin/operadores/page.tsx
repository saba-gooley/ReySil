import Link from "next/link";
import { listOperators } from "@/lib/server/operators/queries";
import { OperatorList } from "@/components/admin/operator-list";

export const dynamic = "force-dynamic";
export const metadata = { title: "Operadores — Admin ReySil" };

export default async function OperadoresPage() {
  const operators = await listOperators();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">Operadores</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Gestión de accesos del equipo operador de ReySil
          </p>
        </div>
        <Link
          href="/admin/operadores/nuevo"
          className="rounded-md bg-reysil-red px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-reysil-red-dark"
        >
          + Nuevo Operador
        </Link>
      </div>

      <OperatorList operators={operators} />
    </div>
  );
}
