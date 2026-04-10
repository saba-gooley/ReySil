import { getCurrentUser } from "@/lib/server/auth/get-current-user";
import { listActiveTrips } from "@/lib/server/trips/queries";
import { TripList } from "@/components/cliente/trip-list";

export const metadata = { title: "Seguimiento — ReySil" };

export default async function SeguimientoPage() {
  const user = await getCurrentUser();
  const trips = await listActiveTrips(user.profile.client_id!);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900">
          Viajes activos
        </h2>
        <span className="text-sm text-neutral-500">
          {trips.length} {trips.length === 1 ? "viaje" : "viajes"}
        </span>
      </div>
      <TripList trips={trips} />
    </div>
  );
}
