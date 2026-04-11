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
  { field: "llegada_deposito" as const, label: "Llegada al deposito ReySil" },
  { field: "salida_deposito" as const, label: "Salida del deposito ReySil" },
  { field: "vuelta_deposito" as const, label: "Llegada al deposito destino" },
  { field: "fin_turno" as const, label: "Fin de turno" },
];

export function ShiftView({ shift }: { shift: Shift }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister(field: typeof SHIFT_EVENTS[number]["field"]) {
    setLoading(field);
    setError(null);
    const result = await registerShiftEvent(field);
    setLoading(null);
    if (result.error) {
      setError(result.error);
    } else {
      router.refresh();
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-xs text-red-700">
          {error}
        </div>
      )}

      <p className="text-xs text-neutral-500">
        Fecha: {new Date().toLocaleDateString("es-AR")}
      </p>

      {SHIFT_EVENTS.map((ev) => {
        const value = shift?.[ev.field] ?? null;
        const isRegistered = !!value;

        return (
          <div
            key={ev.field}
            className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium text-neutral-900">
                {ev.label}
              </p>
              {isRegistered && (
                <p className="text-xs text-green-600">
                  {new Date(value).toLocaleTimeString("es-AR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </div>
            {!isRegistered ? (
              <button
                type="button"
                onClick={() => handleRegister(ev.field)}
                disabled={loading === ev.field}
                className="rounded-md bg-reysil-red px-4 py-2 text-sm font-medium text-white hover:bg-reysil-red-dark disabled:opacity-50"
              >
                {loading === ev.field ? "..." : "Registrar"}
              </button>
            ) : (
              <span className="text-xs text-green-600 font-medium">
                Registrado
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
