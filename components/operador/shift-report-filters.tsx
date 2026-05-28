"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { DriverRow } from "@/lib/server/drivers/queries";

type Props = {
  drivers: DriverRow[];
  defaults: {
    desde: string;
    hasta: string;
    driverId: string;
    llegadaDespuesDe: string;
  };
};

export function ShiftReportFilters({ drivers, defaults }: Props) {
  const router = useRouter();
  const [desde, setDesde] = useState(defaults.desde);
  const [hasta, setHasta] = useState(defaults.hasta);
  const [driverId, setDriverId] = useState(defaults.driverId);
  const [llegadaDespuesDe, setLlegadaDespuesDe] = useState(
    defaults.llegadaDespuesDe,
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set("desde", desde);
    params.set("hasta", hasta);
    if (driverId) params.set("chofer", driverId);
    if (llegadaDespuesDe) params.set("hora", llegadaDespuesDe);
    router.push(`/operador/reportes/turnos?${params.toString()}`);
  }

  function handleReset() {
    setDriverId("");
    setLlegadaDespuesDe("");
    router.push("/operador/reportes/turnos");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-neutral-200 bg-white p-4"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-700">
            Desde
          </label>
          <input
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-reysil-red focus:outline-none focus:ring-1 focus:ring-reysil-red"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-700">
            Hasta
          </label>
          <input
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-reysil-red focus:outline-none focus:ring-1 focus:ring-reysil-red"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-700">
            Chofer
          </label>
          <select
            value={driverId}
            onChange={(e) => setDriverId(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-reysil-red focus:outline-none focus:ring-1 focus:ring-reysil-red"
          >
            <option value="">Todos</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.apellido}, {d.nombre} ({d.codigo})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-700">
            Llegada al depósito después de
          </label>
          <input
            type="time"
            value={llegadaDespuesDe}
            onChange={(e) => setLlegadaDespuesDe(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-reysil-red focus:outline-none focus:ring-1 focus:ring-reysil-red"
          />
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          className="rounded-md bg-reysil-red px-4 py-2 text-sm font-medium text-white hover:bg-reysil-red-dark"
        >
          Filtrar
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
        >
          Limpiar
        </button>
      </div>
    </form>
  );
}
