import { listStopsReport } from "@/lib/server/reports/stops-queries";
import { listActiveDrivers } from "@/lib/server/drivers/queries";
import { StopsReportFilters } from "@/components/operador/stops-report-filters";
import { StopsReportTable } from "@/components/operador/stops-report-table";
import { todayAR } from "@/lib/utils/date";

export const dynamic = "force-dynamic";

export default async function ParadasReportPage({
  searchParams,
}: {
  searchParams: {
    desde?: string;
    hasta?: string;
    chofer?: string;
    motivo?: string;
  };
}) {
  const today = todayAR();
  const desde = searchParams.desde ?? today;
  const hasta = searchParams.hasta ?? today;
  const driverId = searchParams.chofer ?? "";
  const motivo = searchParams.motivo ?? "";

  const [rows, drivers] = await Promise.all([
    listStopsReport({
      fechaDesde: desde,
      fechaHasta: hasta,
      driverId: driverId || undefined,
      motivo: motivo || undefined,
    }),
    listActiveDrivers(),
  ]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-neutral-900">Paradas</h2>
      <StopsReportFilters
        drivers={drivers}
        defaults={{ desde, hasta, driverId, motivo }}
      />
      <StopsReportTable rows={rows} />
    </div>
  );
}
