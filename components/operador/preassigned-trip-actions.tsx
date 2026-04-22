"use client";

import { AssignTripDialog } from "./assign-trip-dialog";

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

export function PreassignedTripActions({
  tripId,
  drivers,
  currentDriverId,
  currentPatente,
  currentComentario,
  fecha,
  onDone,
}: Props) {
  return (
    <div className="flex gap-2">
      <AssignTripDialog
        tripId={tripId}
        drivers={drivers}
        mode="update-preassigned"
        currentDriverId={currentDriverId}
        currentPatente={currentPatente}
        currentComentario={currentComentario}
        fecha={fecha}
        onDone={onDone}
      />
      <AssignTripDialog
        tripId={tripId}
        drivers={drivers}
        mode="assign"
        currentDriverId={currentDriverId}
        currentPatente={currentPatente}
        currentComentario={currentComentario}
        fecha={fecha}
        onDone={onDone}
        triggerLabel="Confirmar"
        triggerClassName="rounded-md bg-reysil-red px-2 py-1 text-xs font-medium text-white hover:bg-reysil-red-dark"
      />
    </div>
  );
}
