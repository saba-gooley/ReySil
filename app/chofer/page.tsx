import { getCurrentUser } from "@/lib/server/auth/get-current-user";
import { listTodayTrips } from "@/lib/server/chofer/queries";
import { ChoferTripList } from "@/components/chofer/trip-list";

export const dynamic = "force-dynamic";

export default async function ChoferHomePage() {
  const user = await getCurrentUser();
  const driverId = user.profile.driver_id!;
  const trips = await listTodayTrips(driverId);

  return (
    <div className="space-y-4 pb-16">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-neutral-900">
          Viajes de hoy
        </h2>
        <span className="rounded-full bg-reysil-red px-3 py-1 text-xs font-bold text-white">
          {trips.length}
        </span>
      </div>
      <ChoferTripList trips={trips} />
    </div>
  );
}
