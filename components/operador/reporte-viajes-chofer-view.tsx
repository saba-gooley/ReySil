"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ByDriverRow = {
  nombre: string;
  codigo: string;
  asignados: number;
  enCurso: number;
  finalizados: number;
  total: number;
};

export function ReporteViajesChoferView({
  rows,
  total,
  from,
  to,
}: {
  rows: ByDriverRow[];
  total: number;
  from: string;
  to: string;
}) {
  const router = useRouter();
  const [fromDate, setFromDate] = useState(from);
  const [toDate, setToDate] = useState(to);
  const [selectedCodigo, setSelectedCodigo] = useState("");

  const filtered = selectedCodigo
    ? rows.filter((r) => r.codigo === selectedCodigo)
    : rows;

  const inputClass =
    "rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-reysil-red focus:outline-none focus:ring-1 focus:ring-reysil-red";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs text-neutral-500">Desde</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-neutral-500">Hasta</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-neutral-500">Chofer</label>
          <select
            value={selectedCodigo}
            onChange={(e) => setSelectedCodigo(e.target.value)}
            className={inputClass}
          >
            <option value="">Todos</option>
            {rows.map((r) => (
              <option key={r.codigo} value={r.codigo}>
                {r.nombre} ({r.codigo})
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() =>
            router.push(
              `/operador/reportes/viajes-chofer?from=${fromDate}&to=${toDate}`,
            )
          }
          className="rounded-md bg-reysil-red px-4 py-2 text-sm font-medium text-white hover:bg-reysil-red-dark"
        >
          Consultar
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
        >
          Imprimir
        </button>
      </div>

      <p className="text-sm text-neutral-500">
        Total de viajes en el periodo: <strong>{total}</strong>
      </p>

      <div className="rounded-lg border border-neutral-200 bg-white">
        {rows.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-neutral-400">
            Sin datos
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-2 text-left">Chofer</th>
                <th className="px-4 py-2 text-left">Codigo</th>
                <th className="px-4 py-2 text-right">Asignado</th>
                <th className="px-4 py-2 text-right">En curso</th>
                <th className="px-4 py-2 text-right">Finalizado</th>
                <th className="px-4 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map((row) => (
                <tr key={row.codigo}>
                  <td className="px-4 py-2">{row.nombre}</td>
                  <td className="px-4 py-2 text-neutral-500">{row.codigo}</td>
                  <td className="px-4 py-2 text-right font-medium">
                    {row.asignados}
                  </td>
                  <td className="px-4 py-2 text-right font-medium">
                    {row.enCurso}
                  </td>
                  <td className="px-4 py-2 text-right font-medium">
                    {row.finalizados}
                  </td>
                  <td className="px-4 py-2 text-right font-semibold">
                    {row.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
