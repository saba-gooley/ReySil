import { getCurrentUser } from "@/lib/server/auth/get-current-user";
import { listClientDeposits } from "@/lib/server/trips/queries";
import { ContenedorForm } from "@/components/cliente/contenedor-form";

export const metadata = { title: "Solicitud Contenedor — ReySil" };

export default async function ContenedorPage() {
  const user = await getCurrentUser();
  const deposits = await listClientDeposits(user.profile.client_id!);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h2 className="text-lg font-semibold text-neutral-900">
        Solicitud de Contenedor
      </h2>
      <ContenedorForm deposits={deposits} />
    </div>
  );
}
