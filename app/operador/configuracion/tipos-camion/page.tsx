import { getCurrentUser } from "@/lib/server/auth/get-current-user";
import { getAllTruckTypes } from "@/lib/server/truck-types/queries";
import { TruckTypeManager } from "@/components/operador/truck-type-manager";

export const dynamic = "force-dynamic";

export const metadata = { title: "Tipos de Camión — ReySil" };

export default async function TiposCamionPage() {
  const [user, truckTypes] = await Promise.all([
    getCurrentUser(),
    getAllTruckTypes(),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-neutral-900">
          Tipos de Camión
        </h2>
        <p className="text-sm text-neutral-500">
          Los tipos activos quedan disponibles en el formulario de solicitud de
          Reparto.
        </p>
      </div>
      <TruckTypeManager
        truckTypes={truckTypes}
        isAdmin={user.profile.role === "ADMIN"}
      />
    </div>
  );
}
