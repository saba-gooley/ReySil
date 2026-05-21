import { getCurrentUser } from "@/lib/server/auth/get-current-user";
import { listDriverTrips } from "@/lib/server/chofer/queries";
import { ChoferTripList } from "@/components/chofer/trip-list";

export const dynamic = "force-dynamic";

export default async function ChoferHomePage() {
  const user = await getCurrentUser();
  const driverId = user.profile.driver_id!;
  const trips = await listDriverTrips(driverId);

  return (
    <div className="space-y-4 pb-16">
      <h2 className="text-base font-semibold text-neutral-900">
        Mis viajes
      </h2>
      <ChoferTripList trips={trips} />
    </div>
  );
}
