"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ShiftReportRow } from "@/lib/server/reports/shift-queries";
import { updateShiftTimeAction } from "@/lib/server/reports/shift-actions";
import { formatTimeAR, formatDateAR } from "./shift-report-table";

const TZ = "America/Argentina/Buenos_Aires";

function formatDuracion(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

const FIELDS = [
  { key: "llegada_deposito" as const, label: "Llegada al Depósito" },
  { key: "salida_deposito" as const, label: "Salida del Depósito" },
  { key: "vuelta_deposito" as const, label: "Vuelta al Depósito" },
  { key: "fin_turno" as const, label: "Fin del Turno" },
];

function timestampToARTime(ts: string | null): string {
  if (!ts) return "";
  return new Date(ts).toLocaleTimeString("en-GB", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
  });
}

type Props = {
  row: ShiftReportRow;
  onClose: () => void;
  onUpdated: (updated: ShiftReportRow) => void;
};

export function ShiftDetailDialog({ row, onClose, onUpdated }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [times, setTimes] = useState({
    llegada_deposito: timestampToARTime(row.llegada_deposito),
    salida_deposito: timestampToARTime(row.salida_deposito),
    vuelta_deposito: timestampToARTime(row.vuelta_deposito),
    fin_turno: timestampToARTime(row.fin_turno),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const kmTotal =
    row.km_50 != null || row.km_100 != null
      ? (row.km_50 ?? 0) + (row.km_100 ?? 0)
      : null;

  async function handleSave() {
    setSaving(true);
    setError(null);

    for (const f of FIELDS) {
      const newTime = times[f.key];
      const originalTime = timestampToARTime(row[f.key]);
      if (!newTime || newTime === originalTime) continue;

      const result = await updateShiftTimeAction(row.id, f.key, newTime);
      if (result.error) {
        setError(result.error);
        setSaving(false);
        return;
      }
    }

    // Build updated row with reconstructed timestamps (AR offset -03:00)
    const updatedRow: ShiftReportRow = { ...row };
    for (const f of FIELDS) {
      if (times[f.key]) {
        updatedRow[f.key] = `${row.fecha}T${times[f.key]}:00.000-03:00`;
      }
    }

    setSaving(false);
    setEditing(false);
    onUpdated(updatedRow);
    router.refresh();
  }

  function handleCancelEdit() {
    setTimes({
      llegada_deposito: timestampToARTime(row.llegada_deposito),
      salida_deposito: timestampToARTime(row.salida_deposito),
      vuelta_deposito: timestampToARTime(row.vuelta_deposito),
      fin_turno: timestampToARTime(row.fin_turno),
    });
    setError(null);
    setEditing(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <div>
            <h3 className="font-semibold text-neutral-900">
              {row.apellido}, {row.nombre}
            </h3>
            <p className="text-xs text-neutral-500">
              {row.codigo} · {formatDateAR(row.fecha)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-xs text-red-700">
              {error}
            </div>
          )}

          {/* Time fields */}
          <div className="space-y-3">
            {FIELDS.map((f) => (
              <div key={f.key} className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">{f.label}</span>
                {editing ? (
                  <input
                    type="time"
                    value={times[f.key]}
                    onChange={(e) =>
                      setTimes((prev) => ({ ...prev, [f.key]: e.target.value }))
                    }
                    className="rounded-md border border-neutral-300 px-2 py-1 text-sm focus:border-reysil-red focus:outline-none focus:ring-1 focus:ring-reysil-red"
                  />
                ) : (
                  <span className="text-sm font-medium text-neutral-900">
                    {formatTimeAR(row[f.key])}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Extra detail: km + pernoctado */}
          <div className="space-y-2 border-t border-neutral-100 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600">Km 50%</span>
              <span className="text-sm font-medium text-neutral-900">
                {row.km_50 != null ? row.km_50 : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600">Km 100%</span>
              <span className="text-sm font-medium text-neutral-900">
                {row.km_100 != null ? row.km_100 : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600">Total Km</span>
              <span className="text-sm font-medium text-neutral-900">
                {kmTotal != null ? kmTotal : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600">Pernoctado</span>
              <span className="text-sm font-medium text-neutral-900">
                {row.pernoctada ? "Sí" : "No"}
              </span>
            </div>
          </div>

          {/* Paradas */}
          {row.paradas.length > 0 && (
            <div className="space-y-2 border-t border-neutral-100 pt-3">
              <p className="text-sm font-medium text-neutral-700">
                Paradas ({row.paradas.length})
              </p>
              <ul className="space-y-1">
                {row.paradas.map((p) => (
                  <li key={p.id} className="text-sm text-neutral-700">
                    <span className="font-medium">
                      {new Date(p.hora).toLocaleTimeString("es-AR", {
                        timeZone: TZ,
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {" · "}
                    {p.motivo}
                    {p.duracion_min ? (
                      <span className="text-neutral-500">
                        {" · "}{formatDuracion(p.duracion_min)}
                      </span>
                    ) : null}
                    {p.observaciones && (
                      <span className="text-neutral-500">
                        {" · "}{p.observaciones}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {editing && (
            <p className="text-xs text-neutral-400">
              Solo se puede modificar la hora. El día no es editable.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-neutral-200 px-6 py-4">
          {editing ? (
            <>
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={saving}
                className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-md bg-reysil-red px-4 py-2 text-sm font-medium text-white hover:bg-reysil-red-dark disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="rounded-md bg-reysil-red px-4 py-2 text-sm font-medium text-white hover:bg-reysil-red-dark"
              >
                Editar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
