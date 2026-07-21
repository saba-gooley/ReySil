"use client";

import { useRouter } from "next/navigation";
import type { OperatorTripRow } from "@/lib/server/assignments/queries";
import { TripTable } from "./trip-table";
import { AssignTripDialog } from "./assign-trip-dialog";
import { PreassignedTripActions } from "./preassigned-trip-actions";
import { TripEditDialog } from "./trip-edit-dialog";
import { isTripEditable } from "@/lib/server/trips/editable";

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
        // Editar la solicitud (req. 2.16). Solo REPARTO: la edicion de
        // CONTENEDOR se hace a nivel reserva y queda para mas adelante.
        const editar =
          trip.tipo === "REPARTO" && isTripEditable(trip.estado) ? (
            <TripEditDialog
              tripId={trip.id}
              codigo={trip.codigo}
              onDone={() => router.refresh()}
            />
          ) : null;

        if (trip.estado === "PENDIENTE") {
          return (
            <div className="flex flex-wrap gap-1">
              {editar}
              <AssignTripDialog
                tripId={trip.id}
                drivers={drivers}
                mode="preassign"
                currentDriverId={trip.trip_assignments?.driver_id}
                currentPatente={trip.trip_assignments?.patente}
                fecha={trip.fecha_solicitada || undefined}
                onDone={() => router.refresh()}
              />
            </div>
          );
        }
        if (trip.estado === "PREASIGNADO") {
          return (
            <div className="flex flex-wrap gap-1">
              {editar}
              <PreassignedTripActions
                tripId={trip.id}
                drivers={drivers}
                currentDriverId={trip.trip_assignments?.driver_id}
                currentPatente={trip.trip_assignments?.patente}
                currentComentario={trip.trip_assignments?.comentario_asignacion}
                fecha={trip.fecha_solicitada || undefined}
                onDone={() => router.refresh()}
              />
            </div>
          );
        }
        return editar;
      }}
    />
  );
}
