import { CamionesContent } from "@/components/operador/camiones-content";
import { getAllTrucks } from "@/lib/server/trucks/queries";

export const dynamic = "force-dynamic";

export default async function CamionesPage() {
  const trucks = await getAllTrucks();

  return <CamionesContent initialTrucks={trucks} />;
}
