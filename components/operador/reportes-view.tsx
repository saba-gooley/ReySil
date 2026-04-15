"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ReportData = {
  byClient: {
    nombre: string;
    codigo: string;
    preasignados: number;
    asignados: number;
    enCurso: number;
    finalizados: number;
    total: number;
  }[];
  byDriver: {
    nombre: string;
    codigo: string;
    asignados: number;
    enCurso: number;
    finalizados: number;
    total: number;
  }[];
  total: number;
};

export function ReportesView({
  report,
  from,
  to,
}: {
  report: ReportData;
  from: string;
  to: string;
}) {
  const router = useRouter();
  const [fromDate, setFromDate] = useState(from);
  const [toDate, setToDate] = useState(to);

  function applyFilters() {
    router.push(`/operador/reportes?from=${fromDate}&to=${toDate}`);
    router.refresh();
  }

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
        <button
          type="button"
          onClick={applyFilters}
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
        Total de viajes en el periodo: <strong>{report.total}</strong>
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* By Client */}
        <div className="rounded-lg border border-neutral-200 bg-white">
          <h3 className="border-b border-neutral-200 px-4 py-3 text-sm font-semibold text-neutral-700">
            Viajes por Cliente
          </h3>
          {report.byClient.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-neutral-400">
              Sin datos
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 text-xs uppercase text-neutral-500">
                <tr>
                  <th className="px-4 py-2 text-left">Cliente</th>
                  <th className="px-4 py-2 text-left">Codigo</th>
                  <th className="px-4 py-2 text-right">Preasig.</th>
                  <th className="px-4 py-2 text-right">Asignado</th>
                  <th className="px-4 py-2 text-right">En curso</th>
                  <th className="px-4 py-2 text-right">Finalizado</th>
                  <th className="px-4 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {report.byClient.map((row) => (
                  <tr key={row.codigo}>
                    <td className="px-4 py-2">{row.nombre}</td>
                    <td className="px-4 py-2 text-neutral-500">
                      {row.codigo}
                    </td>
                    <td className="px-4 py-2 text-right font-medium">
                      {row.preasignados}
                    </td>
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

        {/* By Driver */}
        <div className="rounded-lg border border-neutral-200 bg-white">
          <h3 className="border-b border-neutral-200 px-4 py-3 text-sm font-semibold text-neutral-700">
            Viajes por Chofer
          </h3>
          {report.byDriver.length === 0 ? (
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
                {report.byDriver.map((row) => (
                  <tr key={row.codigo}>
                    <td className="px-4 py-2">{row.nombre}</td>
                    <td className="px-4 py-2 text-neutral-500">
                      {row.codigo}
                    </td>
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
    </div>
  );
}
