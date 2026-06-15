"use client";

import { useState, useTransition } from "react";
import type { ChoferTripRow } from "@/lib/server/chofer/queries";
import { TripDataForm } from "./trip-data-form";
import { updateDestinationHoraAction } from "@/lib/server/chofer/trip-actions";

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

function formatShortDate(dateStr: string): string {
  const [, month, day] = dateStr.split("-");
  return `${day}/${month}`;
}

function formatLongDate(dateStr: string): string {
  const date = new Date(`${dateStr}T12:00:00`);
  return date.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

const EVENT_LABELS: Record<string, string> = {
  LLEGADA_DESTINO_CLIENTE: "Llegada al cliente",
  SALIDA_CLIENTE: "Salida del cliente",
};

export function ChoferTripList({ trips }: { trips: ChoferTripRow[] }) {
  const today = getTodayStr();

  const pastTrips = trips.filter(
    (t) => t.fecha_solicitada && t.fecha_solicitada < today,
  );
  const todayTrips = trips.filter(
    (t) => !t.fecha_solicitada || t.fecha_solicitada === today,
  );
  const futureTrips = trips.filter(
    (t) => t.fecha_solicitada && t.fecha_solicitada > today,
  );

  if (trips.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-neutral-400">
        No tenes viajes asignados.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {pastTrips.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wide text-amber-700">
              ⚠ En curso
            </span>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
              {pastTrips.length}
            </span>
          </div>
          <div className="space-y-3">
            {pastTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} showDate />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-3 flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wide text-neutral-600">
            Hoy — {formatShortDate(today)}
          </span>
          {todayTrips.length > 0 && (
            <span className="rounded-full bg-reysil-red px-2 py-0.5 text-xs font-bold text-white">
              {todayTrips.length}
            </span>
          )}
        </div>
        {todayTrips.length === 0 ? (
          <p className="text-sm text-neutral-400">Sin viajes para hoy.</p>
        ) : (
          <div className="space-y-3">
            {todayTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </section>

      {futureTrips.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wide text-neutral-600">
              Próximos
            </span>
            <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-xs font-bold text-neutral-600">
              {futureTrips.length}
            </span>
          </div>
          <div className="space-y-3">
            {futureTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} showDate readOnly />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function TripCard({
  trip,
  showDate = false,
  readOnly = false,
}: {
  trip: ChoferTripRow;
  showDate?: boolean;
  readOnly?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const meta = (trip.trip_reparto_fields?.metadata ?? {}) as Record<
    string,
    unknown
  >;
  const horario = meta.horario as string | undefined;

  return (
    <div className="rounded-lg border border-neutral-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-start justify-between px-4 py-3 text-left"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <EstadoBadge estado={trip.estado} />
            <span className="text-sm font-medium">{trip.tipo}</span>
            <span className="font-mono text-xs text-neutral-500">
              {trip.codigo}
            </span>
            {showDate && trip.fecha_solicitada && (
              <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs font-mono text-neutral-500">
                {formatShortDate(trip.fecha_solicitada)}
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-500">{trip.clients.nombre}</p>
          <p className="text-xs text-neutral-700">
            {trip.trip_destinations.length > 0
              ? `Múltiples destinos (${trip.trip_destinations.length})`
              : (trip.destino_descripcion || "Sin destino")}
          </p>
          {trip.trip_assignments?.patente && (
            <p className="text-xs font-mono text-neutral-400">
              {trip.trip_assignments.patente}
            </p>
          )}
        </div>
        <span className="mt-1 text-xs text-neutral-400">
          {isExpanded ? "▲" : "▼"}
        </span>
      </button>

      {isExpanded && (
        <div className="space-y-4 border-t border-neutral-100 px-4 py-4">
          <div className="rounded-md bg-neutral-50 p-3 space-y-1">
            {showDate && trip.fecha_solicitada && (
              <div className="flex gap-2 text-xs">
                <span className="w-16 shrink-0 font-medium text-neutral-500">
                  Fecha:
                </span>
                <span className="text-neutral-900 capitalize">
                  {formatLongDate(trip.fecha_solicitada)}
                </span>
              </div>
            )}
            <div className="flex gap-2 text-xs">
              <span className="w-16 shrink-0 font-medium text-neutral-500">
                Origen:
              </span>
              <span className="text-neutral-900">
                {trip.origen_descripcion || "—"}
              </span>
            </div>
            {trip.trip_destinations.length > 0 ? (
              <div className="space-y-1">
                <span className="text-xs font-medium text-neutral-500">Destinos:</span>
                <div className="space-y-2">
                  {trip.trip_destinations
                    .sort((a, b) => a.orden - b.orden)
                    .map((d, i) => (
                      <DestinationHoraRow
                        key={d.id}
                        index={i + 1}
                        destination={d}
                        isEnCurso={trip.estado === "EN_CURSO"}
                      />
                    ))}
                </div>
              </div>
            ) : (
              <div className="flex gap-2 text-xs">
                <span className="w-16 shrink-0 font-medium text-neutral-500">
                  Destino:
                </span>
                <span className="text-neutral-900">
                  {trip.destino_descripcion || "—"}
                </span>
              </div>
            )}
            {horario && (
              <div className="flex gap-2 text-xs">
                <span className="w-16 shrink-0 font-medium text-neutral-500">
                  Horario:
                </span>
                <span className="text-neutral-900">{horario}</span>
              </div>
            )}
          </div>

          <div className="space-y-1 text-xs">
            {trip.observaciones_cliente && (
              <p className="text-neutral-500">
                Obs: {trip.observaciones_cliente}
              </p>
            )}
            {trip.tipo === "CONTENEDOR" && trip.containers?.fecha_entrega && (
              <div className="flex gap-2 text-xs">
                <span className="w-24 shrink-0 font-medium text-neutral-500">Fecha entrega:</span>
                <span className="text-neutral-900">
                  {new Date(trip.containers.fecha_entrega + "T00:00:00").toLocaleDateString("es-AR")}
                </span>
              </div>
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

          {trip.trip_events.length > 0 && (
            <div className="space-y-1">
              <h4 className="text-xs font-semibold uppercase text-neutral-400">
                Hitos registrados
              </h4>
              {trip.trip_events
                .sort(
                  (a, b) =>
                    new Date(a.ocurrido_at).getTime() -
                    new Date(b.ocurrido_at).getTime(),
                )
                .map((ev) => (
                  <div key={ev.id} className="flex items-center gap-2 text-xs">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    <span>
                      {EVENT_LABELS[ev.tipo] ?? ev.tipo.replace(/_/g, " ")}
                    </span>
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

          {trip.remitos.length > 0 && (
            <div className="text-xs font-medium text-green-600">
              Remito subido
            </div>
          )}

          {readOnly ? (
            <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3 text-center">
              <p className="text-xs text-neutral-400">
                Solo lectura — disponible el{" "}
                <span className="capitalize">
                  {formatLongDate(trip.fecha_solicitada!)}
                </span>
              </p>
            </div>
          ) : (
            <TripDataForm trip={trip} />
          )}
        </div>
      )}
    </div>
  );
}

function formatHoraAR(iso: string) {
  return new Date(iso).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  });
}

function DestinationHoraRow({
  index,
  destination,
  isEnCurso,
}: {
  index: number;
  destination: ChoferTripRow["trip_destinations"][number];
  isEnCurso: boolean;
}) {
  const [llegadaPending, startLlegada] = useTransition();
  const [salidaPending, startSalida] = useTransition();
  const [horaLlegada, setHoraLlegada] = useState<string | null>(destination.hora_llegada);
  const [horaSalida, setHoraSalida] = useState<string | null>(destination.hora_salida);
  const [error, setError] = useState<string | null>(null);

  function registrarLlegada() {
    setError(null);
    startLlegada(async () => {
      const result = await updateDestinationHoraAction(destination.id, "llegada");
      if (result.error) {
        setError(result.error);
      } else {
        setHoraLlegada(new Date().toISOString());
      }
    });
  }

  function registrarSalida() {
    setError(null);
    startSalida(async () => {
      const result = await updateDestinationHoraAction(destination.id, "salida");
      if (result.error) {
        setError(result.error);
      } else {
        setHoraSalida(new Date().toISOString());
      }
    });
  }

  return (
    <div className="rounded border border-neutral-200 bg-white p-2.5 space-y-2">
      <div className="flex items-start gap-1.5">
        <span className="mt-0.5 text-xs font-medium text-neutral-400 shrink-0">{index}.</span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-neutral-900">{destination.destino}</p>
          {destination.observaciones && (
            <p className="text-xs text-neutral-400">{destination.observaciones}</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {horaLlegada ? (
          <span className="text-xs font-medium text-green-700">
            ✓ Llegada: {formatHoraAR(horaLlegada)}
          </span>
        ) : isEnCurso ? (
          <button
            type="button"
            onClick={registrarLlegada}
            disabled={llegadaPending}
            className="rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {llegadaPending ? "Registrando..." : "Registrar llegada"}
          </button>
        ) : null}

        {horaLlegada && (
          horaSalida ? (
            <span className="text-xs text-neutral-500">
              · Salida: {formatHoraAR(horaSalida)}
            </span>
          ) : isEnCurso ? (
            <button
              type="button"
              onClick={registrarSalida}
              disabled={salidaPending}
              className="rounded bg-neutral-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
            >
              {salidaPending ? "Registrando..." : "Registrar salida"}
            </button>
          ) : null
        )}
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

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
