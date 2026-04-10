import { getCurrentUser } from "@/lib/server/auth/get-current-user";
import { listClientDeposits } from "@/lib/server/trips/queries";
import { RepartoGrid } from "@/components/cliente/reparto-grid";
import Link from "next/link";

export const metadata = { title: "Reparto — Vista Grilla — ReySil" };

export default async function RepartoGrillaPage() {
  const user = await getCurrentUser();
  const deposits = await listClientDeposits(user.profile.client_id!);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900">
          Reparto — Carga masiva
        </h2>
        <Link
          href="/cliente/solicitudes/reparto"
          className="text-sm text-reysil-red hover:underline"
        >
          Cambiar a vista formulario
        </Link>
      </div>
      <RepartoGrid deposits={deposits} />
    </div>
  );
}
