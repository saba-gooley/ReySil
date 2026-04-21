"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { registerShiftEvent, updateShiftData } from "@/lib/server/chofer/shift-actions";

type Shift = {
  id: string;
  fecha: string;
  llegada_deposito: string | null;
  salida_deposito: string | null;
  vuelta_deposito: string | null;
  fin_turno: string | null;
  km_50: number | null;
  km_100: number | null;
  pernoctada: boolean;
} | null;

const SHIFT_EVENTS = [
  { field: "llegada_deposito" as const, label: "Llegada Deposito ReySil" },
  { field: "salida_deposito" as const, label: "Salida Deposito ReySil" },
  { field: "vuelta_deposito" as const, label: "Vuelta al Deposito" },
  { field: "fin_turno" as const, label: "Fin del Turno" },
];

export function ShiftView({ shift }: { shift: Shift }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [km50, setKm50] = useState<string>(shift?.km_50?.toString() ?? "");
  const [km100, setKm100] = useState<string>(shift?.km_100?.toString() ?? "");
  const [pernoctada, setPernoctada] = useState(shift?.pernoctada ?? false);
  const [savingData, setSavingData] = useState(false);

  const completedCount = SHIFT_EVENTS.filter(
    (ev) => shift?.[ev.field] != null,
  ).length;

  async function handleSaveShiftData() {
    if (!shift?.id) return;
    setSavingData(true);
    setError("");

    try {
      const result = await updateShiftData(shift.id, {
        km_50: km50 ? parseFloat(km50) : null,
        km_100: km100 ? parseFloat(km100) : null,
        pernoctada,
      });

      setSavingData(false);
      if (result.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
    } catch (err) {
      setSavingData(false);
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs text-neutral-500">
          Fecha: {new Date().toLocaleDateString("es-AR")}
        </p>
        <span className="text-xs text-neutral-400">
          ({completedCount}/{SHIFT_EVENTS.length})
        </span>
      </div>

      {SHIFT_EVENTS.map((ev) => (
        <ShiftEventField
          key={ev.field}
          field={ev.field}
          label={ev.label}
          value={shift?.[ev.field] ?? null}
          onError={setError}
          onDone={() => router.refresh()}
        />
      ))}

      {/* KM y Pernoctada */}
      <div className="mt-4 space-y-3 border-t border-neutral-200 pt-4">
        <p className="text-sm font-semibold text-neutral-900">Datos del Turno</p>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              KM al 50%
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={km50}
              onChange={(e) => setKm50(e.target.value)}
              placeholder="0"
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-reysil-red focus:outline-none focus:ring-1 focus:ring-reysil-red"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              KM al 100%
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={km100}
              onChange={(e) => setKm100(e.target.value)}
              placeholder="0"
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-reysil-red focus:outline-none focus:ring-1 focus:ring-reysil-red"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="pernoctada"
            checked={pernoctada}
            onChange={(e) => setPernoctada(e.target.checked)}
            className="h-4 w-4 rounded border-neutral-300 text-reysil-red focus:ring-reysil-red"
          />
          <label htmlFor="pernoctada" className="text-sm font-medium text-neutral-700">
            Pernoctada
          </label>
        </div>

        <button
          type="button"
          onClick={handleSaveShiftData}
          disabled={savingData}
          className="w-full rounded-md bg-reysil-red px-4 py-2 text-sm font-medium text-white hover:bg-reysil-red-dark disabled:opacity-50"
        >
          {savingData ? "Guardando..." : "Guardar datos del turno"}
        </button>
      </div>
    </div>
  );
}

function ShiftEventField({
  field,
  label,
  value,
  onError,
  onDone,
}: {
  field: string;
  label: string;
  value: string | null;
  onError: (msg: string) => void;
  onDone: () => void;
}) {
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(useNow: boolean) {
    setLoading(true);
    onError("");

    try {
      const timestamp = useNow
        ? new Date().toISOString()
        : (() => {
            const today = new Date().toISOString().split("T")[0];
            return new Date(`${today}T${time}:00`).toISOString();
          })();

      const result = await registerShiftEvent(
        field as "llegada_deposito" | "salida_deposito" | "vuelta_deposito" | "fin_turno",
        timestamp,
      );
      setLoading(false);
      if (result.error) {
        onError(result.error);
      } else {
        onDone();
      }
    } catch (err) {
      setLoading(false);
      onError(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  if (value) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3">
        <p className="text-sm font-medium text-neutral-900">{label}</p>
        <p className="text-xs text-green-600">
          {new Date(value).toLocaleTimeString("es-AR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-4 py-3 space-y-2">
      <p className="text-sm font-medium text-neutral-900">{label}</p>
      <div className="flex items-center gap-2">
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-reysil-red focus:outline-none focus:ring-1 focus:ring-reysil-red"
        />
        <button
          type="button"
          onClick={() => handleRegister(true)}
          disabled={loading}
          className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
        >
          Ahora
        </button>
      </div>
      {time && (
        <button
          type="button"
          onClick={() => handleRegister(false)}
          disabled={loading}
          className="w-full rounded-md bg-reysil-red px-4 py-2 text-sm font-medium text-white hover:bg-reysil-red-dark disabled:opacity-50"
        >
          {loading ? "Guardando..." : `Registrar ${time}`}
        </button>
      )}
    </div>
  );
}
