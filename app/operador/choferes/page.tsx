import { listDrivers } from "@/lib/server/drivers/queries";
import { DriverTable } from "@/components/operador/driver-table";

export const metadata = { title: "Choferes — ReySil" };

export default async function ChoferesPage() {
  const drivers = await listDrivers();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-neutral-900">Choferes</h2>
      <DriverTable drivers={drivers} />
    </div>
  );
}
