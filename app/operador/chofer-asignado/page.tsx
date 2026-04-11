import {
  listAssignedTrips,
  listActiveDrivers,
} from "@/lib/server/assignments/queries";
import { AsignadoView } from "@/components/operador/asignado-view";

export const dynamic = "force-dynamic";

export default async function ChoferAsignadoPage() {
  const [trips, drivers] = await Promise.all([
    listAssignedTrips(),
    listActiveDrivers(),
  ]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-neutral-900">
        Viajes con Chofer Asignado
      </h2>
      <AsignadoView trips={trips} drivers={drivers} />
    </div>
  );
}
