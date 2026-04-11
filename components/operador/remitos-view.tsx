"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type RemitoRow = {
  id: string;
  drive_url: string;
  estado: string;
  observaciones: string | null;
  uploaded_at: string;
  filename: string | null;
  trip: {
    id: string;
    tipo: string;
    fecha_solicitada: string | null;
    destino_descripcion: string | null;
  };
  client: { nombre: string; codigo: string } | null;
};

type ClientRow = {
  id: string;
  nombre: string;
  codigo: string;
};

export function RemitosView({
  remitos,
  total,
  page,
  from,
  to,
  clientId,
  clients,
}: {
  remitos: RemitoRow[];
  total: number;
  page: number;
  from?: string;
  to?: string;
  clientId?: string;
  clients: ClientRow[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [fromDate, setFromDate] = useState(from ?? "");
  const [toDate, setToDate] = useState(to ?? "");
  const [selectedClient, setSelectedClient] = useState(clientId ?? "");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const pageSize = 20;
  const totalPages = Math.ceil(total / pageSize);

  function applyFilters() {
    const params = new URLSearchParams();
    if (fromDate) params.set("from", fromDate);
    if (toDate) params.set("to", toDate);
    if (selectedClient) params.set("clientId", selectedClient);
    router.push(`/operador/remitos?${params.toString()}`);
    router.refresh();
  }

  function goToPage(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`/operador/remitos?${params.toString()}`);
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
        <div>
          <label className="mb-1 block text-xs text-neutral-500">Cliente</label>
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className={inputClass}
          >
            <option value="">Todos</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={applyFilters}
          className="rounded-md bg-reysil-red px-4 py-2 text-sm font-medium text-white hover:bg-reysil-red-dark"
        >
          Filtrar
        </button>
      </div>

      {remitos.length === 0 ? (
        <p className="py-8 text-center text-sm text-neutral-400">
          No hay remitos para mostrar.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Fecha subida</th>
                <th className="px-4 py-3">Viaje</th>
                <th className="px-4 py-3">Destino</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Archivo</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {remitos.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3">{r.client?.nombre ?? "—"}</td>
                  <td className="px-4 py-3 text-xs text-neutral-500">
                    {new Date(r.uploaded_at).toLocaleString("es-AR")}
                  </td>
                  <td className="px-4 py-3 text-xs">{r.trip.tipo}</td>
                  <td className="px-4 py-3 text-xs">
                    {r.trip.destino_descripcion ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        r.estado === "VALIDADO"
                          ? "bg-green-100 text-green-700"
                          : r.estado === "RECHAZADO"
                            ? "bg-red-100 text-red-600"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {r.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-500">
                    {r.filename ?? "remito"}
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={r.drive_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-reysil-red hover:underline"
                    >
                      Ver
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
            Pagina {page} de {totalPages} ({total} remitos)
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
