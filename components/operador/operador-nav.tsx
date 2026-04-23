"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

const SOLICITUDES_ITEMS = [
  { href: "/operador/pendientes", label: "Pendientes" },
  { href: "/operador/chofer-asignado", label: "Chofer Asignado" },
  { href: "/operador/en-curso", label: "En Curso" },
  { href: "/operador/finalizadas", label: "Finalizadas" },
] as const;

const CONFIGURACION_ITEMS = [
  { href: "/operador/clientes", label: "Clientes" },
  { href: "/operador/choferes", label: "Choferes" },
  { href: "/operador/configuracion/camiones", label: "Camiones" },
  { href: "/operador/configuracion", label: "General" },
] as const;

const DOC_ITEMS = [
  { href: "/operador/remitos", label: "Remitos" },
  { href: "/operador/inspecciones", label: "Inspecciones" },
] as const;


type DropdownId = "solicitudes" | "configuracion" | "documentacion";

export function OperadorNav() {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<DropdownId | null>(null);
  const navRef = useRef<HTMLElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on navigation
  useEffect(() => {
    setOpenDropdown(null);
  }, [pathname]);

  const toggle = (id: DropdownId) =>
    setOpenDropdown((prev) => (prev === id ? null : id));

  const isConfiguracionItemActive = (href: string) => {
    if (href === "/operador/configuracion") return pathname === "/operador/configuracion";
    return pathname.startsWith(href);
  };

  const isSolicitudesActive = SOLICITUDES_ITEMS.some((item) =>
    pathname.startsWith(item.href),
  );
  const isConfiguracionActive = CONFIGURACION_ITEMS.some((item) =>
    isConfiguracionItemActive(item.href),
  );
  const isDocumentationActive = DOC_ITEMS.some((item) =>
    pathname.startsWith(item.href),
  );

  const isMainItemActive = (href: string) =>
    href === "/operador" ? pathname === "/operador" : pathname.startsWith(href);

  const dropdownClass = "absolute left-0 z-50 mt-1 min-w-48 rounded-md border border-neutral-200 bg-white p-1 shadow-lg";

  const triggerClass = (isActive: boolean) =>
    `cursor-pointer rounded-md px-3 py-2 text-sm font-medium transition ${
      isActive
        ? "bg-reysil-red text-white"
        : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
    }`;

  const itemClass = (isActive: boolean) =>
    `block rounded-md px-3 py-2 text-sm transition ${
      isActive ? "bg-reysil-red text-white" : "text-neutral-700 hover:bg-neutral-100"
    }`;

  return (
    <nav ref={navRef} className="flex flex-wrap gap-1">
      {/* Inicio */}
      <Link href="/operador" className={triggerClass(isMainItemActive("/operador"))}>
        Inicio
      </Link>

      {/* Solicitudes Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => toggle("solicitudes")}
          className={triggerClass(isSolicitudesActive)}
        >
          Solicitudes
        </button>
        {openDropdown === "solicitudes" && (
          <div className={dropdownClass}>
            {SOLICITUDES_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={itemClass(pathname.startsWith(item.href))}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Disponibilidad, Toneladas, Reportes */}
      {[
        { href: "/operador/disponibilidad", label: "Disponibilidad" },
        { href: "/operador/toneladas", label: "Toneladas" },
        { href: "/operador/reportes", label: "Reportes" },
      ].map((item) => (
        <Link key={item.href} href={item.href} className={triggerClass(isMainItemActive(item.href))}>
          {item.label}
        </Link>
      ))}

      {/* Configuración Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => toggle("configuracion")}
          className={triggerClass(isConfiguracionActive)}
        >
          Configuración
        </button>
        {openDropdown === "configuracion" && (
          <div className={dropdownClass}>
            {CONFIGURACION_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={itemClass(isConfiguracionItemActive(item.href))}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Documentación Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => toggle("documentacion")}
          className={triggerClass(isDocumentationActive)}
        >
          Documentación
        </button>
        {openDropdown === "documentacion" && (
          <div className={dropdownClass}>
            {DOC_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={itemClass(pathname.startsWith(item.href))}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
