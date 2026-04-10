import { notFound } from "next/navigation";
import { getDriverById } from "@/lib/server/drivers/queries";
import { DriverForm } from "@/components/operador/driver-form";

export const metadata = { title: "Editar Chofer — ReySil" };

export default async function EditChoferPage({
  params,
}: {
  params: { id: string };
}) {
  let driver;
  try {
    driver = await getDriverById(params.id);
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h2 className="text-lg font-semibold text-neutral-900">
        Editar chofer: {driver.nombre} {driver.apellido}
      </h2>
      <DriverForm driver={driver} />
    </div>
  );
}
