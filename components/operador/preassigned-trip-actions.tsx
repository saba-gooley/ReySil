"use client";

import { useState } from "react";
import { AssignTripForm } from "./assign-trip-form";

type Driver = { id: string; codigo: string; nombre: string; apellido: string };

type Props = {
  tripId: string;
  drivers: Driver[];
  currentDriverId?: string;
  currentPatente?: string;
  onDone?: () => void;
};

export function PreassignedTripActions({
  tripId,
  drivers,
  currentDriverId,
  currentPatente,
  onDone,
}: Props) {
  const [activeMode, setActiveMode] = useState<"reassign" | "assign" | null>(
    null
  );

  if (activeMode === "reassign") {
    return (
      <AssignTripForm
        tripId={tripId}
        drivers={drivers}
        mode="reassign"
        currentDriverId={currentDriverId}
        currentPatente={currentPatente}
        onDone={() => {
          setActiveMode(null);
          onDone?.();
        }}
      />
    );
  }

  if (activeMode === "assign") {
    return (
      <AssignTripForm
        tripId={tripId}
        drivers={drivers}
        mode="assign"
        currentDriverId={currentDriverId}
        currentPatente={currentPatente}
        onDone={() => {
          setActiveMode(null);
          onDone?.();
        }}
      />
    );
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => setActiveMode("reassign")}
        className="rounded-md border border-neutral-300 bg-white px-2 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
      >
        Volver a Preasignar
      </button>
      <button
        type="button"
        onClick={() => setActiveMode("assign")}
        className="rounded-md bg-reysil-red px-2 py-1 text-xs font-medium text-white hover:bg-reysil-red-dark"
      >
        Confirmar
      </button>
    </div>
  );
}
