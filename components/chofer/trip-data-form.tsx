"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useState } from "react";
import {
  registerTripDataAction,
  uploadRemitoAction,
  type ChoferActionState,
} from "@/lib/server/chofer/actions";
import type { ChoferTripRow } from "@/lib/server/chofer/queries";

const EVENT_TYPES = [
  { value: "LLEGADA_DEPOSITO_REYSIL", label: "Llegada deposito ReySil" },
  { value: "SALIDA_DEPOSITO_REYSIL", label: "Salida deposito ReySil" },
  { value: "LLEGADA_DESTINO_CLIENTE", label: "Llegada destino cliente" },
  { value: "SALIDA_CLIENTE", label: "Salida del cliente" },
  { value: "FIN_VIAJE", label: "Fin del viaje" },
] as const;

const initialState: ChoferActionState = {};

export function TripDataForm({ trip }: { trip: ChoferTripRow }) {
  const [dataState, dataAction] = useFormState(registerTripDataAction, initialState);
  const [remitoState, remitoAction] = useFormState(uploadRemitoAction, initialState);

  const [selectedEvent, setSelectedEvent] = useState("");
  const [km50, setKm50] = useState(
    trip.trip_driver_data?.km_50_porc?.toString() ?? "",
  );
  const [km100, setKm100] = useState(
    trip.trip_driver_data?.km_100_porc?.toString() ?? "",
  );
  const [pernocto, setPernocto] = useState(
    trip.trip_driver_data?.pernocto ?? false,
  );
  const [obs, setObs] = useState(
    trip.trip_driver_data?.observaciones ?? "",
  );

  const registeredEvents = new Set(trip.trip_events.map((e) => e.tipo));
  const hasRemito = trip.remitos.length > 0;

  function handleDataSubmit(formData: FormData) {
    formData.set(
      "payload",
      JSON.stringify({
        trip_id: trip.id,
        event_type: selectedEvent || undefined,
        km_50_porc: km50 ? Number(km50) : null,
        km_100_porc: km100 ? Number(km100) : null,
        pernocto,
        observaciones: obs,
      }),
    );
    dataAction(formData);
  }

  function handleRemitoSubmit(formData: FormData) {
    formData.set("trip_id", trip.id);
    remitoAction(formData);
  }

  const inputClass =
    "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-reysil-red focus:outline-none focus:ring-1 focus:ring-reysil-red";

  return (
    <div className="space-y-4">
      {/* Register event */}
      <form action={handleDataSubmit} className="space-y-3">
        {dataState.error && (
          <p className="text-xs text-red-600">{dataState.error}</p>
        )}
        {dataState.success && (
          <p className="text-xs text-green-600">Registrado</p>
        )}

        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-500">
            Registrar hito
          </label>
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className={inputClass}
          >
            <option value="">Seleccionar evento...</option>
            {EVENT_TYPES.map((ev) => (
              <option
                key={ev.value}
                value={ev.value}
                disabled={registeredEvents.has(ev.value)}
              >
                {ev.label}
                {registeredEvents.has(ev.value) ? " (registrado)" : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs text-neutral-500">
              Km 50%
            </label>
            <input
              type="number"
              value={km50}
              onChange={(e) => setKm50(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-neutral-500">
              Km 100%
            </label>
            <input
              type="number"
              value={km100}
              onChange={(e) => setKm100(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={pernocto}
            onChange={(e) => setPernocto(e.target.checked)}
            id={`pernocto-${trip.id}`}
            className="rounded border-neutral-300"
          />
          <label
            htmlFor={`pernocto-${trip.id}`}
            className="text-sm text-neutral-700"
          >
            Pernoctada
          </label>
        </div>

        <textarea
          value={obs}
          onChange={(e) => setObs(e.target.value)}
          placeholder="Comentarios..."
          rows={2}
          className={inputClass}
        />

        <DataSubmitBtn />
      </form>

      {/* Upload remito */}
      <form action={handleRemitoSubmit} className="space-y-2">
        {remitoState.error && (
          <p className="text-xs text-red-600">{remitoState.error}</p>
        )}
        {remitoState.success && (
          <p className="text-xs text-green-600">Remito subido</p>
        )}
        {!hasRemito && (
          <RemitoSubmitBtn />
        )}
        {hasRemito && (
          <p className="text-xs text-neutral-400">
            Ya hay un remito subido para este viaje.
          </p>
        )}
      </form>
    </div>
  );
}

function DataSubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-reysil-red px-4 py-2 text-sm font-medium text-white hover:bg-reysil-red-dark disabled:opacity-50"
    >
      {pending ? "Guardando..." : "Guardar datos"}
    </button>
  );
}

function RemitoSubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md border-2 border-dashed border-neutral-300 px-4 py-3 text-sm font-medium text-neutral-600 hover:border-reysil-red hover:text-reysil-red disabled:opacity-50"
    >
      {pending ? "Subiendo..." : "Subir foto de remito"}
    </button>
  );
}
