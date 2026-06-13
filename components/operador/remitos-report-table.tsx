"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { RemitosReportRow } from "@/lib/server/reports/remitos-report-queries";

export function RemitosReportTable({
  rows,
  filters,
}: {
  rows: RemitosReportRow[];
  filters: { codigo?: string; fechaDesde?: string; fechaHasta?: string; emailEnviado?: string };
}) {
  const router = useRouter();
  const [codigo, setCodigo] = useState(filters.codigo ?? "");
  const [fechaDesde, setFechaDesde] = useState(filters.fechaDesde ?? "");
  const [fechaHasta, setFechaHasta] = useState(filters.fechaHasta ?? "");
  const [emailEnviado, setEmailEnviado] = useState(filters.emailEnviado ?? "");

  function applyFilters() {
    const params = new URLSearchParams();
    if (codigo.trim()) params.set("codigo", codigo.trim());
    if (fechaDesde) params.set("fechaDesde", fechaDesde);
    if (fechaHasta) params.set("fechaHasta", fechaHasta);
    if (emailEnviado) params.set("emailEnviado", emailEnviado);
    router.push(`/operador/reportes/remitos?${params.toString()}`);
  }

  const inputClass =
    "rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-reysil-red focus:outline-none focus:ring-1 focus:ring-reysil-red";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs text-neutral-500">Código de viaje</label>
          <input
            type="text"
            placeholder="VJ-00001"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-neutral-500">Desde</label>
          <input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-neutral-500">Hasta</label>
          <input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-neutral-500">Mail enviado</label>
          <select value={emailEnviado} onChange={(e) => setEmailEnviado(e.target.value)} className={inputClass}>
            <option value="">Todos</option>
            <option value="si">Sí</option>
            <option value="no">No</option>
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

      <p className="text-sm text-neutral-500">{rows.length} {rows.length === 1 ? "viaje" : "viajes"}</p>

      {rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-neutral-400">No hay viajes para mostrar.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Remitos</th>
                <th className="px-4 py-3">Mail enviado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {rows.map((r) => (
                <tr key={r.trip_id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 font-mono text-xs text-neutral-600">{r.codigo}</td>
                  <td className="px-4 py-3 text-sm">{r.cliente}</td>
                  <td className="px-4 py-3 text-xs text-neutral-500">
                    {r.fecha_solicitada
                      ? new Date(r.fecha_solicitada + "T00:00:00").toLocaleDateString("es-AR")
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs">{r.tipo}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      r.estado === "EN_CURSO" ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-600"
                    }`}>
                      {r.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-center">{r.remitos_count}</td>
                  <td className="px-4 py-3 text-xs">
                    {r.email_enviado_at ? (
                      <span className="text-green-700">
                        ✓{" "}
                        {new Date(r.email_enviado_at).toLocaleString("es-AR", {
                          timeZone: "America/Argentina/Buenos_Aires",
                          day: "2-digit", month: "2-digit",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </span>
                    ) : (
                      <span className="text-neutral-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
