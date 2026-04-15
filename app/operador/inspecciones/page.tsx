import { InspeccionesView } from "@/components/operador/inspecciones-view";
import { listInspections } from "@/lib/server/assignments/queries";

export const dynamic = "force-dynamic";

export default async function InspeccionesPage({
  searchParams,
}: {
  searchParams: { page?: string; from?: string; to?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const result = await listInspections({
    page,
    from: searchParams.from,
    to: searchParams.to,
  });

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-neutral-900">
        Panel de Inspecciones
      </h2>
      <InspeccionesView
        inspections={result.data}
        total={result.total}
        page={page}
        from={searchParams.from}
        to={searchParams.to}
      />
    </div>
  );
}
