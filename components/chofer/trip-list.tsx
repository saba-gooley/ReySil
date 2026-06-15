"use client";

import { useState } from "react";
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
                        canRegister={trip.estado === "ASIGNADO" || trip.estado === "EN_CURSO"}
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
  canRegister,
}: {
  index: number;
  destination: ChoferTripRow["trip_destinations"][number];
  canRegister: boolean;
}) {
  const [horaLlegada, setHoraLlegada] = useState<string | null>(destination.hora_llegada);
  const [horaSalida, setHoraSalida] = useState<string | null>(destination.hora_salida);

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

      <DestinationEventField
        destinationId={destination.id}
        tipo="llegada"
        label="Llegada al destino"
        registeredHora={horaLlegada}
        canRegister={canRegister}
        onDone={(iso) => setHoraLlegada(iso)}
      />

      {(horaLlegada || horaSalida) && (
        <DestinationEventField
          destinationId={destination.id}
          tipo="salida"
          label="Salida del destino"
          registeredHora={horaSalida}
          canRegister={canRegister && !!horaLlegada}
          onDone={(iso) => setHoraSalida(iso)}
        />
      )}
    </div>
  );
}

function DestinationEventField({
  destinationId,
  tipo,
  label,
  registeredHora,
  canRegister,
  onDone,
}: {
  destinationId: string;
  tipo: "llegada" | "salida";
  label: string;
  registeredHora: string | null;
  canRegister: boolean;
  onDone: (iso: string) => void;
}) {
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editTime, setEditTime] = useState("");

  function setNow() {
    const now = new Date();
    const h = now.getHours().toString().padStart(2, "0");
    const m = now.getMinutes().toString().padStart(2, "0");
    setTime(`${h}:${m}`);
  }

  function startEdit() {
    if (registeredHora) {
      const d = new Date(registeredHora);
      const h = d.getHours().toString().padStart(2, "0");
      const m = d.getMinutes().toString().padStart(2, "0");
      setEditTime(`${h}:${m}`);
    }
    setEditing(true);
  }

  async function handleRegister(useHora?: string) {
    setLoading(true);
    setError(null);
    const result = await updateDestinationHoraAction(destinationId, tipo, useHora);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      let iso: string;
      if (useHora) {
        const today = new Date().toISOString().split("T")[0];
        iso = new Date(`${today}T${useHora}:00`).toISOString();
      } else {
        iso = new Date().toISOString();
      }
      onDone(iso);
      setTime("");
      setEditing(false);
    }
  }

  if (registeredHora) {
    if (editing && canRegister) {
      return (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 space-y-2">
          <p className="text-xs font-medium text-neutral-900">{label}</p>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex items-center gap-2">
            <input
              type="time"
              value={editTime}
              onChange={(e) => setEditTime(e.target.value)}
              className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-reysil-red focus:outline-none focus:ring-1 focus:ring-reysil-red"
            />
            <button
              type="button"
              onClick={() => handleRegister(editTime)}
              disabled={loading || !editTime}
              className="rounded-md bg-reysil-red px-3 py-2 text-xs font-medium text-white hover:bg-reysil-red-dark disabled:opacity-50"
            >
              {loading ? "..." : "Guardar"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-md border border-neutral-300 px-3 py-2 text-xs font-medium text-neutral-700"
            >
              Cancelar
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-3 py-2.5">
        <div>
          <p className="text-xs font-medium text-neutral-900">{label}</p>
          <p className="text-xs text-green-600">{formatHoraAR(registeredHora)}</p>
        </div>
        <div className="flex items-center gap-2">
          {canRegister && (
            <button
              type="button"
              onClick={startEdit}
              className="text-xs text-neutral-500 hover:text-neutral-700 underline"
            >
              Editar
            </button>
          )}
          <span className="text-xs text-green-600 font-medium">Registrado</span>
        </div>
      </div>
    );
  }

  if (!canRegister) return null;

  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2.5 space-y-2">
      <p className="text-xs font-medium text-neutral-900">{label}</p>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex items-center gap-2">
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-reysil-red focus:outline-none focus:ring-1 focus:ring-reysil-red"
        />
        <button
          type="button"
          onClick={() => {
            setNow();
            handleRegister();
          }}
          disabled={loading}
          className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
        >
          Ahora
        </button>
      </div>
      {time && (
        <button
          type="button"
          onClick={() => handleRegister(time)}
          disabled={loading}
          className="w-full rounded-md bg-reysil-red px-4 py-2 text-xs font-medium text-white hover:bg-reysil-red-dark disabled:opacity-50"
        >
          {loading ? "Guardando..." : `Registrar ${time}`}
        </button>
      )}
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
