"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/chofer", label: "Viajes" },
  { href: "/chofer/turno", label: "Turno" },
  { href: "/chofer/inspeccion", label: "Inspeccion" },
] as const;

export function ChoferNav() {
  const pathname = usePathname();

  return (
    <div className="mx-auto flex max-w-lg justify-around py-2">
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/chofer"
            ? pathname === "/chofer"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center px-4 py-1 text-xs font-medium transition ${
              isActive
                ? "text-reysil-red"
                : "text-neutral-400 hover:text-neutral-600"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
