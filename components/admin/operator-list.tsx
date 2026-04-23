"use client";

import { useFormState } from "react-dom";
import Link from "next/link";
import { OperatorRow } from "@/lib/server/operators/queries";
import {
  deactivateOperatorAction,
  reactivateOperatorAction,
  type OperatorActionState,
} from "@/lib/server/operators/actions";

const initial: OperatorActionState = {};

function DeactivateButton({ id }: { id: string }) {
  const [, action] = useFormState(deactivateOperatorAction, initial);
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="text-xs text-red-600 hover:underline">
        Desactivar
      </button>
    </form>
  );
}

function ReactivateButton({ id }: { id: string }) {
  const [, action] = useFormState(reactivateOperatorAction, initial);
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="text-xs text-green-600 hover:underline">
        Reactivar
      </button>
    </form>
  );
}

export function OperatorList({ operators }: { operators: OperatorRow[] }) {
  const active = operators.filter((o) => !o.banned);
  const inactive = operators.filter((o) => o.banned);

  const tableHead = (
    <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase text-neutral-500">
      <tr>
        <th className="px-4 py-3 text-left">Nombre</th>
        <th className="px-4 py-3 text-left">Email</th>
        <th className="px-4 py-3 text-left">Estado</th>
        <th className="px-4 py-3 text-right">Acciones</th>
      </tr>
    </thead>
  );

  return (
    <div className="space-y-8">
      {/* Activos */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-neutral-800">
          Operadores Activos ({active.length})
        </h3>
        {active.length === 0 ? (
          <p className="rounded-lg border border-dashed p-8 text-center text-sm text-neutral-400">
            No hay operadores activos
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-neutral-200">
            <table className="w-full text-sm">
              {tableHead}
              <tbody className="divide-y divide-neutral-100">
                {active.map((op) => (
                  <tr key={op.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 font-medium">{op.full_name ?? "—"}</td>
                    <td className="px-4 py-3 text-neutral-600">{op.email}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                        Activo
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/admin/operadores/${op.id}`}
                          className="text-xs text-neutral-600 hover:underline"
                        >
                          Editar
                        </Link>
                        <DeactivateButton id={op.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inactivos */}
      {inactive.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-neutral-500">
            Operadores Inactivos ({inactive.length})
          </h3>
          <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-neutral-50">
            <table className="w-full text-sm">
              {tableHead}
              <tbody className="divide-y divide-neutral-100">
                {inactive.map((op) => (
                  <tr key={op.id} className="bg-neutral-50">
                    <td className="px-4 py-3 font-medium text-neutral-400">{op.full_name ?? "—"}</td>
                    <td className="px-4 py-3 text-neutral-400">{op.email}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-xs font-medium text-neutral-600">
                        Inactivo
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ReactivateButton id={op.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
