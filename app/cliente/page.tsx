import Link from "next/link";

export default function ClienteHomePage() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-neutral-900">
        Portal del Cliente
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/cliente/solicitudes"
          className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-reysil-red hover:shadow-md"
        >
          <h3 className="font-semibold text-neutral-900">Solicitudes</h3>
          <p className="mt-1 text-sm text-neutral-500">
            Crear viajes de Reparto o Contenedor
          </p>
        </Link>
        <Link
          href="/cliente/seguimiento"
          className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-reysil-red hover:shadow-md"
        >
          <h3 className="font-semibold text-neutral-900">Seguimiento</h3>
          <p className="mt-1 text-sm text-neutral-500">
            Ver estado de viajes activos en tiempo real
          </p>
        </Link>
        <Link
          href="/cliente/historial"
          className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-reysil-red hover:shadow-md"
        >
          <h3 className="font-semibold text-neutral-900">Historial</h3>
          <p className="mt-1 text-sm text-neutral-500">
            Consultar viajes finalizados y remitos
          </p>
        </Link>
      </div>
    </div>
  );
}
