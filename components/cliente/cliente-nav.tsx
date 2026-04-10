"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/cliente", label: "Inicio" },
  { href: "/cliente/solicitudes", label: "Solicitudes" },
  { href: "/cliente/seguimiento", label: "Seguimiento" },
  { href: "/cliente/historial", label: "Historial" },
] as const;

export function ClienteNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1">
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/cliente"
            ? pathname === "/cliente"
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
