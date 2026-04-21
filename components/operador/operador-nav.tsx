"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/operador", label: "Inicio" },
  { href: "/operador/pendientes", label: "Pendientes" },
  { href: "/operador/chofer-asignado", label: "Chofer Asignado" },
  { href: "/operador/en-curso", label: "En Curso" },
  { href: "/operador/finalizadas", label: "Finalizadas" },
  { href: "/operador/toneladas", label: "Toneladas" },
  { href: "/operador/reportes", label: "Reportes" },
  { href: "/operador/clientes", label: "Clientes" },
  { href: "/operador/choferes", label: "Choferes" },
  { href: "/operador/configuracion", label: "Configuración" },
] as const;

const DOC_ITEMS = [
  { href: "/operador/remitos", label: "Remitos" },
  { href: "/operador/inspecciones", label: "Inspecciones" },
] as const;

export function OperadorNav() {
  const pathname = usePathname();
  const isDocumentationActive = DOC_ITEMS.some((item) =>
    pathname.startsWith(item.href),
  );

  return (
    <nav className="flex flex-wrap gap-1">
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/operador"
            ? pathname === "/operador"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-md px-3 py-2 text-sm font-medium transition ${
              isActive
                ? "bg-reysil-red text-white"
                : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
            }`}
          >
            {item.label}
          </Link>
        );
      })}

      <details className="relative">
        <summary
          className={`cursor-pointer list-none rounded-md px-3 py-2 text-sm font-medium transition ${
            isDocumentationActive
              ? "bg-reysil-red text-white"
              : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
          }`}
        >
          Documentacion
        </summary>
        <div className="absolute left-0 z-10 mt-1 min-w-44 rounded-md border border-neutral-200 bg-white p-1 shadow-lg">
          {DOC_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-md px-3 py-2 text-sm transition ${
                  isActive
                    ? "bg-reysil-red text-white"
                    : "text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </details>
    </nav>
  );
}
