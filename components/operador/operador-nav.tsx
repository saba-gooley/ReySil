"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/operador", label: "Inicio" },
  { href: "/operador/pendientes", label: "Pendientes" },
  { href: "/operador/chofer-asignado", label: "Chofer Asignado" },
  { href: "/operador/en-curso", label: "En Curso" },
  { href: "/operador/finalizadas", label: "Finalizadas" },
  { href: "/operador/remitos", label: "Remitos" },
  { href: "/operador/toneladas", label: "Toneladas" },
  { href: "/operador/reportes", label: "Reportes" },
  { href: "/operador/clientes", label: "Clientes" },
  { href: "/operador/choferes", label: "Choferes" },
] as const;

export function OperadorNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto">
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
    </nav>
  );
}
