import {
  listPendingTrips,
  listActiveDrivers,
} from "@/lib/server/assignments/queries";
import { PendientesView } from "@/components/operador/pendientes-view";

export default async function PendientesPage() {
  const [trips, drivers] = await Promise.all([
    listPendingTrips(),
    listActiveDrivers(),
  ]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-neutral-900">
        Viajes Pendientes de Asignacion
      </h2>
      <PendientesView trips={trips} drivers={drivers} />
    </div>
  );
}
