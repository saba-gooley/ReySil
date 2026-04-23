import Link from "next/link";

export const metadata = { title: "Nueva Solicitud — ReySil" };

export default function NuevaSolicitudPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h2 className="text-lg font-semibold text-neutral-900">Nueva Solicitud</h2>
      <p className="text-sm text-neutral-500">
        Seleccioná el tipo de solicitud a cargar en nombre del cliente.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/operador/solicitudes/reparto"
          className="rounded-lg border-2 border-neutral-200 bg-white p-6 text-center shadow-sm transition hover:border-reysil-red hover:shadow-md"
        >
          <h3 className="text-base font-semibold text-neutral-900">Reparto</h3>
          <p className="mt-2 text-sm text-neutral-500">
            Carga de mercadería con datos de bultos, peso y toneladas
          </p>
        </Link>
        <Link
          href="/operador/solicitudes/contenedor"
          className="rounded-lg border-2 border-neutral-200 bg-white p-6 text-center shadow-sm transition hover:border-reysil-red hover:shadow-md"
        >
          <h3 className="text-base font-semibold text-neutral-900">Contenedor</h3>
          <p className="mt-2 text-sm text-neutral-500">
            Reserva y viaje de contenedor con número de booking
          </p>
        </Link>
      </div>
    </div>
  );
}
