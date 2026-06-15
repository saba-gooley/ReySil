"use client";

import { useState } from "react";

export type DestinoEntry = {
  key: number;
  destino: string;
  observaciones: string;
};

export function MultiplesDestinosSection({
  enabled,
  onToggle,
  destinos,
  onUpdate,
  inputClass,
}: {
  enabled: boolean;
  onToggle: (val: boolean) => void;
  destinos: DestinoEntry[];
  onUpdate: (destinos: DestinoEntry[]) => void;
  inputClass: string;
}) {
  const [nextKey, setNextKey] = useState(2);

  function addDestino() {
    onUpdate([...destinos, { key: nextKey, destino: "", observaciones: "" }]);
    setNextKey(nextKey + 1);
  }

  function removeDestino(key: number) {
    if (destinos.length <= 1) return;
    onUpdate(destinos.filter((d) => d.key !== key));
  }

  function updateDestino(key: number, field: keyof DestinoEntry, value: string) {
    onUpdate(destinos.map((d) => (d.key === key ? { ...d, [field]: value } : d)));
  }

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onToggle(e.target.checked)}
          className="h-4 w-4 rounded border-neutral-300 text-reysil-red focus:ring-reysil-red"
        />
        <span className="text-sm font-medium text-neutral-700">Múltiples destinos</span>
      </label>

      {enabled && (
        <div className="space-y-2 pl-6">
          {destinos.map((d, idx) => (
            <div
              key={d.key}
              className="flex flex-wrap items-start gap-2 rounded-md border border-neutral-100 bg-neutral-50 p-3"
            >
              <span className="mt-2 text-xs font-medium text-neutral-400">#{idx + 1}</span>
              <div className="flex-1 min-w-[200px] space-y-1">
                <input
                  type="text"
                  value={d.destino}
                  onChange={(e) => updateDestino(d.key, "destino", e.target.value)}
                  placeholder="Destino *"
                  className={inputClass}
                />
                <input
                  type="text"
                  value={d.observaciones}
                  onChange={(e) => updateDestino(d.key, "observaciones", e.target.value)}
                  placeholder="Observaciones (bultos, nro. remito, etc.)"
                  className={inputClass}
                />
              </div>
              {destinos.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDestino(d.key)}
                  className="mt-2 text-xs text-red-500 hover:underline"
                >
                  Quitar
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addDestino}
            className="text-sm text-reysil-red hover:underline"
          >
            + Agregar destino
          </button>
        </div>
      )}
    </div>
  );
}
