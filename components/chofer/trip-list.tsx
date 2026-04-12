"use client";

import { useState } from "react";
import type { ChoferTripRow } from "@/lib/server/chofer/queries";
import { TripDataForm } from "./trip-data-form";

export function ChoferTripList({ trips }: { trips: ChoferTripRow[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (trips.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-neutral-400">
        No tenes viajes asignados para hoy.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {trips.map((trip) => {
        const isExpanded = expandedId === trip.id;
        const meta = (trip.trip_reparto_fields?.metadata ?? {}) as Record<string, unknown>;
        const horario = meta.horario as string | undefined;

        return (
          <div
            key={trip.id}
            className="rounded-lg border border-neutral-200 bg-white shadow-sm"
          >
            <button
              type="button"
              onClick={() => setExpandedId(isExpanded ? null : trip.id)}
              className="flex w-full items-start justify-between px-4 py-3 text-left"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <EstadoBadge estado={trip.estado} />
                  <span className="text-sm font-medium">{trip.tipo}</span>
                </div>
                <p className="text-xs text-neutral-500">
                  {trip.clients.nombre}
                </p>
                <p className="text-xs text-neutral-700">
                  {trip.destino_descripcion || "Sin destino"}
                </p>
                {trip.trip_assignments?.patente && (
                  <p className="text-xs font-mono text-neutral-400">
                    {trip.trip_assignments.patente}
                  </p>
                )}
              </div>
              <span className="text-neutral-400 text-xs mt-1">
                {isExpanded ? "▲" : "▼"}
              </span>
            </button>

            {isExpanded && (
              <div className="border-t border-neutral-100 px-4 py-4 space-y-4">
                {/* Trip header info: origen, destino, horario */}
                <div className="rounded-md bg-neutral-50 p-3 space-y-1">
                  <div className="flex gap-2 text-xs">
                    <span className="w-16 shrink-0 font-medium text-neutral-500">Origen:</span>
                    <span className="text-neutral-900">{trip.origen_descripcion || "—"}</span>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className="w-16 shrink-0 font-medium text-neutral-500">Destino:</span>
                    <span className="text-neutral-900">{trip.destino_descripcion || "—"}</span>
                  </div>
                  {horario && (
                    <div className="flex gap-2 text-xs">
                      <span className="w-16 shrink-0 font-medium text-neutral-500">Horario:</span>
                      <span className="text-neutral-900">{horario}</span>
                    </div>
                  )}
                </div>

                {/* Extra trip info */}
                <div className="space-y-1 text-xs">
                  {trip.observaciones_cliente && (
                    <p className="text-neutral-500">
                      Obs: {trip.observaciones_cliente}
                    </p>
                  )}
                  {trip.trip_reparto_fields && (
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-neutral-500">
                      {trip.trip_reparto_fields.peso_kg && (
                        <span>KG: {trip.trip_reparto_fields.peso_kg}</span>
                      )}
                      {trip.trip_reparto_fields.toneladas && (
                        <span>Tn: {trip.trip_reparto_fields.toneladas}</span>
                      )}
                      {trip.trip_reparto_fields.cantidad_bultos && (
                        <span>Bultos: {trip.trip_reparto_fields.cantidad_bultos}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Events timeline */}
                {trip.trip_events.length > 0 && (
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold text-neutral-400 uppercase">
                      Hitos registrados
                    </h4>
                    {trip.trip_events
                      .sort(
                        (a, b) =>
                          new Date(a.ocurrido_at).getTime() -
                          new Date(b.ocurrido_at).getTime(),
                      )
                      .map((ev) => (
                        <div
                          key={ev.id}
                          className="flex items-center gap-2 text-xs"
                        >
                          <span className="w-2 h-2 rounded-full bg-green-500" />
                          <span>{EVENT_LABELS[ev.tipo] ?? ev.tipo.replace(/_/g, " ")}</span>
                          <span className="text-neutral-400">
                            {new Date(ev.ocurrido_at).toLocaleTimeString("es-AR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      ))}
                  </div>
                )}

                {/* Remito status */}
                {trip.remitos.length > 0 && (
                  <div className="text-xs text-green-600 font-medium">
                    Remito subido
                  </div>
                )}

                {/* Trip data form */}
                <TripDataForm trip={trip} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const EVENT_LABELS: Record<string, string> = {
  LLEGADA_DESTINO_CLIENTE: "Llegada al cliente",
  SALIDA_CLIENTE: "Salida del cliente",
};

function EstadoBadge({ estado }: { estado: string }) {
  const colors: Record<string, string> = {
    ASIGNADO: "bg-blue-100 text-blue-700",
    EN_CURSO: "bg-green-100 text-green-700",
    FINALIZADO: "bg-neutral-100 text-neutral-600",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[estado] ?? "bg-neutral-100 text-neutral-600"}`}
    >
      {estado.replace("_", " ")}
    </span>
  );
}
