"use client";

import { useState } from "react";
import type { StopsReportRow } from "@/lib/server/reports/stops-queries";

const TZ = "America/Argentina/Buenos_Aires";

function formatDateAR(fecha: string): string {
  const [y, m, d] = fecha.split("-");
  return `${d}/${m}/${y}`;
}

function formatTimeAR(ts: string): string {
  return new Date(ts).toLocaleTimeString("es-AR", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuracion(min: number | null): string {
  if (!min) return "—";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

type SortKey = "fecha" | "chofer" | "motivo";

type GroupedRow = {
  driver_id: string;
  codigo: string;
  nombre: string;
  apellido: string;
  motivo: string;
  duracion_min: number | null;
  count: number;
};

function groupRows(rows: StopsReportRow[]): GroupedRow[] {
  const map = new Map<string, GroupedRow>();
  for (const row of rows) {
    const key = `${row.driver_id}::${row.motivo}`;
    const existing = map.get(key);
    if (existing) {
      existing.count++;
      if (row.duracion_min != null) {
        existing.duracion_min = (existing.duracion_min ?? 0) + row.duracion_min;
      }
    } else {
      map.set(key, {
        driver_id: row.driver_id,
        codigo: row.codigo,
        nombre: row.nombre,
        apellido: row.apellido,
        motivo: row.motivo,
        duracion_min: row.duracion_min,
        count: 1,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => {
    const cmp = a.apellido.localeCompare(b.apellido, "es");
    if (cmp !== 0) return cmp;
    return a.motivo.localeCompare(b.motivo, "es");
  });
}

function sortDesglosado(rows: StopsReportRow[], key: SortKey): StopsReportRow[] {
  return [...rows].sort((a, b) => {
    if (key === "chofer") {
      const cmp = a.apellido.localeCompare(b.apellido, "es");
      if (cmp !== 0) return cmp;
      return a.fecha.localeCompare(b.fecha);
    }
    if (key === "motivo") {
      const cmp = a.motivo.localeCompare(b.motivo, "es");
      if (cmp !== 0) return cmp;
      return a.fecha.localeCompare(b.fecha);
    }
    // fecha desc (default), secondary hora asc
    const cmp = b.fecha.localeCompare(a.fecha);
    if (cmp !== 0) return cmp;
    return a.hora.localeCompare(b.hora);
  });
}

type Props = { rows: StopsReportRow[] };

export function StopsReportTable({ rows }: Props) {
  const [mode, setMode] = useState<"desglosado" | "agrupado">("desglosado");
  const [sortKey, setSortKey] = useState<SortKey>("fecha");

  const thBase =
    "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500";
  const thSort = (active: boolean) =>
    `${thBase} cursor-pointer select-none hover:text-neutral-800 ${active ? "text-reysil-red" : ""}`;

  return (
    <div className="space-y-3">
      {/* Toggle agrupado / desglosado */}
      <div className="flex items-center gap-1 self-start rounded-lg border border-neutral-200 bg-white p-1">
        {(["desglosado", "agrupado"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
              mode === m
                ? "bg-reysil-red text-white"
                : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500">
          No se encontraron paradas con los filtros aplicados.
        </div>
      ) : mode === "agrupado" ? (
        <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
          <table className="min-w-full divide-y divide-neutral-200 text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <th className={thBase}>Chofer</th>
                <th className={thBase}>Nombre</th>
                <th className={thBase}>Motivo</th>
                <th className={thBase}>Cantidad</th>
                <th className={thBase}>Duración Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {groupRows(rows).map((row, i) => (
                <tr key={i} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium text-neutral-900">
                    {row.codigo}
                  </td>
                  <td className="px-4 py-3 text-neutral-700">
                    {row.apellido}, {row.nombre}
                  </td>
                  <td className="px-4 py-3 text-neutral-700">{row.motivo}</td>
                  <td className="px-4 py-3 text-neutral-700">{row.count}</td>
                  <td className="px-4 py-3 text-neutral-700">
                    {formatDuracion(row.duracion_min)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
          <table className="min-w-full divide-y divide-neutral-200 text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <th
                  className={thSort(sortKey === "fecha")}
                  onClick={() => setSortKey("fecha")}
                >
                  Fecha {sortKey === "fecha" && "↓"}
                </th>
                <th className={thBase}>Hora</th>
                <th
                  className={thSort(sortKey === "chofer")}
                  onClick={() => setSortKey("chofer")}
                >
                  Chofer {sortKey === "chofer" && "↑"}
                </th>
                <th className={thBase}>Nombre</th>
                <th
                  className={thSort(sortKey === "motivo")}
                  onClick={() => setSortKey("motivo")}
                >
                  Motivo {sortKey === "motivo" && "↑"}
                </th>
                <th className={thBase}>Duración</th>
                <th className={thBase}>Observaciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {sortDesglosado(rows, sortKey).map((row) => (
                <tr key={row.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 text-neutral-700">
                    {formatDateAR(row.fecha)}
                  </td>
                  <td className="px-4 py-3 text-neutral-700">
                    {formatTimeAR(row.hora)}
                  </td>
                  <td className="px-4 py-3 font-medium text-neutral-900">
                    {row.codigo}
                  </td>
                  <td className="px-4 py-3 text-neutral-700">
                    {row.apellido}, {row.nombre}
                  </td>
                  <td className="px-4 py-3 text-neutral-700">{row.motivo}</td>
                  <td className="px-4 py-3 text-neutral-700">
                    {formatDuracion(row.duracion_min)}
                  </td>
                  <td className="px-4 py-3 text-neutral-500">
                    {row.observaciones ?? "—"}
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
