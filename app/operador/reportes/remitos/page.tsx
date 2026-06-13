import { listRemitosReport } from "@/lib/server/reports/remitos-report-queries";
import { RemitosReportTable } from "@/components/operador/remitos-report-table";

export const dynamic = "force-dynamic";
export const metadata = { title: "Reporte Remitos — ReySil" };

export default async function RemitosReportPage({
  searchParams,
}: {
  searchParams: {
    codigo?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    emailEnviado?: string;
  };
}) {
  const rows = await listRemitosReport({
    codigo: searchParams.codigo,
    fechaDesde: searchParams.fechaDesde,
    fechaHasta: searchParams.fechaHasta,
    emailEnviado: searchParams.emailEnviado as "si" | "no" | "" | undefined,
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-neutral-900">Reporte de Remitos</h2>
        <p className="text-sm text-neutral-500">
          Viajes EN_CURSO y FINALIZADOS con estado de envío de mail de remitos.
        </p>
      </div>
      <RemitosReportTable
        rows={rows}
        filters={{
          codigo: searchParams.codigo,
          fechaDesde: searchParams.fechaDesde,
          fechaHasta: searchParams.fechaHasta,
          emailEnviado: searchParams.emailEnviado,
        }}
      />
    </div>
  );
}
