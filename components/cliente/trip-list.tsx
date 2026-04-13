"use client";

import { useState } from "react";
import type { TripRow } from "@/lib/server/trips/queries";

const ESTADO_LABELS: Record<string, { label: string; color: string }> = {
  PENDIENTE: { label: "Pendiente", color: "bg-yellow-100 text-yellow-700" },
  PREASIGNADO: { label: "Preasignado", color: "bg-orange-100 text-orange-700" },
  ASIGNADO: { label: "Chofer asignado", color: "bg-blue-100 text-blue-700" },
  EN_CURSO: { label: "En curso", color: "bg-green-100 text-green-700" },
  FINALIZADO: { label: "Finalizado", color: "bg-neutral-100 text-neutral-600" },
  CANCELADO: { label: "Cancelado", color: "bg-red-100 text-red-600" },
};

export function TripList({ trips }: { trips: TripRow[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (trips.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-neutral-400">
        No hay viajes para mostrar.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase text-neutral-500">
          <tr>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3">Tipo</th>
            <th className="px-4 py-3">Fecha</th>
            <th className="px-4 py-3">Origen</th>
            <th className="px-4 py-3">Destino</th>
            <th className="px-4 py-3">Chofer / Patente</th>
            <th className="px-4 py-3 w-8"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {trips.map((trip) => {
            const isExpanded = expandedId === trip.id;
            const estado = ESTADO_LABELS[trip.estado] ?? {
              label: trip.estado,
              color: "bg-neutral-100 text-neutral-600",
            };

            return (
              <TripRowComponent
                key={trip.id}
                trip={trip}
                estado={estado}
                isExpanded={isExpanded}
                onToggle={() => setExpandedId(isExpanded ? null : trip.id)}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function TripRowComponent({
  trip,
  estado,
  isExpanded,
  onToggle,
}: {
  trip: TripRow;
  estado: { label: string; color: string };
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const assignment = trip.trip_assignments;

  return (
    <>
      <tr
        className="cursor-pointer hover:bg-neutral-50"
        onClick={onToggle}
      >
        <td className="px-4 py-3">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${estado.color}`}
          >
            {estado.label}
          </span>
        </td>
        <td className="px-4 py-3 text-xs font-medium">{trip.tipo}</td>
        <td className="px-4 py-3 text-xs text-neutral-500">
          {trip.fecha_solicitada
            ? new Date(trip.fecha_solicitada + "T00:00:00").toLocaleDateString("es-AR")
            : "—"}
        </td>
        <td className="px-4 py-3 text-sm">
          {trip.origen_descripcion || "—"}
        </td>
        <td className="px-4 py-3 text-sm">
          {trip.destino_descripcion || "—"}
        </td>
        <td className="px-4 py-3 text-xs text-neutral-500">
          {assignment
            ? `${assignment.drivers.nombre} ${assignment.drivers.apellido} — ${assignment.patente}`
            : "—"}
        </td>
        <td className="px-4 py-3 text-neutral-400 text-xs">
          {isExpanded ? "▲" : "▼"}
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={7} className="bg-neutral-50 px-4 py-4">
            <TripDetail trip={trip} />
          </td>
        </tr>
      )}
    </>
  );
}

function TripDetail({ trip }: { trip: TripRow }) {
  const meta = (trip.trip_reparto_fields?.metadata ?? {}) as Record<string, unknown>;
  const res = trip.containers?.reservations;

  return (
    <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
      {/* Trip info */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase text-neutral-400">
          Datos del viaje
        </h4>
        <dl className="space-y-1">
          <Row label="Tipo" value={trip.tipo} />
          <Row label="Estado" value={ESTADO_LABELS[trip.estado]?.label ?? trip.estado} />
          <Row
            label="Fecha"
            value={
              trip.fecha_solicitada
                ? new Date(trip.fecha_solicitada + "T00:00:00").toLocaleDateString("es-AR")
                : null
            }
          />
          <Row label="Origen" value={trip.origen_descripcion} />
          <Row label="Destino" value={trip.destino_descripcion} />
          <Row label="Observaciones" value={trip.observaciones_cliente} />
        </dl>
      </div>

      {/* Reparto fields */}
      {trip.tipo === "REPARTO" && trip.trip_reparto_fields && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase text-neutral-400">
            Datos de carga
          </h4>
          <dl className="space-y-1">
            <Row label="NDV" value={trip.trip_reparto_fields.ndv} />
            <Row label="PAL" value={trip.trip_reparto_fields.pal?.toString()} />
            <Row label="CAT" value={trip.trip_reparto_fields.cat} />
            <Row label="Nro UN" value={trip.trip_reparto_fields.nro_un} />
            <Row label="KG netos" value={trip.trip_reparto_fields.peso_kg?.toString()} />
            <Row label="Toneladas" value={trip.trip_reparto_fields.toneladas?.toString()} />
            <Row label="Bultos" value={trip.trip_reparto_fields.cantidad_bultos?.toString()} />
            <Row label="Tipo camion" value={meta.tipo_camion as string} />
            <Row label="Peon" value={meta.peon as string} />
            <Row label="Horario" value={meta.horario as string} />
            <Row label="Hoja de ruta" value={meta.hoja_de_ruta as string} />
          </dl>
        </div>
      )}

      {/* Contenedor fields */}
      {trip.tipo === "CONTENEDOR" && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase text-neutral-400">
            Datos del contenedor
          </h4>
          <dl className="space-y-1">
            <Row label="Contenedor" value={trip.containers?.numero} />
            <Row label="Tipo" value={trip.containers?.tipo} />
            <Row label="Peso (kg)" value={trip.containers?.peso_carga_kg?.toString()} />
            {trip.containers?.precintos && trip.containers.precintos.length > 0 && (
              <Row label="Precintos" value={trip.containers.precintos.join(", ")} />
            )}
            <Row label="Observaciones" value={trip.containers?.observaciones} />
            {res && (
              <>
                <Row label="Orden" value={res.orden} />
                <Row label="Mercaderia" value={res.mercaderia} />
                <Row label="Despacho" value={res.despacho} />
                <Row label="Carga" value={res.carga} />
                <Row label="Terminal" value={res.terminal} />
                <Row label="Devuelve en" value={res.devuelve_en} />
                <Row
                  label="Libre hasta"
                  value={
                    res.libre_hasta
                      ? new Date(res.libre_hasta + "T00:00:00").toLocaleDateString("es-AR")
                      : null
                  }
                />
                <Row label="Booking" value={res.numero_booking} />
                <Row label="Naviera" value={res.naviera} />
                <Row label="Buque" value={res.buque} />
                <Row
                  label="Fecha arribo"
                  value={
                    res.fecha_arribo
                      ? new Date(res.fecha_arribo + "T00:00:00").toLocaleDateString("es-AR")
                      : null
                  }
                />
                <Row
                  label="Fecha carga"
                  value={
                    res.fecha_carga
                      ? new Date(res.fecha_carga + "T00:00:00").toLocaleDateString("es-AR")
                      : null
                  }
                />
                <Row label="Obs. reserva" value={res.observaciones} />
              </>
            )}
          </dl>
        </div>
      )}

      {/* Assignment */}
      {trip.trip_assignments && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase text-neutral-400">
            Chofer asignado
          </h4>
          <dl className="space-y-1">
            <Row
              label="Chofer"
              value={`${trip.trip_assignments.drivers.nombre} ${trip.trip_assignments.drivers.apellido}`}
            />
            <Row label="Patente" value={trip.trip_assignments.patente} />
          </dl>
        </div>
      )}

      {/* Events */}
      {trip.trip_events.length > 0 && (
        <div className="space-y-2 sm:col-span-3">
          <h4 className="text-xs font-semibold uppercase text-neutral-400">
            Hitos del viaje
          </h4>
          <ul className="space-y-1">
            {trip.trip_events
              .sort(
                (a, b) =>
                  new Date(a.ocurrido_at).getTime() -
                  new Date(b.ocurrido_at).getTime(),
              )
              .map((ev) => (
                <li
                  key={ev.id}
                  className="flex items-center gap-2 text-xs"
                >
                  <span className="w-2 h-2 rounded-full bg-reysil-red" />
                  <span className="font-medium">
                    {ev.tipo.replace(/_/g, " ")}
                  </span>
                  <span className="text-neutral-500">
                    {new Date(ev.ocurrido_at).toLocaleString("es-AR")}
                  </span>
                  {ev.observaciones && (
                    <span className="text-neutral-400">
                      — {ev.observaciones}
                    </span>
                  )}
                </li>
              ))}
          </ul>
        </div>
      )}

      {/* Remitos */}
      <div className="space-y-2 sm:col-span-3">
        <h4 className="text-xs font-semibold uppercase text-neutral-400">
          Remitos
        </h4>
        {trip.remitos.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {trip.remitos.map((r) => (
              <li key={r.id}>
                {r.drive_url ? (
                  <a
                    href={r.drive_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-green-600 hover:underline"
                  >
                    Ver remito
                  </a>
                ) : (
                  <span className="text-xs text-neutral-400">
                    Remito pendiente
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-neutral-400">No hay remito cargado</p>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex gap-2">
      <dt className="w-28 shrink-0 text-neutral-500">{label}:</dt>
      <dd className="text-neutral-900">{value}</dd>
    </div>
  );
}
