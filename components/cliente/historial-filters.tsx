"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function HistorialFilters({
  from,
  to,
}: {
  from: string;
  to: string;
}) {
  const router = useRouter();
  const [fromDate, setFromDate] = useState(from);
  const [toDate, setToDate] = useState(to);

  function applyFilters() {
    const params = new URLSearchParams();
    if (fromDate) params.set("from", fromDate);
    if (toDate) params.set("to", toDate);
    params.set("page", "1");
    router.push(`/cliente/historial?${params.toString()}`);
  }

  function clearFilters() {
    setFromDate("");
    setToDate("");
    router.push("/cliente/historial");
  }

  const inputClass =
    "rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-reysil-red focus:outline-none focus:ring-1 focus:ring-reysil-red";

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-neutral-200 bg-white p-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600">
          Desde
        </label>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600">
          Hasta
        </label>
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
        className="rounded-md bg-reysil-red px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-reysil-red-dark"
      >
        Filtrar
      </button>
      {(fromDate || toDate) && (
        <button
          type="button"
          onClick={clearFilters}
          className="text-sm text-neutral-500 hover:underline"
        >
          Limpiar
        </button>
      )}
    </div>
  );
}
