import { getReportData } from "@/lib/server/assignments/queries";
import { ReportesView } from "@/components/operador/reportes-view";

export default async function ReportesPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string };
}) {
  const today = new Date().toISOString().split("T")[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000)
    .toISOString()
    .split("T")[0];

  const from = searchParams.from ?? thirtyDaysAgo;
  const to = searchParams.to ?? today;

  const report = await getReportData(from, to);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-neutral-900">
        Modulo de Reportes
      </h2>
      <ReportesView report={report} from={from} to={to} />
    </div>
  );
}
