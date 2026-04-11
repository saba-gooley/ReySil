import { getToneladasByDate } from "@/lib/server/assignments/queries";
import { ToneladasView } from "@/components/operador/toneladas-view";

export const dynamic = "force-dynamic";

export default async function ToneladasPage({
  searchParams,
}: {
  searchParams: { fecha?: string };
}) {
  const fecha =
    searchParams.fecha ?? new Date().toISOString().split("T")[0];
  const data = await getToneladasByDate(fecha);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-neutral-900">
        Resumen de Toneladas por Camion
      </h2>
      <ToneladasView data={data} fecha={fecha} />
    </div>
  );
}
