"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { registerShiftEvent } from "@/lib/server/chofer/actions";

type Shift = {
  id: string;
  fecha: string;
  llegada_deposito: string | null;
  salida_deposito: string | null;
  vuelta_deposito: string | null;
  fin_turno: string | null;
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
  const completedCount = SHIFT_EVENTS.filter(
    (ev) => shift?.[ev.field] != null,
  ).length;

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
