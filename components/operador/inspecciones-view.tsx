"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type InspectionRow = {
  id: string;
  patente: string;
  fecha: string;
  pdf_url: string | null;
  file_name: string;
  driver: {
    nombre: string;
    apellido: string;
    codigo: string;
  };
};

export function InspeccionesView({
  inspections,
  total,
  page,
  from,
  to,
}: {
  inspections: InspectionRow[];
  total: number;
  page: number;
  from?: string;
  to?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [fromDate, setFromDate] = useState(from ?? "");
  const [toDate, setToDate] = useState(to ?? "");

  const pageSize = 20;
  const totalPages = Math.ceil(total / pageSize);

  function applyFilters() {
    const params = new URLSearchParams();
    if (fromDate) params.set("from", fromDate);
    if (toDate) params.set("to", toDate);
    router.push(`/operador/inspecciones?${params.toString()}`);
    router.refresh();
  }

  function goToPage(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    router.push(`/operador/inspecciones?${params.toString()}`);
    router.refresh();
  }

  const inputClass =
    "rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-reysil-red focus:outline-none focus:ring-1 focus:ring-reysil-red";

  return (
    <div className="space-y-4">
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
          Filtrar
        </button>
      </div>

      {inspections.length === 0 ? (
        <p className="py-8 text-center text-sm text-neutral-400">
          No hay inspecciones para mostrar.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-3">Chofer</th>
                <th className="px-4 py-3">Patente</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Archivo</th>
                <th className="px-4 py-3">Documento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {inspections.map((inspection) => {
                const driverName =
                  `${inspection.driver.nombre} ${inspection.driver.apellido}`.trim();

                return (
                  <tr key={inspection.id}>
                    <td className="px-4 py-3 text-xs">
                      {driverName || "—"}
                      {inspection.driver.codigo ? (
                        <span className="ml-1 text-neutral-500">
                          ({inspection.driver.codigo})
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-xs">{inspection.patente}</td>
                    <td className="px-4 py-3 text-xs text-neutral-500">
                      {new Date(`${inspection.fecha}T00:00:00`).toLocaleDateString(
                        "es-AR",
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-600">
                      {inspection.file_name}
                    </td>
                    <td className="px-4 py-3">
                      {inspection.pdf_url ? (
                        <a
                          href={inspection.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-reysil-red hover:underline"
                        >
                          Ver
                        </a>
                      ) : (
                        <span className="text-xs text-neutral-400">Sin PDF</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 ? (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
            className="rounded border px-3 py-1 text-sm disabled:opacity-40"
          >
            Anterior
          </button>
          <span className="text-sm text-neutral-500">
            Pagina {page} de {totalPages} ({total} inspecciones)
          </span>
          <button
            type="button"
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalPages}
            className="rounded border px-3 py-1 text-sm disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      ) : null}
    </div>
  );
}
