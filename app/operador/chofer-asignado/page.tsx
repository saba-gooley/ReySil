import {
  listAssignedTrips,
  listActiveDrivers,
} from "@/lib/server/assignments/queries";
import { AsignadoView } from "@/components/operador/asignado-view";

export default async function ChoferAsignadoPage() {
  const [trips, drivers] = await Promise.all([
    listAssignedTrips(),
    listActiveDrivers(),
  ]);

  // DEBUG: log raw trip data to see what Supabase returns
  console.log("DEBUG chofer-asignado trips:", JSON.stringify(trips.map(t => ({
    id: t.id,
    estado: t.estado,
    trip_assignments: t.trip_assignments,
    client: t.clients,
  })), null, 2));

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-neutral-900">
        Viajes con Chofer Asignado
      </h2>
      <AsignadoView trips={trips} drivers={drivers} />
    </div>
  );
}
