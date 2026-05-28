import { getReportData } from "@/lib/server/assignments/queries";
import { ReporteViajesChoferView } from "@/components/operador/reporte-viajes-chofer-view";
import { todayAR } from "@/lib/utils/date";

export const dynamic = "force-dynamic";

export default async function ViajesChoferPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string };
}) {
  const today = todayAR();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toLocaleDateString(
    "en-CA",
    { timeZone: "America/Argentina/Buenos_Aires" },
  );

  const from = searchParams.from ?? thirtyDaysAgo;
  const to = searchParams.to ?? today;

  const report = await getReportData(from, to);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-neutral-900">
        Viajes por Chofer
      </h2>
      <ReporteViajesChoferView rows={report.byDriver} total={report.total} from={from} to={to} />
    </div>
  );
}
