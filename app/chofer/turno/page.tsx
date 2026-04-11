import { getCurrentUser } from "@/lib/server/auth/get-current-user";
import { getTodayShift } from "@/lib/server/chofer/queries";
import { ShiftView } from "@/components/chofer/shift-view";

export default async function TurnoPage() {
  const user = await getCurrentUser();
  const driverId = user.profile.driver_id!;
  const shift = await getTodayShift(driverId);

  return (
    <div className="space-y-4 pb-16">
      <h2 className="text-base font-semibold text-neutral-900">
        Turno de hoy
      </h2>
      <ShiftView shift={shift} />
    </div>
  );
}
