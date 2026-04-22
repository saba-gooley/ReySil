"use client";

import { useRouter } from "next/navigation";
import type { OperatorTripRow } from "@/lib/server/assignments/queries";
import { TripTable } from "./trip-table";
import { AssignedTripActions } from "./assigned-trip-actions";

type Driver = { id: string; codigo: string; nombre: string; apellido: string };

export function AsignadoView({
  trips,
  drivers,
}: {
  trips: OperatorTripRow[];
  drivers: Driver[];
}) {
  const router = useRouter();

  return (
    <TripTable
      trips={trips}
      showAssignment
      compactColumns
      enableDateDriverFilters
      driversForFilter={drivers}
      actions={(trip) => (
        <AssignedTripActions
          tripId={trip.id}
          drivers={drivers}
          currentDriverId={trip.trip_assignments?.driver_id}
          currentPatente={trip.trip_assignments?.patente}
          currentComentario={trip.trip_assignments?.comentario_asignacion}
          fecha={trip.fecha_solicitada || undefined}
          onDone={() => router.refresh()}
        />
      )}
    />
  );
}
