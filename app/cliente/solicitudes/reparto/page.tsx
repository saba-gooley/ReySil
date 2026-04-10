import { getCurrentUser } from "@/lib/server/auth/get-current-user";
import { listClientDeposits } from "@/lib/server/trips/queries";
import { RepartoForm } from "@/components/cliente/reparto-form";
import Link from "next/link";

export const metadata = { title: "Solicitud Reparto — ReySil" };

export default async function RepartoPage() {
  const user = await getCurrentUser();
  const deposits = await listClientDeposits(user.profile.client_id!);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900">
          Solicitud de Reparto
        </h2>
        <Link
          href="/cliente/solicitudes/reparto/grilla"
          className="text-sm text-reysil-red hover:underline"
        >
          Cambiar a vista grilla
        </Link>
      </div>
      <RepartoForm deposits={deposits} />
    </div>
  );
}
