import { listRemitos } from "@/lib/server/assignments/queries";
import { listClients } from "@/lib/server/clients/queries";
import { RemitosView } from "@/components/operador/remitos-view";

export const dynamic = "force-dynamic";

export default async function RemitosPage({
  searchParams,
}: {
  searchParams: { page?: string; from?: string; to?: string; clientId?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const [result, clients] = await Promise.all([
    listRemitos({
      page,
      from: searchParams.from,
      to: searchParams.to,
      clientId: searchParams.clientId,
    }),
    listClients(),
  ]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-neutral-900">
        Panel de Remitos
      </h2>
      <RemitosView
        remitos={result.data}
        total={result.total}
        page={page}
        from={searchParams.from}
        to={searchParams.to}
        clientId={searchParams.clientId}
        clients={clients}
      />
    </div>
  );
}
