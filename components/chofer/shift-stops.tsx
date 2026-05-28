"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MOTIVOS_PARADA } from "@/lib/validators/shift-stop";
import {
  addShiftStopAction,
  deleteShiftStopAction,
} from "@/lib/server/chofer/shift-actions";
import type { ShiftStop } from "@/lib/server/chofer/queries";

const TZ = "America/Argentina/Buenos_Aires";

function formatTimeAR(ts: string): string {
  return new Date(ts).toLocaleTimeString("es-AR", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
  });
}

function currentARTime(): string {
  return new Date().toLocaleTimeString("en-GB", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
  });
}

type Props = {
  shiftId: string;
  fecha: string; // YYYY-MM-DD
  stops: ShiftStop[];
};

export function ShiftStops({ shiftId, fecha, stops }: Props) {
  const router = useRouter();
  const [hora, setHora] = useState(currentARTime);
  const [motivo, setMotivo] = useState<string>(MOTIVOS_PARADA[0]);
  const [observaciones, setObservaciones] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    if (!hora) return;
    setSaving(true);
    setError(null);
    const result = await addShiftStopAction(shiftId, fecha, {
      hora,
      motivo,
      observaciones: motivo === "Otros" ? observaciones : undefined,
    });
    setSaving(false);
    if (result.error) {
      setError(result.error);
    } else {
      setHora(currentARTime());
      setMotivo(MOTIVOS_PARADA[0]);
      setObservaciones("");
      router.refresh();
    }
  }

  async function handleDelete(stopId: string) {
    setDeleting(stopId);
    setError(null);
    const result = await deleteShiftStopAction(stopId);
    setDeleting(null);
    if (result.error) {
      setError(result.error);
    } else {
      router.refresh();
    }
  }

  const inputClass =
    "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-reysil-red focus:outline-none focus:ring-1 focus:ring-reysil-red";

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Lista de paradas registradas */}
      {stops.length === 0 ? (
        <p className="text-xs text-neutral-400">Sin paradas registradas.</p>
      ) : (
        <ul className="space-y-2">
          {stops.map((stop) => (
            <li
              key={stop.id}
              className="flex items-start justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium text-neutral-900">
                  {formatTimeAR(stop.hora)} · {stop.motivo}
                </p>
                {stop.observaciones && (
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {stop.observaciones}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleDelete(stop.id)}
                disabled={deleting === stop.id}
                className="ml-3 text-xs text-red-500 hover:text-red-700 disabled:opacity-40"
              >
                {deleting === stop.id ? "..." : "Eliminar"}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Formulario agregar parada */}
      <div className="space-y-2 rounded-lg border border-neutral-200 bg-white p-3">
        <p className="text-xs font-medium text-neutral-700">Agregar parada</p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-xs text-neutral-500">Hora</label>
            <input
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-neutral-500">Motivo</label>
            <select
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className={inputClass}
            >
              {MOTIVOS_PARADA.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {motivo === "Otros" && (
          <div>
            <label className="mb-1 block text-xs text-neutral-500">
              Observaciones
            </label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              rows={2}
              placeholder="Describí el motivo..."
              className={`${inputClass} resize-none`}
            />
          </div>
        )}

        <button
          type="button"
          onClick={handleAdd}
          disabled={saving || !hora}
          className="w-full rounded-md bg-reysil-red px-4 py-2 text-sm font-medium text-white hover:bg-reysil-red-dark disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Agregar parada"}
        </button>
      </div>
    </div>
  );
}
