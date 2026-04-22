"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useState } from "react";
import {
  assignTripAction,
  reassignTripAction,
  preassignTripAction,
  updatePreassignedTripAction,
  type AssignmentActionState,
} from "@/lib/server/assignments/actions";
import { TruckSelectList } from "./truck-select-list";
import { DriverSelectList } from "./driver-select-list";
import { Textarea } from "@/components/ui/textarea";

type Driver = { id: string; codigo: string; nombre: string; apellido: string };

type Props = {
  tripId: string;
  drivers: Driver[];
  mode: "assign" | "reassign" | "preassign" | "update-preassigned";
  currentDriverId?: string;
  currentPatente?: string;
  currentComentario?: string | null;
  fecha?: string;
  onDone?: () => void;
};

const ACTIONS: Record<
  "assign" | "reassign" | "preassign" | "update-preassigned",
  (prev: AssignmentActionState, formData: FormData) => Promise<AssignmentActionState>
> = {
  assign: assignTripAction,
  reassign: reassignTripAction,
  preassign: preassignTripAction,
  "update-preassigned": updatePreassignedTripAction,
};

const LABELS: Record<
  "assign" | "reassign" | "preassign" | "update-preassigned",
  string
> = {
  assign: "Confirmar",
  reassign: "Modificar",
  preassign: "Preasignar",
  "update-preassigned": "Guardar cambios",
};

const initialState: AssignmentActionState = {};

export function AssignTripForm({
  tripId,
  drivers,
  mode,
  currentDriverId,
  currentPatente,
  currentComentario,
  fecha,
  onDone,
}: Props) {
  const action = ACTIONS[mode];
  const [state, formAction] = useFormState(action, initialState);
  const [driverId, setDriverId] = useState(currentDriverId ?? "");
  const [patente, setPatente] = useState(currentPatente ?? "");
  const [comentario, setComentario] = useState(currentComentario ?? "");

  // Use provided fecha or default to today
  const fechaToUse = fecha || new Date().toISOString().split("T")[0];

  if (state.success) {
    onDone?.();
  }

  function handleSubmit(formData: FormData) {
    formData.set(
      "payload",
      JSON.stringify({
        trip_id: tripId,
        driver_id: driverId,
        patente: patente || "",
        comentario_asignacion: comentario || null,
      }),
    );
    formAction(formData);
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      {state.error && (
        <span className="text-xs text-red-600">{state.error}</span>
      )}

      <div className="space-y-2">
        <label className="text-xs font-medium">Chofer</label>
        <DriverSelectList
          value={driverId}
          onValueChange={setDriverId}
          fecha={fechaToUse}
          disabled={false}
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium">Camión</label>
        <TruckSelectList
          value={patente}
          onValueChange={setPatente}
          fecha={fechaToUse}
          disabled={false}
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium">Comentario (opcional)</label>
        <Textarea
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          placeholder="Agregá un comentario sobre la asignación"
          className="text-xs resize-none"
          rows={2}
        />
      </div>

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
