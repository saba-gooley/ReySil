"use client";

import { useState } from "react";
import { AssignTripForm } from "./assign-trip-form";

type Driver = { id: string; codigo: string; nombre: string; apellido: string };

type Props = {
  tripId: string;
  drivers: Driver[];
  currentDriverId?: string;
  currentPatente?: string;
  currentComentario?: string | null;
  fecha?: string;
  onDone?: () => void;
};

export function AssignedTripActions({
  tripId,
  drivers,
  currentDriverId,
  currentPatente,
  currentComentario,
  fecha,
  onDone,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <AssignTripForm
        tripId={tripId}
        drivers={drivers}
        mode="reassign"
        currentDriverId={currentDriverId}
        currentPatente={currentPatente}
        currentComentario={currentComentario}
        fecha={fecha}
        onDone={() => {
          setIsEditing(false);
          onDone?.();
        }}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      className="rounded-md border border-neutral-300 bg-white px-2 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
    >
      Modificar
    </button>
  );
}
