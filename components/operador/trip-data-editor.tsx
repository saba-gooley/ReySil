"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  updateTripEventByOperatorAction,
  updateTripDriverDataByOperatorAction,
} from "@/lib/server/trips/operator-edit-actions";
import type { OperatorTripRow } from "@/lib/server/assignments/queries";

const EVENT_LABELS: Record<string, string> = {
  LLEGADA_DEPOSITO: "Llegada al Depósito",
  SALIDA_DEPOSITO: "Salida del Depósito",
  LLEGADA_DESTINO_CLIENTE: "Llegada al Cliente",
  SALIDA_CLIENTE: "Salida del Cliente",
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  });
}

function isoToTimeInput(iso: string) {
  const d = new Date(iso);
  const h = d.toLocaleString("es-AR", { hour: "2-digit", hour12: false, timeZone: "America/Argentina/Buenos_Aires" }).padStart(2, "0");
  const m = d.toLocaleString("es-AR", { minute: "2-digit", timeZone: "America/Argentina/Buenos_Aires" }).padStart(2, "0");
  return `${h}:${m}`;
}

export function TripDataEditor({ trip }: { trip: OperatorTripRow }) {
  const router = useRouter();
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editTime, setEditTime] = useState("");
  const [eventLoading, setEventLoading] = useState(false);
  const [eventError, setEventError] = useState<string | null>(null);

  const [editingDriverData, setEditingDriverData] = useState(false);
  const [kmType, setKmType] = useState<"50" | "100">(
    trip.trip_driver_data?.km_100_porc != null ? "100" : "50",
  );
  const [kmValue, setKmValue] = useState(
    String((trip.trip_driver_data?.km_100_porc ?? trip.trip_driver_data?.km_50_porc) ?? ""),
  );
  const [pernocto, setPernocto] = useState(trip.trip_driver_data?.pernocto ?? false);
  const [obs, setObs] = useState(trip.trip_driver_data?.observaciones ?? "");
  const [driverDataLoading, setDriverDataLoading] = useState(false);
  const [driverDataError, setDriverDataError] = useState<string | null>(null);

  const canEdit = ["EN_CURSO", "FINALIZADO"].includes(trip.estado);
  if (!canEdit || trip.trip_events.length === 0) return null;

  function startEditEvent(ev: { id: string; ocurrido_at: string }) {
    setEditingEventId(ev.id);
    setEditTime(isoToTimeInput(ev.ocurrido_at));
    setEventError(null);
  }

  async function saveEventTime(eventId: string) {
    setEventLoading(true);
    setEventError(null);
    const date = new Date(trip.trip_events.find((e) => e.id === eventId)!.ocurrido_at)
      .toISOString().split("T")[0];
    const ocurrido_at = new Date(`${date}T${editTime}:00-03:00`).toISOString();
    const result = await updateTripEventByOperatorAction(eventId, ocurrido_at);
    setEventLoading(false);
    if (result.error) setEventError(result.error);
    else { setEditingEventId(null); router.refresh(); }
  }

  async function saveDriverData() {
    setDriverDataLoading(true);
    setDriverDataError(null);
    const km = kmValue ? parseFloat(kmValue) : null;
    const result = await updateTripDriverDataByOperatorAction(trip.id, {
      km_50_porc: kmType === "50" ? km : null,
      km_100_porc: kmType === "100" ? km : null,
      pernocto,
      observaciones: obs || null,
    });
    setDriverDataLoading(false);
    if (result.error) setDriverDataError(result.error);
    else { setEditingDriverData(false); router.refresh(); }
  }

  const inputClass =
    "rounded-md border border-neutral-300 px-2 py-1 text-xs focus:border-reysil-red focus:outline-none focus:ring-1 focus:ring-reysil-red";

  return (
    <div className="space-y-3 border-t border-neutral-200 pt-3 mt-3">
      <p className="text-xs font-semibold uppercase text-neutral-400">Edición de datos</p>

      {/* Hitos */}
      <div className="space-y-1">
        <p className="text-xs font-medium text-neutral-600">Hitos registrados</p>
        {trip.trip_events
          .sort((a, b) => new Date(a.ocurrido_at).getTime() - new Date(b.ocurrido_at).getTime())
          .map((ev) => (
            <div key={ev.id} className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-reysil-red shrink-0" />
              <span className="text-neutral-700 w-44 shrink-0">
                {EVENT_LABELS[ev.tipo] ?? ev.tipo.replace(/_/g, " ")}
              </span>
              {editingEventId === ev.id ? (
                <>
                  <input
                    type="time"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => saveEventTime(ev.id)}
                    disabled={eventLoading}
                    className="rounded bg-reysil-red px-2 py-1 text-xs font-medium text-white disabled:opacity-50"
                  >
                    {eventLoading ? "..." : "Guardar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingEventId(null)}
                    className="rounded border border-neutral-300 px-2 py-1 text-xs text-neutral-600"
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <span className="text-neutral-500">{formatTime(ev.ocurrido_at)}</span>
                  <button
                    type="button"
                    onClick={() => startEditEvent(ev)}
                    className="text-reysil-red hover:underline text-xs"
                  >
                    Editar
                  </button>
                </>
              )}
            </div>
          ))}
        {eventError && <p className="text-xs text-red-600">{eventError}</p>}
      </div>

      {/* Datos del chofer (km, pernoctada, obs) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-neutral-600">Km / Pernoctada</p>
          {!editingDriverData && (
            <button
              type="button"
              onClick={() => setEditingDriverData(true)}
              className="text-xs text-reysil-red hover:underline"
            >
              Editar
            </button>
          )}
        </div>
        {editingDriverData ? (
          <div className="space-y-2 rounded-md border border-neutral-200 bg-neutral-50 p-3">
            <div className="flex gap-4 text-xs">
              <label className="flex items-center gap-1">
                <input type="radio" checked={kmType === "50"} onChange={() => setKmType("50")} />
                Km 50%
              </label>
              <label className="flex items-center gap-1">
                <input type="radio" checked={kmType === "100"} onChange={() => setKmType("100")} />
                Km 100%
              </label>
            </div>
            <input
              type="number"
              min="0"
              step="0.01"
              value={kmValue}
              onChange={(e) => setKmValue(e.target.value)}
              placeholder="Km"
              className={`${inputClass} w-full`}
            />
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={pernocto}
                onChange={(e) => setPernocto(e.target.checked)}
                className="h-3 w-3"
              />
              Pernoctada
            </label>
            <textarea
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              rows={2}
              placeholder="Observaciones..."
              className={`${inputClass} w-full`}
            />
            {driverDataError && <p className="text-xs text-red-600">{driverDataError}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={saveDriverData}
                disabled={driverDataLoading}
                className="rounded bg-reysil-red px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
              >
                {driverDataLoading ? "Guardando..." : "Guardar"}
              </button>
              <button
                type="button"
                onClick={() => setEditingDriverData(false)}
                className="rounded border border-neutral-300 px-3 py-1.5 text-xs text-neutral-600"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="text-xs text-neutral-500">
            {trip.trip_driver_data ? (
              <>
                {trip.trip_driver_data.km_50_porc != null && `Km 50%: ${trip.trip_driver_data.km_50_porc}`}
                {trip.trip_driver_data.km_100_porc != null && `Km 100%: ${trip.trip_driver_data.km_100_porc}`}
                {!trip.trip_driver_data.km_50_porc && !trip.trip_driver_data.km_100_porc && "Sin km registrado"}
                {trip.trip_driver_data.pernocto && " • Pernoctada"}
                {trip.trip_driver_data.observaciones && ` • ${trip.trip_driver_data.observaciones}`}
              </>
            ) : (
              "Sin datos registrados"
            )}
          </div>
        )}
      </div>
    </div>
  );
}
