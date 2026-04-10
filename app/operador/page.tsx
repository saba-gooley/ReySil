import Link from "next/link";

const SECTIONS = [
  {
    href: "/operador/pendientes",
    label: "Pendientes",
    desc: "Viajes sin chofer asignado — asignar chofer y patente",
  },
  {
    href: "/operador/chofer-asignado",
    label: "Chofer Asignado",
    desc: "Viajes asignados — reasignar antes de que el chofer inicie",
  },
  {
    href: "/operador/en-curso",
    label: "En Curso",
    desc: "Viajes iniciados por choferes — seguimiento en tiempo real",
  },
  {
    href: "/operador/finalizadas",
    label: "Finalizadas",
    desc: "Viajes completados — historial con detalle y remitos",
  },
  {
    href: "/operador/remitos",
    label: "Remitos",
    desc: "Panel de remitos subidos por choferes — filtrar por fecha y cliente",
  },
  {
    href: "/operador/toneladas",
    label: "Toneladas",
    desc: "Resumen de toneladas por camion para una fecha",
  },
  {
    href: "/operador/reportes",
    label: "Reportes",
    desc: "Viajes por cliente y por chofer en rango de fechas",
  },
  {
    href: "/operador/clientes",
    label: "Clientes",
    desc: "ABM de clientes, emails y depositos",
  },
  {
    href: "/operador/choferes",
    label: "Choferes",
    desc: "ABM de choferes con generacion de credenciales",
  },
];

export default function OperadorHomePage() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-neutral-900">
        Panel de Operadores
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm transition hover:border-reysil-red hover:shadow-md"
          >
            <h3 className="text-sm font-semibold text-neutral-900">
              {s.label}
            </h3>
            <p className="mt-1 text-xs text-neutral-500">{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
