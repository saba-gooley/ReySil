import { getCurrentUser } from "@/lib/server/auth/get-current-user";
import { getTodayInspection } from "@/lib/server/chofer/queries";
import { InspectionView } from "@/components/chofer/inspection-view";

export default async function InspeccionPage() {
  const user = await getCurrentUser();
  const driverId = user.profile.driver_id!;
  const inspection = await getTodayInspection(driverId);

  return (
    <div className="space-y-4 pb-16">
      <h2 className="text-base font-semibold text-neutral-900">
        Inspeccion del camion
      </h2>
      <InspectionView inspection={inspection} />
    </div>
  );
}
