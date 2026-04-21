"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  registerTripEventAction,
  finalizeTripAction,
  type ChoferActionState,
} from "@/lib/server/chofer/trip-actions";
import { uploadRemitoAction } from "@/lib/server/chofer/remito-actions";
import type { ChoferTripRow } from "@/lib/server/chofer/queries";

const TRIP_EVENTS = [
  { value: "LLEGADA_DESTINO_CLIENTE", label: "Llegada al Cliente" },
  { value: "SALIDA_CLIENTE", label: "Salida del Cliente" },
] as const;

const initialState: ChoferActionState = {};

export function TripDataForm({ trip }: { trip: ChoferTripRow }) {
  const router = useRouter();
  const [remitoState, remitoAction] = useFormState(uploadRemitoAction, initialState);

  const registeredEvents = new Set(trip.trip_events.map((e) => e.tipo));
  const hasRemito = trip.remitos.length > 0;

  function handleRemitoSubmit(formData: FormData) {
    formData.set("trip_id", trip.id);
    remitoAction(formData);
  }

  const inputClass =
    "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-reysil-red focus:outline-none focus:ring-1 focus:ring-reysil-red";

  return (
    <div className="space-y-4">
      {/* Comentario de asignación */}
      {trip.trip_assignments?.comentario_asignacion && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-xs font-semibold text-amber-900">Nota del operador</p>
          <p className="text-sm text-amber-800 mt-1">
            {trip.trip_assignments.comentario_asignacion}
          </p>
        </div>
      )}

      {/* Trip events: Llegada al cliente / Salida del cliente */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-neutral-400 uppercase">
          Registro del viaje
        </h4>
        {TRIP_EVENTS.map((ev) => (
          <EventTimeField
            key={ev.value}
            tripId={trip.id}
            eventType={ev.value}
            label={ev.label}
            isRegistered={registeredEvents.has(ev.value)}
            registeredTime={
              trip.trip_events.find((e) => e.tipo === ev.value)?.ocurrido_at
            }
            onDone={() => router.refresh()}
          />
        ))}
      </div>


      {/* Upload remito */}
      <form action={handleRemitoSubmit} className="space-y-2">
        {remitoState.error && (
          <p className="text-xs text-red-600">{remitoState.error}</p>
        )}
        {remitoState.success && (
          <p className="text-xs text-green-600">Remito subido</p>
        )}
        {!hasRemito ? (
          <>
            <label className="mb-1 block text-xs font-medium text-neutral-500">
              Foto del remito firmado
            </label>
            <input
              type="file"
              name="remito_file"
              accept="image/*"
              capture="environment"
              className="w-full text-sm text-neutral-600 file:mr-3 file:rounded-md file:border-0 file:bg-neutral-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-neutral-700 hover:file:bg-neutral-200"
            />
            <RemitoSubmitBtn />
          </>
        ) : (
          <div className="rounded-md bg-green-50 border border-green-200 p-3">
            <p className="text-xs text-green-700">
              Remito subido correctamente.
            </p>
            {trip.remitos[0]?.drive_url && (
              <a
                href={trip.remitos[0].drive_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-reysil-red hover:underline"
              >
                Ver remito
              </a>
            )}
          </div>
        )}
      </form>

      {/* Finalizar viaje */}
      {trip.estado !== "FINALIZADO" && (
        <FinalizeSection
          tripId={trip.id}
          onDone={() => router.refresh()}
        />
      )}
    </div>
  );
}

function FinalizeSection({
  tripId,
  onDone,
}: {
  tripId: string;
  onDone: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRemitoConfirm, setShowRemitoConfirm] = useState(false);

  async function handleFinalize(skipRemito: boolean) {
    setLoading(true);
    setError(null);
    const result = await finalizeTripAction(tripId, skipRemito, undefined);
    setLoading(false);

    if (result.error === "__NO_REMITO__") {
      setShowRemitoConfirm(true);
      return;
    }
    if (result.error) {
      setError(result.error);
      return;
    }
    onDone();
  }

  if (showRemitoConfirm) {
    return (
      <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4 space-y-3">
        <p className="text-sm font-medium text-yellow-800">
          No se cargo remito para este viaje. Desea finalizar de todas formas?
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleFinalize(true)}
            disabled={loading}
            className="flex-1 rounded-md bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700 disabled:opacity-50"
          >
            {loading ? "Finalizando..." : "Si, finalizar sin remito"}
          </button>
          <button
            type="button"
            onClick={() => setShowRemitoConfirm(false)}
            className="flex-1 rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            No, volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-4 border-t border-neutral-200">
      {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
      <button
        type="button"
        onClick={() => handleFinalize(false)}
        disabled={loading}
        className="w-full rounded-md bg-green-600 px-4 py-3 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? "Finalizando..." : "Finalizar viaje"}
      </button>
    </div>
  );
}

function EventTimeField({
  tripId,
  eventType,
  label,
  isRegistered,
  registeredTime,
  onDone,
}: {
  tripId: string;
  eventType: string;
  label: string;
  isRegistered: boolean;
  registeredTime?: string;
  onDone: () => void;
}) {
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setNow() {
    const now = new Date();
    const h = now.getHours().toString().padStart(2, "0");
    const m = now.getMinutes().toString().padStart(2, "0");
    setTime(`${h}:${m}`);
  }

  async function handleRegister(useTime: string) {
    setLoading(true);
    setError(null);

    let ocurrido_at: string;
    if (useTime) {
      const today = new Date().toISOString().split("T")[0];
      ocurrido_at = new Date(`${today}T${useTime}:00`).toISOString();
    } else {
      ocurrido_at = new Date().toISOString();
    }

    const result = await registerTripEventAction(tripId, eventType, ocurrido_at);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      onDone();
    }
  }

  if (isRegistered && registeredTime) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-neutral-900">{label}</p>
          <p className="text-xs text-green-600">
            {new Date(registeredTime).toLocaleTimeString("es-AR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <span className="text-xs text-green-600 font-medium">Registrado</span>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-4 py-3 space-y-2">
      <p className="text-sm font-medium text-neutral-900">{label}</p>
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
            handleRegister("");
          }}
          disabled={loading}
          className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
        >
          Ahora
        </button>
      </div>
      {time && (
        <button
          type="button"
          onClick={() => handleRegister(time)}
          disabled={loading}
          className="w-full rounded-md bg-reysil-red px-4 py-2 text-sm font-medium text-white hover:bg-reysil-red-dark disabled:opacity-50"
        >
          {loading ? "Guardando..." : `Registrar ${time}`}
        </button>
      )}
    </div>
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
