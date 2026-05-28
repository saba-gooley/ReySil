"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MOTIVOS_PARADA } from "@/lib/validators/shift-stop";
import {
  addShiftStopAction,
  deleteShiftStopAction,
  updateShiftStopAction,
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

function toInputTimeAR(ts: string): string {
  return new Date(ts).toLocaleTimeString("en-GB", {
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

function formatDuracion(min: number | null): string {
  if (!min) return "";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

type Props = {
  shiftId: string;
  fecha: string; // YYYY-MM-DD
  stops: ShiftStop[];
};

export function ShiftStops({ shiftId, fecha, stops }: Props) {
  const router = useRouter();

  // Add form state
  const [hora, setHora] = useState(currentARTime);
  const [motivo, setMotivo] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [duracionMin, setDuracionMin] = useState("");
  const [saving, setSaving] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editHora, setEditHora] = useState("");
  const [editMotivo, setEditMotivo] = useState("");
  const [editObs, setEditObs] = useState("");
  const [editDuracion, setEditDuracion] = useState("");
  const [updating, setUpdating] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete state
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleAdd() {
    if (!hora || !motivo) return;
    setSaving(true);
    setAddError(null);
    const durNum = duracionMin ? parseInt(duracionMin, 10) : null;
    const result = await addShiftStopAction(shiftId, fecha, {
      hora,
      motivo,
      observaciones: motivo === "Otros" ? observaciones : undefined,
      duracion_min: durNum && durNum > 0 ? durNum : null,
    });
    setSaving(false);
    if (result.error) {
      setAddError(result.error);
    } else {
      setHora(currentARTime());
      setMotivo("");
      setObservaciones("");
      setDuracionMin("");
      router.refresh();
    }
  }

  function startEdit(stop: ShiftStop) {
    setEditingId(stop.id);
    setEditHora(toInputTimeAR(stop.hora));
    setEditMotivo(stop.motivo);
    setEditObs(stop.observaciones ?? "");
    setEditDuracion(stop.duracion_min?.toString() ?? "");
    setEditError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditError(null);
  }

  async function handleUpdate(stopId: string) {
    if (!editHora || !editMotivo) return;
    setUpdating(true);
    setEditError(null);
    const durNum = editDuracion ? parseInt(editDuracion, 10) : null;
    const result = await updateShiftStopAction(stopId, fecha, {
      hora: editHora,
      motivo: editMotivo,
      observaciones: editMotivo === "Otros" ? editObs : undefined,
      duracion_min: durNum && durNum > 0 ? durNum : null,
    });
    setUpdating(false);
    if (result.error) {
      setEditError(result.error);
    } else {
      setEditingId(null);
      router.refresh();
    }
  }

  async function handleDelete(stopId: string) {
    setDeleting(stopId);
    const result = await deleteShiftStopAction(stopId);
    setDeleting(null);
    if (result.error) {
      setAddError(result.error);
    } else {
      router.refresh();
    }
  }

  const inputClass =
    "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-reysil-red focus:outline-none focus:ring-1 focus:ring-reysil-red";

  return (
    <div className="space-y-3">
      {/* Lista de paradas */}
      {stops.length === 0 ? (
        <p className="text-xs text-neutral-400">Sin paradas registradas.</p>
      ) : (
        <ul className="space-y-2">
          {stops.map((stop) =>
            editingId === stop.id ? (
              <li
                key={stop.id}
                className="rounded-lg border border-reysil-red/30 bg-red-50 p-3 space-y-2"
              >
                {editError && (
                  <div className="rounded-md bg-red-100 p-2 text-xs text-red-700">
                    {editError}
                  </div>
                )}
                <p className="text-xs font-medium text-neutral-700">Editar parada</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block text-xs text-neutral-500">Hora</label>
                    <input
                      type="time"
                      value={editHora}
                      onChange={(e) => setEditHora(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-neutral-500">Motivo</label>
                    <select
                      value={editMotivo}
                      onChange={(e) => setEditMotivo(e.target.value)}
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
                <div>
                  <label className="mb-1 block text-xs text-neutral-500">
                    Duración (min)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editDuracion}
                    onChange={(e) => setEditDuracion(e.target.value)}
                    placeholder="Ej: 30"
                    className={inputClass}
                  />
                </div>
                {editMotivo === "Otros" && (
                  <div>
                    <label className="mb-1 block text-xs text-neutral-500">
                      Observaciones
                    </label>
                    <textarea
                      value={editObs}
                      onChange={(e) => setEditObs(e.target.value)}
                      rows={2}
                      className={`${inputClass} resize-none`}
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    disabled={updating}
                    className="flex-1 rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdate(stop.id)}
                    disabled={updating || !editHora || !editMotivo}
                    className="flex-1 rounded-md bg-reysil-red px-3 py-1.5 text-sm font-medium text-white hover:bg-reysil-red-dark disabled:opacity-50"
                  >
                    {updating ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </li>
            ) : (
              <li
                key={stop.id}
                className="flex items-start justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    {formatTimeAR(stop.hora)} · {stop.motivo}
                    {stop.duracion_min ? (
                      <span className="ml-1 font-normal text-neutral-500">
                        ({formatDuracion(stop.duracion_min)})
                      </span>
                    ) : null}
                  </p>
                  {stop.observaciones && (
                    <p className="mt-0.5 text-xs text-neutral-500">
                      {stop.observaciones}
                    </p>
                  )}
                </div>
                <div className="ml-3 flex shrink-0 gap-3">
                  <button
                    type="button"
                    onClick={() => startEdit(stop)}
                    className="text-xs text-neutral-500 hover:text-neutral-700"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(stop.id)}
                    disabled={deleting === stop.id}
                    className="text-xs text-red-500 hover:text-red-700 disabled:opacity-40"
                  >
                    {deleting === stop.id ? "..." : "Eliminar"}
                  </button>
                </div>
              </li>
            ),
          )}
        </ul>
      )}

      {/* Formulario agregar parada */}
      <div className="space-y-2 rounded-lg border border-neutral-200 bg-white p-3">
        <p className="text-xs font-medium text-neutral-700">Agregar parada</p>
        {addError && (
          <div className="rounded-md bg-red-50 p-2 text-xs text-red-700">{addError}</div>
        )}
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
              <option value="" disabled>
                Seleccionar motivo
              </option>
              {MOTIVOS_PARADA.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs text-neutral-500">
            Duración (min)
          </label>
          <input
            type="number"
            min="1"
            value={duracionMin}
            onChange={(e) => setDuracionMin(e.target.value)}
            placeholder="Opcional"
            className={inputClass}
          />
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
          disabled={saving || !hora || !motivo}
          className="w-full rounded-md bg-reysil-red px-4 py-2 text-sm font-medium text-white hover:bg-reysil-red-dark disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Agregar parada"}
        </button>
      </div>
    </div>
  );
}
