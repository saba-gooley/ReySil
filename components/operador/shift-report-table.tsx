"use client";

import { useState } from "react";
import type { ShiftReportRow } from "@/lib/server/reports/shift-queries";
import { ShiftDetailDialog } from "./shift-detail-dialog";

const TZ = "America/Argentina/Buenos_Aires";

export function formatTimeAR(ts: string | null): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleTimeString("es-AR", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateAR(fecha: string): string {
  const [y, m, d] = fecha.split("-");
  return `${d}/${m}/${y}`;
}

type Props = {
  rows: ShiftReportRow[];
};

export function ShiftReportTable({ rows }: Props) {
  const [selected, setSelected] = useState<ShiftReportRow | null>(null);

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500">
        No se encontraron registros con los filtros aplicados.
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="min-w-full divide-y divide-neutral-200 text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Chofer
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Nombre
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Fecha
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Llegada Depósito
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Salida Depósito
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Vuelta Depósito
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Fin Turno
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Paradas
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => setSelected(row)}
                className="cursor-pointer transition-colors hover:bg-neutral-50"
              >
                <td className="px-4 py-3 font-medium text-neutral-900">
                  {row.codigo}
                </td>
                <td className="px-4 py-3 text-neutral-700">
                  {row.apellido}, {row.nombre}
                </td>
                <td className="px-4 py-3 text-neutral-700">
                  {formatDateAR(row.fecha)}
                </td>
                <td className="px-4 py-3 text-neutral-700">
                  {formatTimeAR(row.llegada_deposito)}
                </td>
                <td className="px-4 py-3 text-neutral-700">
                  {formatTimeAR(row.salida_deposito)}
                </td>
                <td className="px-4 py-3 text-neutral-700">
                  {formatTimeAR(row.vuelta_deposito)}
                </td>
                <td className="px-4 py-3 text-neutral-700">
                  {formatTimeAR(row.fin_turno)}
                </td>
                <td className="px-4 py-3 text-neutral-700">
                  {row.paradas_count > 0 ? row.paradas_count : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <ShiftDetailDialog
          row={selected}
          onClose={() => setSelected(null)}
          onUpdated={(updated) => setSelected(updated)}
        />
      )}
    </>
  );
}
