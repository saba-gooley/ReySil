import { listInProgressTrips } from "@/lib/server/assignments/queries";
import { TripTable } from "@/components/operador/trip-table";

export const dynamic = "force-dynamic";

export default async function EnCursoPage() {
  const trips = await listInProgressTrips();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-neutral-900">
        Viajes En Curso
      </h2>
      <TripTable
        trips={trips}
        showAssignment
        showEvents
        showRemitos
        sortByPatente
      />
    </div>
  );
}
