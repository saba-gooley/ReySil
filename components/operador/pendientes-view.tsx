"use client";

import { useRouter } from "next/navigation";
import type { OperatorTripRow } from "@/lib/server/assignments/queries";
import { TripTable } from "./trip-table";
import { AssignTripForm } from "./assign-trip-form";
import { PreassignedTripActions } from "./preassigned-trip-actions";

type Driver = { id: string; codigo: string; nombre: string; apellido: string };

export function PendientesView({
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
      actions={(trip) => {
        if (trip.estado === "PENDIENTE") {
          return (
            <AssignTripForm
              tripId={trip.id}
              drivers={drivers}
              mode="preassign"
              currentDriverId={trip.trip_assignments?.driver_id}
              currentPatente={trip.trip_assignments?.patente}
              onDone={() => router.refresh()}
            />
          );
        }
        if (trip.estado === "PREASIGNADO") {
          return (
            <PreassignedTripActions
              tripId={trip.id}
              drivers={drivers}
              currentDriverId={trip.trip_assignments?.driver_id}
              currentPatente={trip.trip_assignments?.patente}
              currentComentario={trip.trip_assignments?.comentario_asignacion}
              onDone={() => router.refresh()}
            />
          );
        }
        return null;
      }}
    />
  );
}
