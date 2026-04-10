"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { DriverRow } from "@/lib/server/drivers/queries";
import { toggleDriverAction } from "@/lib/server/drivers/actions";
import { useState } from "react";

export function DriverTable({ drivers }: { drivers: DriverRow[] }) {
  const [filter, setFilter] = useState("");

  const filtered = drivers.filter((d) => {
    const q = filter.toLowerCase();
    return (
      d.codigo.toLowerCase().includes(q) ||
      d.dni.toLowerCase().includes(q) ||
      d.nombre.toLowerCase().includes(q) ||
      d.apellido.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <input
          type="text"
          placeholder="Buscar por codigo, DNI o nombre..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full max-w-sm rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-reysil-red focus:outline-none focus:ring-1 focus:ring-reysil-red"
        />
        <Link
          href="/operador/choferes/nuevo"
          className="rounded-md bg-reysil-red px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-reysil-red-dark"
        >
          Nuevo chofer
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50">
            <tr>
              <th className="px-4 py-3 font-medium text-neutral-600">Codigo</th>
              <th className="px-4 py-3 font-medium text-neutral-600">DNI</th>
              <th className="px-4 py-3 font-medium text-neutral-600">Nombre</th>
              <th className="px-4 py-3 font-medium text-neutral-600">Telefono</th>
              <th className="px-4 py-3 font-medium text-neutral-600">Estado</th>
              <th className="px-4 py-3 font-medium text-neutral-600">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-400">
                  {filter
                    ? "No se encontraron choferes con ese criterio"
                    : "No hay choferes registrados"}
                </td>
              </tr>
            ) : (
              filtered.map((driver) => (
                <tr key={driver.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 font-mono text-xs">
                    {driver.codigo}
                  </td>
                  <td className="px-4 py-3">{driver.dni}</td>
                  <td className="px-4 py-3 font-medium">
                    {driver.apellido}, {driver.nombre}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {driver.telefono ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        driver.activo
                          ? "bg-green-100 text-green-700"
                          : "bg-neutral-100 text-neutral-500"
                      }`}
                    >
                      {driver.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/operador/choferes/${driver.id}`}
                        className="text-sm text-reysil-red hover:underline"
                      >
                        Editar
                      </Link>
                      <ToggleButton driver={driver} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ToggleButton({ driver }: { driver: DriverRow }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleToggle() {
    const confirmed = window.confirm(
      driver.activo
        ? `¿Dar de baja a "${driver.nombre} ${driver.apellido}"? No podra acceder a la app.`
        : `¿Reactivar a "${driver.nombre} ${driver.apellido}"?`,
    );
    if (!confirmed) return;

    setLoading(true);
    const result = await toggleDriverAction(driver.id, !driver.activo);
    setLoading(false);

    if (result.error) {
      alert(result.error);
    } else {
      router.refresh();
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="text-sm text-neutral-500 hover:underline disabled:opacity-50"
    >
      {loading ? "..." : driver.activo ? "Dar de baja" : "Reactivar"}
    </button>
  );
}
