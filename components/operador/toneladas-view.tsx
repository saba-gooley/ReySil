"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ToneladaRow = {
  patente: string;
  chofer: string;
  totalToneladas: number;
  totalKg: number;
  viajes: number;
};

export function ToneladasView({
  data,
  fecha,
}: {
  data: ToneladaRow[];
  fecha: string;
}) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(fecha);

  function applyDate() {
    router.push(`/operador/toneladas?fecha=${selectedDate}`);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3">
        <div>
          <label className="mb-1 block text-xs text-neutral-500">Fecha</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-reysil-red focus:outline-none focus:ring-1 focus:ring-reysil-red"
          />
        </div>
        <button
          type="button"
          onClick={applyDate}
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

      {data.length === 0 ? (
        <p className="py-8 text-center text-sm text-neutral-400">
          No hay viajes con camion asignado para esta fecha.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-3">Patente</th>
                <th className="px-4 py-3">Chofer</th>
                <th className="px-4 py-3 text-right">Viajes</th>
                <th className="px-4 py-3 text-right">Total Toneladas</th>
                <th className="px-4 py-3 text-right">Total KG netos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {data.map((row) => (
                <tr key={row.patente}>
                  <td className="px-4 py-3 font-mono font-medium">
                    {row.patente}
                  </td>
                  <td className="px-4 py-3">{row.chofer}</td>
                  <td className="px-4 py-3 text-right">{row.viajes}</td>
                  <td className="px-4 py-3 text-right font-medium">
                    {row.totalToneladas.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {row.totalKg.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-neutral-300 bg-neutral-50 font-medium">
              <tr>
                <td className="px-4 py-3" colSpan={2}>
                  TOTAL
                </td>
                <td className="px-4 py-3 text-right">
                  {data.reduce((s, r) => s + r.viajes, 0)}
                </td>
                <td className="px-4 py-3 text-right">
                  {data
                    .reduce((s, r) => s + r.totalToneladas, 0)
                    .toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right">
                  {data.reduce((s, r) => s + r.totalKg, 0).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
