import Link from "next/link";

export const metadata = { title: "Panel Admin — ReySil" };

const SECTIONS = [
  {
    href: "/admin/operadores",
    label: "Operadores",
    desc: "ABM de operadores de ReySil — crear, editar y activar/desactivar accesos",
    highlight: true,
  },
  {
    href: "/operador",
    label: "Panel Operadores",
    desc: "Acceder al panel de operadores completo (solicitudes, asignaciones, reportes)",
  },
];

export default function AdminHomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-neutral-900">Panel de Administración</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Acceso exclusivo para administradores de ReySil.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className={`rounded-lg border p-4 shadow-sm transition hover:shadow-md ${
              s.highlight
                ? "border-reysil-red bg-reysil-red-light hover:border-reysil-red"
                : "border-neutral-200 bg-white hover:border-reysil-red"
            }`}
          >
            <h3 className={`text-sm font-semibold ${s.highlight ? "text-reysil-red" : "text-neutral-900"}`}>
              {s.label}
            </h3>
            <p className="mt-1 text-xs text-neutral-500">{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
