import { listShiftReport } from "@/lib/server/reports/shift-queries";
import { listActiveDrivers } from "@/lib/server/drivers/queries";
import { ShiftReportFilters } from "@/components/operador/shift-report-filters";
import { ShiftReportTable } from "@/components/operador/shift-report-table";
import { todayAR } from "@/lib/utils/date";

export const dynamic = "force-dynamic";

export default async function ShiftReportPage({
  searchParams,
}: {
  searchParams: {
    desde?: string;
    hasta?: string;
    chofer?: string;
    hora?: string;
  };
}) {
  const today = todayAR();
  const desde = searchParams.desde ?? today;
  const hasta = searchParams.hasta ?? today;
  const driverId = searchParams.chofer ?? "";
  const llegadaDespuesDe = searchParams.hora ?? "";

  const [rows, drivers] = await Promise.all([
    listShiftReport({
      fechaDesde: desde,
      fechaHasta: hasta,
      driverId: driverId || undefined,
      llegadaDespuesDe: llegadaDespuesDe || undefined,
    }),
    listActiveDrivers(),
  ]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-neutral-900">Control de Turno</h2>
      <ShiftReportFilters
        drivers={drivers}
        defaults={{ desde, hasta, driverId, llegadaDespuesDe }}
      />
      <ShiftReportTable rows={rows} />
    </div>
  );
}
