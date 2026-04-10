"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useState } from "react";
import {
  assignTripAction,
  reassignTripAction,
  type AssignmentActionState,
} from "@/lib/server/assignments/actions";

type Driver = { id: string; codigo: string; nombre: string; apellido: string };

type Props = {
  tripId: string;
  drivers: Driver[];
  mode: "assign" | "reassign";
  currentDriverId?: string;
  currentPatente?: string;
  onDone?: () => void;
};

const initialState: AssignmentActionState = {};

export function AssignTripForm({
  tripId,
  drivers,
  mode,
  currentDriverId,
  currentPatente,
  onDone,
}: Props) {
  const action = mode === "assign" ? assignTripAction : reassignTripAction;
  const [state, formAction] = useFormState(action, initialState);
  const [driverId, setDriverId] = useState(currentDriverId ?? "");
  const [patente, setPatente] = useState(currentPatente ?? "");

  if (state.success) {
    onDone?.();
  }

  function handleSubmit(formData: FormData) {
    formData.set(
      "payload",
      JSON.stringify({
        trip_id: tripId,
        driver_id: driverId,
        patente,
      }),
    );
    formAction(formData);
  }

  const inputClass =
    "rounded-md border border-neutral-300 px-2 py-1 text-sm focus:border-reysil-red focus:outline-none focus:ring-1 focus:ring-reysil-red";

  return (
    <form action={handleSubmit} className="flex items-end gap-2">
      {state.error && (
        <span className="text-xs text-red-600">{state.error}</span>
      )}
      <select
        value={driverId}
        onChange={(e) => setDriverId(e.target.value)}
        required
        className={`${inputClass} w-44`}
      >
        <option value="">Chofer...</option>
        {drivers.map((d) => (
          <option key={d.id} value={d.id}>
            {d.apellido}, {d.nombre} ({d.codigo})
          </option>
        ))}
      </select>
      <input
        type="text"
        value={patente}
        onChange={(e) => setPatente(e.target.value.toUpperCase())}
        placeholder="Patente"
        required
        className={`${inputClass} w-28 font-mono`}
      />
      <SubmitBtn mode={mode} />
    </form>
  );
}

function SubmitBtn({ mode }: { mode: "assign" | "reassign" }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-reysil-red px-3 py-1 text-sm font-medium text-white hover:bg-reysil-red-dark disabled:opacity-50"
    >
      {pending
        ? "..."
        : mode === "assign"
          ? "Confirmar"
          : "Reasignar"}
    </button>
  );
}
