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

export function AssignedTripActions({
  tripId,
  drivers,
  currentDriverId,
  currentPatente,
  currentComentario,
  fecha,
  onDone,
}: Props) {
  return (
    <AssignTripDialog
      tripId={tripId}
      drivers={drivers}
      mode="reassign"
      currentDriverId={currentDriverId}
      currentPatente={currentPatente}
      currentComentario={currentComentario}
      fecha={fecha}
      onDone={onDone}
    />
  );
}
