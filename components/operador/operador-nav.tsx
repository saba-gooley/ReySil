"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

const MAIN_ITEMS = [
  { href: "/operador", label: "Inicio" },
  { href: "/operador/disponibilidad", label: "Disponibilidad" },
  { href: "/operador/toneladas", label: "Toneladas" },
  { href: "/operador/reportes", label: "Reportes" },
] as const;

export function OperadorNav() {
  const pathname = usePathname();

  const isConfiguracionItemActive = (href: string) => {
    // For "General", only show as active if exactly at that page
    if (href === "/operador/configuracion") {
      return pathname === "/operador/configuracion";
    }
    // For other items, use startsWith
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

  return (
    <nav className="flex flex-wrap gap-1">
      {/* Main Items */}
      {MAIN_ITEMS.map((item) => {
        const isActive = isMainItemActive(item.href);
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

      {/* Solicitudes Dropdown */}
      <details className="relative">
        <summary
          className={`cursor-pointer list-none rounded-md px-3 py-2 text-sm font-medium transition ${
            isSolicitudesActive
              ? "bg-reysil-red text-white"
              : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
          }`}
        >
          Solicitudes
        </summary>
        <div className="absolute left-0 z-10 mt-1 min-w-48 rounded-md border border-neutral-200 bg-white p-1 shadow-lg">
          {SOLICITUDES_ITEMS.map((item) => {
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

      {/* Configuración Dropdown */}
      <details className="relative">
        <summary
          className={`cursor-pointer list-none rounded-md px-3 py-2 text-sm font-medium transition ${
            isConfiguracionActive
              ? "bg-reysil-red text-white"
              : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
          }`}
        >
          Configuración
        </summary>
        <div className="absolute left-0 z-10 mt-1 min-w-48 rounded-md border border-neutral-200 bg-white p-1 shadow-lg">
          {CONFIGURACION_ITEMS.map((item) => {
            const isActive = isConfiguracionItemActive(item.href);
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

      {/* Documentation Dropdown */}
      <details className="relative">
        <summary
          className={`cursor-pointer list-none rounded-md px-3 py-2 text-sm font-medium transition ${
            isDocumentationActive
              ? "bg-reysil-red text-white"
              : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
          }`}
        >
          Documentación
        </summary>
        <div className="absolute left-0 z-10 mt-1 min-w-48 rounded-md border border-neutral-200 bg-white p-1 shadow-lg">
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
