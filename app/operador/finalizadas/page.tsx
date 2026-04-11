import { listFinishedTrips } from "@/lib/server/assignments/queries";
import { FinalizadasView } from "@/components/operador/finalizadas-view";

export const dynamic = "force-dynamic";

export default async function FinalizadasPage({
  searchParams,
}: {
  searchParams: { page?: string; from?: string; to?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const { data: trips, total } = await listFinishedTrips({
    page,
    from: searchParams.from,
    to: searchParams.to,
  });

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-neutral-900">
        Viajes Finalizados
      </h2>
      <FinalizadasView
        trips={trips}
        total={total}
        page={page}
        from={searchParams.from}
        to={searchParams.to}
      />
    </div>
  );
}
