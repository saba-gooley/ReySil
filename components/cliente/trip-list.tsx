"use client";

import { useState } from "react";
import type { TripRow } from "@/lib/server/trips/queries";

const ESTADO_LABELS: Record<string, { label: string; color: string }> = {
  PENDIENTE: { label: "Pendiente", color: "bg-yellow-100 text-yellow-700" },
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
    <div className="space-y-3">
      {trips.map((trip) => {
        const isExpanded = expandedId === trip.id;
        const estado = ESTADO_LABELS[trip.estado] ?? {
          label: trip.estado,
          color: "bg-neutral-100 text-neutral-600",
        };
        const assignment = trip.trip_assignments;

        return (
          <div
            key={trip.id}
            className="rounded-lg border border-neutral-200 bg-white shadow-sm"
          >
            {/* Header row */}
            <button
              type="button"
              onClick={() => setExpandedId(isExpanded ? null : trip.id)}
              className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-neutral-50"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${estado.color}`}
                >
                  {estado.label}
                </span>
                <span className="text-sm font-medium text-neutral-900">
                  {trip.tipo}
                </span>
                {trip.fecha_solicitada && (
                  <span className="text-xs text-neutral-500">
                    {new Date(trip.fecha_solicitada + "T00:00:00").toLocaleDateString("es-AR")}
                  </span>
                )}
                {trip.destino_descripcion && (
                  <span className="text-xs text-neutral-500">
                    → {trip.destino_descripcion}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {assignment && (
                  <span className="text-xs text-neutral-500">
                    {assignment.drivers.nombre} {assignment.drivers.apellido} — {assignment.patente}
                  </span>
                )}
                <span className="text-neutral-400">{isExpanded ? "▲" : "▼"}</span>
              </div>
            </button>

            {/* Expanded detail */}
            {isExpanded && (
              <div className="border-t border-neutral-100 px-4 py-4">
                <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                  {/* Trip info */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase text-neutral-400">
                      Datos del viaje
                    </h4>
                    <dl className="space-y-1">
                      <Row label="Tipo" value={trip.tipo} />
                      <Row label="Estado" value={estado.label} />
                      <Row
                        label="Fecha solicitada"
                        value={
                          trip.fecha_solicitada
                            ? new Date(trip.fecha_solicitada + "T00:00:00").toLocaleDateString("es-AR")
                            : null
                        }
                      />
                      <Row label="Destino" value={trip.destino_descripcion} />
                      <Row label="Observaciones" value={trip.observaciones_cliente} />
                    </dl>
                  </div>

                  {/* Reparto fields */}
                  {trip.trip_reparto_fields && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold uppercase text-neutral-400">
                        Datos de carga
                      </h4>
                      <dl className="space-y-1">
                        <Row label="NDV" value={trip.trip_reparto_fields.ndv} />
                        <Row label="PAL" value={trip.trip_reparto_fields.pal?.toString()} />
                        <Row label="CAT" value={trip.trip_reparto_fields.cat} />
                        <Row label="Peso (kg)" value={trip.trip_reparto_fields.peso_kg?.toString()} />
                        <Row label="Bultos" value={trip.trip_reparto_fields.cantidad_bultos?.toString()} />
                      </dl>
                    </div>
                  )}

                  {/* Container info */}
                  {trip.containers && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold uppercase text-neutral-400">
                        Contenedor
                      </h4>
                      <dl className="space-y-1">
                        <Row label="Numero" value={trip.containers.numero} />
                        <Row label="Tipo" value={trip.containers.tipo} />
                        <Row label="Peso (kg)" value={trip.containers.peso_carga_kg?.toString()} />
                      </dl>
                    </div>
                  )}

                  {/* Assignment */}
                  {assignment && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold uppercase text-neutral-400">
                        Chofer asignado
                      </h4>
                      <dl className="space-y-1">
                        <Row
                          label="Chofer"
                          value={`${assignment.drivers.nombre} ${assignment.drivers.apellido}`}
                        />
                        <Row label="Patente" value={assignment.patente} />
                      </dl>
                    </div>
                  )}

                  {/* Events */}
                  {trip.trip_events.length > 0 && (
                    <div className="space-y-2 sm:col-span-2">
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
                  {trip.remitos.length > 0 && (
                    <div className="space-y-2 sm:col-span-2">
                      <h4 className="text-xs font-semibold uppercase text-neutral-400">
                        Remitos
                      </h4>
                      <ul className="flex flex-wrap gap-2">
                        {trip.remitos.map((r) => (
                          <li key={r.id}>
                            {r.foto_url ? (
                              <a
                                href={r.foto_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-reysil-red hover:underline"
                              >
                                Ver remito ({r.estado})
                              </a>
                            ) : (
                              <span className="text-xs text-neutral-400">
                                Remito pendiente
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
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
