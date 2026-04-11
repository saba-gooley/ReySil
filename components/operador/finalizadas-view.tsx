"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { OperatorTripRow } from "@/lib/server/assignments/queries";
import { TripTable } from "./trip-table";

export function FinalizadasView({
  trips,
  total,
  page,
  from,
  to,
}: {
  trips: OperatorTripRow[];
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
    router.push(`/operador/finalizadas?${params.toString()}`);
    router.refresh();
  }

  function goToPage(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`/operador/finalizadas?${params.toString()}`);
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

      <TripTable
        trips={trips}
        showAssignment
        showEvents
        showRemitos
      />

      {totalPages > 1 && (
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
            Pagina {page} de {totalPages} ({total} viajes)
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
      )}
    </div>
  );
}
