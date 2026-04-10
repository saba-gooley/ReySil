import Link from "next/link";

export const metadata = { title: "Solicitudes — ReySil" };

export default function SolicitudesPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-neutral-900">
        Nueva solicitud
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/cliente/solicitudes/reparto"
          className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm transition hover:border-reysil-red hover:shadow-md"
        >
          <h3 className="text-base font-semibold text-neutral-900">Reparto</h3>
          <p className="mt-2 text-sm text-neutral-500">
            Solicitar viaje de transporte de mercaderia. Podes cargar uno por
            formulario o varios a la vez en la grilla.
          </p>
        </Link>
        <Link
          href="/cliente/solicitudes/contenedor"
          className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm transition hover:border-reysil-red hover:shadow-md"
        >
          <h3 className="text-base font-semibold text-neutral-900">
            Contenedor
          </h3>
          <p className="mt-2 text-sm text-neutral-500">
            Crear una reserva con uno o mas contenedores. Cada contenedor genera
            un viaje independiente.
          </p>
        </Link>
      </div>
    </div>
  );
}
