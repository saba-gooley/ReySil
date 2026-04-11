"use client";

import { useRouter } from "next/navigation";
import type { OperatorTripRow } from "@/lib/server/assignments/queries";
import { TripTable } from "./trip-table";
import { AssignTripForm } from "./assign-trip-form";

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
      actions={(trip) => (
        <AssignTripForm
          tripId={trip.id}
          drivers={drivers}
          mode={trip.estado === "PENDIENTE" ? "preassign" : "assign"}
          currentDriverId={trip.trip_assignments?.driver_id}
          currentPatente={trip.trip_assignments?.patente}
          onDone={() => router.refresh()}
        />
      )}
    />
  );
}
