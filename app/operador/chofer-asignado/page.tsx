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

  const debug = (listAssignedTrips as unknown as Record<string, unknown>)._debug ?? {};

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-neutral-900">
        Viajes con Chofer Asignado
      </h2>
      {/* DEBUG: render raw Supabase response */}
      <details open className="rounded border bg-yellow-50 p-3 text-xs">
        <summary className="cursor-pointer font-bold text-yellow-800">DEBUG: Raw Supabase response</summary>
        <pre className="mt-2 max-h-96 overflow-auto whitespace-pre-wrap">
          {JSON.stringify(debug, null, 2)}
        </pre>
      </details>
      <AsignadoView trips={trips} drivers={drivers} />
    </div>
  );
}
