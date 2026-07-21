"use client";

import { useState, useTransition } from "react";
import { reorderDestinationsAction } from "@/lib/server/trips/actions";
import { formatHoraAR } from "@/lib/utils/date";

type Destination = {
  id: string;
  destino: string;
  observaciones: string | null;
  orden: number;
  hora_llegada: string | null;
  hora_salida: string | null;
};

type Props = {
  tripId: string;
  tripEstado: string;
  destinations: Destination[];
};

const EDITABLE_STATES = ["PENDIENTE", "PREASIGNADO", "ASIGNADO"];

export function DestinationOrderEditor({ tripId, tripEstado, destinations }: Props) {
  const [items, setItems] = useState(
    [...destinations].sort((a, b) => a.orden - b.orden),
  );
  const [isDirty, setIsDirty] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const canEdit = EDITABLE_STATES.includes(tripEstado);

  function moveUp(index: number) {
    if (index === 0) return;
    const next = [...items];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    setItems(next);
    setIsDirty(true);
    setSaved(false);
  }

  function moveDown(index: number) {
    if (index === items.length - 1) return;
    const next = [...items];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    setItems(next);
    setIsDirty(true);
    setSaved(false);
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await reorderDestinationsAction(
        tripId,
        items.map((d) => d.id),
      );
      if (result.error) {
        setError(result.error);
      } else {
        setIsDirty(false);
        setSaved(true);
      }
    });
  }

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold uppercase text-neutral-400">
        Destinos{canEdit ? " — reordenable" : ""}
      </h4>
      <div className="space-y-1.5">
        {items.map((d, i) => (
          <div
            key={d.id}
            className="flex items-start gap-2 rounded border border-neutral-200 bg-white px-3 py-2"
          >
            <span className="mt-0.5 w-5 shrink-0 text-xs font-medium text-neutral-400">
              {i + 1}.
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-neutral-900">{d.destino}</p>
              {d.observaciones && (
                <p className="text-xs text-neutral-400">{d.observaciones}</p>
              )}
              {(d.hora_llegada || d.hora_salida) && (
                <p className="mt-0.5 text-xs text-neutral-500">
                  {d.hora_llegada && (
                    <span className="text-green-700">
                      ✓ Llegada: {formatHoraAR(d.hora_llegada)}
                    </span>
                  )}
                  {d.hora_llegada && d.hora_salida && (
                    <span className="mx-1 text-neutral-300">·</span>
                  )}
                  {d.hora_salida && (
                    <span>Salida: {formatHoraAR(d.hora_salida)}</span>
                  )}
                </p>
              )}
            </div>
            {canEdit && items.length > 1 && (
              <div className="flex shrink-0 gap-0.5">
                <button
                  type="button"
                  onClick={() => moveUp(i)}
                  disabled={i === 0 || isPending}
                  className="rounded px-1.5 py-0.5 text-sm text-neutral-400 hover:bg-neutral-100 disabled:opacity-20"
                  title="Subir"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveDown(i)}
                  disabled={i === items.length - 1 || isPending}
                  className="rounded px-1.5 py-0.5 text-sm text-neutral-400 hover:bg-neutral-100 disabled:opacity-20"
                  title="Bajar"
                >
                  ↓
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      {canEdit && isDirty && (
        <button
          type="button"
          onClick={save}
          disabled={isPending}
          className="rounded bg-reysil-red px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {isPending ? "Guardando..." : "Guardar orden"}
        </button>
      )}
      {saved && !isDirty && (
        <span className="text-xs text-green-600">✓ Orden guardado</span>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
