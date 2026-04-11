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

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-neutral-900">
        Viajes con Chofer Asignado
      </h2>
      {/* DEBUG: render raw data on page */}
      <details className="rounded border bg-yellow-50 p-3 text-xs">
        <summary className="cursor-pointer font-bold text-yellow-800">DEBUG: Raw trip data</summary>
        <pre className="mt-2 max-h-96 overflow-auto whitespace-pre-wrap">
          {JSON.stringify(trips.map(t => ({
            id: t.id,
            estado: t.estado,
            trip_assignments: t.trip_assignments,
            clients: t.clients,
          })), null, 2)}
        </pre>
      </details>
      <AsignadoView trips={trips} drivers={drivers} />
    </div>
  );
}
