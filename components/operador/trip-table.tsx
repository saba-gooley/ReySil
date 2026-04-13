"use client";

import { useState } from "react";
import type { OperatorTripRow } from "@/lib/server/assignments/queries";

type Props = {
  trips: OperatorTripRow[];
  showAssignment?: boolean;
  showEvents?: boolean;
  showRemitos?: boolean;
  actions?: (trip: OperatorTripRow) => React.ReactNode;
  sortByPatente?: boolean;
};

export function TripTable({
  trips,
  showAssignment = false,
  showEvents = false,
  showRemitos = false,
  actions,
  sortByPatente = false,
}: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterText, setFilterText] = useState("");
  const [sortMode, setSortMode] = useState<"none" | "patente" | "chofer">(
    sortByPatente ? "patente" : "none",
  );

  let filtered = trips;
  if (filterText.trim()) {
    const words = filterText.toLowerCase().trim().split(/\s+/);
    filtered = trips.filter((t) => {
      const searchable = [
        t.clients.nombre,
        t.destino_descripcion,
        t.trip_assignments?.patente,
        t.trip_assignments?.drivers.apellido,
        t.trip_assignments?.drivers.nombre,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return words.every((w) => searchable.includes(w));
    });
  }

  // Always sort by fecha_solicitada first, then by secondary sort if selected
  filtered = [...filtered].sort((a, b) => {
    const fa = a.fecha_solicitada ?? "";
    const fb = b.fecha_solicitada ?? "";
    const dateComp = fa.localeCompare(fb);
    if (dateComp !== 0) return dateComp;

    if (sortMode === "patente") {
      const pa = a.trip_assignments?.patente ?? "zzz";
      const pb = b.trip_assignments?.patente ?? "zzz";
      return pa.localeCompare(pb);
    }
    if (sortMode === "chofer") {
      const da = a.trip_assignments?.drivers.apellido ?? "zzz";
      const db = b.trip_assignments?.drivers.apellido ?? "zzz";
      return da.localeCompare(db);
    }
    return 0;
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Filtrar por cliente, chofer o patente..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="w-full max-w-sm rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-reysil-red focus:outline-none focus:ring-1 focus:ring-reysil-red"
        />
        {showAssignment && (
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setSortMode("none")}
              className={`rounded-md border px-3 py-2 text-sm font-medium ${
                sortMode === "none"
                  ? "border-reysil-red bg-reysil-red text-white"
                  : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setSortMode("patente")}
              className={`rounded-md border px-3 py-2 text-sm font-medium ${
                sortMode === "patente"
                  ? "border-reysil-red bg-reysil-red text-white"
                  : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
              }`}
            >
              Por patente
            </button>
            <button
              type="button"
              onClick={() => setSortMode("chofer")}
              className={`rounded-md border px-3 py-2 text-sm font-medium ${
                sortMode === "chofer"
                  ? "border-reysil-red bg-reysil-red text-white"
                  : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
              }`}
            >
              Por chofer
            </button>
          </div>
        )}
        <span className="text-sm text-neutral-500">
          {filtered.length} {filtered.length === 1 ? "viaje" : "viajes"}
        </span>
      </div>

      {filtered.length === 0 && (
        <p className="py-8 text-center text-sm text-neutral-400">
          No hay viajes para mostrar.
        </p>
      )}

      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        {filtered.length > 0 && (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Fecha solicitada</th>
                <th className="px-4 py-3">Destino</th>
                {showAssignment && <th className="px-4 py-3">Chofer</th>}
                {showAssignment && <th className="px-4 py-3">Patente</th>}
                <th className="px-4 py-3">Estado</th>
                {actions && <th className="px-4 py-3"></th>}
                <th className="px-4 py-3 w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map((trip) => {
                const isExpanded = expandedId === trip.id;
                return (
                  <TripRow
                    key={trip.id}
                    trip={trip}
                    isExpanded={isExpanded}
                    onToggle={() =>
                      setExpandedId(isExpanded ? null : trip.id)
                    }
                    showAssignment={showAssignment}
                    showEvents={showEvents}
                    showRemitos={showRemitos}
                    actions={actions}
                  />
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function TripRow({
  trip,
  isExpanded,
  onToggle,
  showAssignment,
  showEvents,
  showRemitos,
  actions,
}: {
  trip: OperatorTripRow;
  isExpanded: boolean;
  onToggle: () => void;
  showAssignment: boolean;
  showEvents: boolean;
  showRemitos: boolean;
  actions?: (trip: OperatorTripRow) => React.ReactNode;
}) {
  const assignment = trip.trip_assignments;
  const booking =
    trip.tipo === "CONTENEDOR" && trip.containers?.reservations
      ? trip.containers.reservations.numero_booking
      : null;

  return (
    <>
      <tr
        className="cursor-pointer hover:bg-neutral-50"
        onClick={onToggle}
      >
        <td className="px-4 py-3">
          <span className="text-xs font-medium">{trip.tipo}</span>
          {booking && (
            <span className="ml-1 text-xs text-neutral-400">
              (Bkg: {booking})
            </span>
          )}
          {trip.containers?.numero && (
            <span className="ml-1 text-xs text-neutral-400">
              #{trip.containers.numero}
            </span>
          )}
        </td>
        <td className="px-4 py-3 text-sm">{trip.clients.nombre}</td>
        <td className="px-4 py-3 text-xs text-neutral-500">
          {trip.fecha_solicitada
            ? new Date(trip.fecha_solicitada + "T00:00:00").toLocaleDateString("es-AR")
            : "—"}
        </td>
        <td className="px-4 py-3 text-sm">
          {trip.destino_descripcion || "—"}
        </td>
        {showAssignment && (
          <td className="px-4 py-3 text-sm">
            {assignment
              ? `${assignment.drivers.nombre} ${assignment.drivers.apellido}`
              : "—"}
          </td>
        )}
        {showAssignment && (
          <td className="px-4 py-3 text-sm font-mono">
            {assignment?.patente || "—"}
          </td>
        )}
        <td className="px-4 py-3">
          <EstadoBadge estado={trip.estado} />
        </td>
        {actions && (
          <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
            {actions(trip)}
          </td>
        )}
        <td className="px-4 py-3 text-neutral-400 text-xs">
          {isExpanded ? "▲" : "▼"}
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td
            colSpan={
              3 +
              (showAssignment ? 2 : 0) +
              1 +
              (actions ? 1 : 0) +
              1
            }
            className="bg-neutral-50 px-4 py-4"
          >
            <TripDetail
              trip={trip}
              showEvents={showEvents}
              showRemitos={showRemitos}
            />
          </td>
        </tr>
      )}
    </>
  );
}

function TripDetail({
  trip,
  showEvents,
  showRemitos,
}: {
  trip: OperatorTripRow;
  showEvents: boolean;
  showRemitos: boolean;
}) {
  const meta = (trip.trip_reparto_fields?.metadata ?? {}) as Record<string, unknown>;

  return (
    <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
      <div className="space-y-1">
        <h4 className="text-xs font-semibold uppercase text-neutral-400">
          Viaje
        </h4>
        <Detail label="Tipo" value={trip.tipo} />
        <Detail label="Estado" value={trip.estado} />
        <Detail
          label="Fecha solicitada"
          value={
            trip.fecha_solicitada
              ? new Date(trip.fecha_solicitada + "T00:00:00").toLocaleDateString("es-AR")
              : null
          }
        />
        <Detail label="Origen" value={trip.origen_descripcion} />
        <Detail label="Destino" value={trip.destino_descripcion} />
        <Detail label="Observaciones" value={trip.observaciones_cliente} />
      </div>

      {trip.trip_reparto_fields && (
        <div className="space-y-1">
          <h4 className="text-xs font-semibold uppercase text-neutral-400">
            Datos de carga
          </h4>
          <Detail label="NDV" value={trip.trip_reparto_fields.ndv} />
          <Detail label="PAL" value={trip.trip_reparto_fields.pal?.toString()} />
          <Detail label="CAT" value={trip.trip_reparto_fields.cat} />
          <Detail label="Nro UN" value={trip.trip_reparto_fields.nro_un} />
          <Detail label="KG netos" value={trip.trip_reparto_fields.peso_kg?.toString()} />
          <Detail label="Toneladas" value={trip.trip_reparto_fields.toneladas?.toString()} />
          <Detail label="Bultos" value={trip.trip_reparto_fields.cantidad_bultos?.toString()} />
          <Detail label="Tipo camion" value={meta.tipo_camion as string} />
          <Detail label="Peon" value={meta.peon as string} />
          <Detail label="Horario" value={meta.horario as string} />
          <Detail label="Hoja de ruta" value={meta.hoja_de_ruta as string} />
        </div>
      )}

      {trip.containers && (
        <div className="space-y-1">
          <h4 className="text-xs font-semibold uppercase text-neutral-400">
            Contenedor
          </h4>
          <Detail label="Numero" value={trip.containers.numero} />
          <Detail label="Tipo" value={trip.containers.tipo} />
          <Detail label="Peso (kg)" value={trip.containers.peso_carga_kg?.toString()} />
          {trip.containers.reservations && (
            <>
              <h4 className="text-xs font-semibold uppercase text-neutral-400 mt-2">
                Reserva
              </h4>
              <Detail label="Booking" value={trip.containers.reservations.numero_booking} />
              <Detail label="Naviera" value={trip.containers.reservations.naviera} />
              <Detail label="Buque" value={trip.containers.reservations.buque} />
              <Detail
                label="Fecha arribo"
                value={
                  trip.containers.reservations.fecha_arribo
                    ? new Date(trip.containers.reservations.fecha_arribo + "T00:00:00").toLocaleDateString("es-AR")
                    : null
                }
              />
              <Detail
                label="Fecha carga"
                value={
                  trip.containers.reservations.fecha_carga
                    ? new Date(trip.containers.reservations.fecha_carga + "T00:00:00").toLocaleDateString("es-AR")
                    : null
                }
              />
              <Detail label="Observaciones" value={trip.containers.reservations.observaciones} />
            </>
          )}
        </div>
      )}

      {trip.trip_assignments && (
        <div className="space-y-1">
          <h4 className="text-xs font-semibold uppercase text-neutral-400">
            Asignacion
          </h4>
          <Detail
            label="Chofer"
            value={`${trip.trip_assignments.drivers.nombre} ${trip.trip_assignments.drivers.apellido}`}
          />
          <Detail label="Patente" value={trip.trip_assignments.patente} />
          {trip.trip_assignments.patente_acoplado && (
            <Detail label="Acoplado" value={trip.trip_assignments.patente_acoplado} />
          )}
        </div>
      )}

      {showEvents && trip.trip_events.length > 0 && (
        <div className="space-y-1 sm:col-span-3">
          <h4 className="text-xs font-semibold uppercase text-neutral-400">
            Hitos
          </h4>
          <ul className="space-y-1">
            {trip.trip_events
              .sort(
                (a, b) =>
                  new Date(a.ocurrido_at).getTime() -
                  new Date(b.ocurrido_at).getTime(),
              )
              .map((ev) => (
                <li key={ev.id} className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full bg-reysil-red" />
                  <span className="font-medium">
                    {ev.tipo.replace(/_/g, " ")}
                  </span>
                  <span className="text-neutral-500">
                    {new Date(ev.ocurrido_at).toLocaleString("es-AR")}
                  </span>
                  {ev.observaciones && (
                    <span className="text-neutral-400">— {ev.observaciones}</span>
                  )}
                </li>
              ))}
          </ul>
        </div>
      )}

      {showRemitos && trip.remitos.length > 0 && (
        <div className="space-y-1 sm:col-span-3">
          <h4 className="text-xs font-semibold uppercase text-neutral-400">
            Remitos
          </h4>
          <ul className="flex flex-wrap gap-2">
            {trip.remitos.map((r) => (
              <li key={r.id}>
                <a
                  href={r.drive_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-reysil-red hover:underline"
                >
                  Ver remito ({r.estado.toLowerCase()})
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
  return (
    <div className="flex gap-2 text-xs">
      <span className="w-24 shrink-0 text-neutral-500">{label}:</span>
      <span className="text-neutral-900">{value}</span>
    </div>
  );
}

function EstadoBadge({ estado }: { estado: string }) {
  const styles: Record<string, string> = {
    PENDIENTE: "bg-yellow-100 text-yellow-700",
    PREASIGNADO: "bg-orange-100 text-orange-700",
    ASIGNADO: "bg-blue-100 text-blue-700",
    EN_CURSO: "bg-green-100 text-green-700",
    FINALIZADO: "bg-neutral-100 text-neutral-600",
    CANCELADO: "bg-red-100 text-red-600",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[estado] ?? "bg-neutral-100 text-neutral-600"}`}
    >
      {estado}
    </span>
  );
}
