import {
  listAssignedTrips,
  listActiveDrivers,
} from "@/lib/server/assignments/queries";
import { AsignadoView } from "@/components/operador/asignado-view";

export default async function ChoferAsignadoPage() {
  let trips, drivers;
  try {
    [trips, drivers] = await Promise.all([
      listAssignedTrips(),
      listActiveDrivers(),
    ]);
  } catch (err) {
    console.error("[chofer-asignado] Error:", err);
    return <div className="p-4 text-red-600">Error al cargar datos. Revisar logs del servidor.</div>;
  }

  console.log("[chofer-asignado] trips count:", trips.length, "drivers count:", drivers.length);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-neutral-900">
        Viajes con Chofer Asignado
      </h2>
      <AsignadoView trips={trips} drivers={drivers} />
    </div>
  );
}
