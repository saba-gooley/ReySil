"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useState } from "react";
import {
  assignTripAction,
  reassignTripAction,
  preassignTripAction,
  type AssignmentActionState,
} from "@/lib/server/assignments/actions";

type Driver = { id: string; codigo: string; nombre: string; apellido: string };

type Props = {
  tripId: string;
  drivers: Driver[];
  mode: "assign" | "reassign" | "preassign";
  currentDriverId?: string;
  currentPatente?: string;
  onDone?: () => void;
};

const ACTIONS = {
  assign: assignTripAction,
  reassign: reassignTripAction,
  preassign: preassignTripAction,
};

const LABELS = {
  assign: "Confirmar",
  reassign: "Reasignar",
  preassign: "Preasignar",
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
  const action = ACTIONS[mode];
  const [state, formAction] = useFormState(action, initialState);
  const [driverId, setDriverId] = useState(currentDriverId ?? "");
  const [patente, setPatente] = useState(currentPatente ?? "");
  const [comentario, setComentario] = useState("");

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
        comentario_asignacion: comentario || null,
      }),
    );
    formAction(formData);
  }

  const inputClass =
    "rounded-md border border-neutral-300 px-2 py-1 text-sm focus:border-reysil-red focus:outline-none focus:ring-1 focus:ring-reysil-red";

  return (
    <form action={handleSubmit} className="space-y-2">
      {state.error && (
        <span className="text-xs text-red-600">{state.error}</span>
      )}
      <div className="flex flex-wrap gap-1">
        <select
          value={driverId}
          onChange={(e) => setDriverId(e.target.value)}
          required
          className={`${inputClass} w-32 text-xs`}
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
          className={`${inputClass} w-24 font-mono text-xs`}
        />
      </div>
      <textarea
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        placeholder="Comentario (opcional)"
        className={`${inputClass} w-full text-xs resize-none`}
        rows={2}
      />
      <div className="flex justify-end">
        <SubmitBtn label={LABELS[mode]} />
      </div>
    </form>
  );
}

function SubmitBtn({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-reysil-red px-2 py-1 text-xs font-medium text-white hover:bg-reysil-red-dark disabled:opacity-50"
    >
      {pending ? "..." : label}
    </button>
  );
}
