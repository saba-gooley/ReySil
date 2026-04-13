"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  createContenedorAction,
  type TripActionState,
} from "@/lib/server/trips/actions";

type Deposit = { id: string; nombre: string; direccion: string | null; tipo: string };
type ContainerEntry = {
  key: number;
  numero: string;
  tipo: string;
  peso_carga_kg: string;
  observaciones: string;
};

const initialState: TripActionState = {};

export function ContenedorForm({ deposits }: { deposits: Deposit[] }) {
  const [state, formAction] = useFormState(createContenedorAction, initialState);
  const router = useRouter();

  const [numeroBooking, setNumeroBooking] = useState("");
  const [naviera, setNaviera] = useState("");
  const [buque, setBuque] = useState("");
  const [fechaArribo, setFechaArribo] = useState("");
  const [fechaCarga, setFechaCarga] = useState("");
  const [orden, setOrden] = useState("");
  const [mercaderia, setMercaderia] = useState("");
  const [despacho, setDespacho] = useState("");
  const [carga, setCarga] = useState("");
  const [terminal, setTerminal] = useState("");
  const [devuelveEn, setDevuelveEn] = useState("");
  const [libreHasta, setLibreHasta] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [origenDepositId, setOrigenDepositId] = useState("");
  const [origenDescripcion, setOrigenDescripcion] = useState("");
  const [destinoDescripcion, setDestinoDescripcion] = useState("");

  const [nextKey, setNextKey] = useState(2);
  const [containers, setContainers] = useState<ContainerEntry[]>([
    { key: 1, numero: "", tipo: "", peso_carga_kg: "", observaciones: "" },
  ]);

  useEffect(() => {
    if (state.success) {
      router.push("/cliente/seguimiento");
    }
  }, [state.success, router]);

  function addContainer() {
    setContainers([
      ...containers,
      { key: nextKey, numero: "", tipo: "", peso_carga_kg: "", observaciones: "" },
    ]);
    setNextKey(nextKey + 1);
  }

  function removeContainer(key: number) {
    if (containers.length <= 1) return;
    setContainers(containers.filter((c) => c.key !== key));
  }

  function updateContainer(key: number, field: keyof ContainerEntry, value: string) {
    setContainers(
      containers.map((c) => (c.key === key ? { ...c, [field]: value } : c)),
    );
  }

  function handleSubmit(formData: FormData) {
    const payload = {
      numero_booking: numeroBooking,
      naviera,
      buque,
      fecha_arribo: fechaArribo,
      fecha_carga: fechaCarga,
      orden,
      mercaderia,
      despacho,
      carga,
      terminal,
      devuelve_en: devuelveEn,
      libre_hasta: libreHasta,
      observaciones,
      origen_deposit_id: origenDepositId === "otro" || !origenDepositId ? null : origenDepositId,
      origen_descripcion: origenDepositId === "otro" ? origenDescripcion : "",
      destino_descripcion: destinoDescripcion,
      containers: containers.map((c) => ({
        numero: c.numero,
        tipo: c.tipo,
        peso_carga_kg: c.peso_carga_kg ? Number(c.peso_carga_kg) : null,
        observaciones: c.observaciones,
      })),
    };
    formData.set("payload", JSON.stringify(payload));
    formAction(formData);
  }

  const inputClass =
    "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-reysil-red focus:outline-none focus:ring-1 focus:ring-reysil-red";

  return (
    <form action={handleSubmit} className="space-y-6">
      {state.error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          {state.error}
        </div>
      )}

      {/* Datos de la reserva */}
      <fieldset className="space-y-4 rounded-lg border border-neutral-200 bg-white p-5">
        <legend className="px-2 text-sm font-semibold text-neutral-700">
          Datos de la reserva
        </legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              N° Booking
            </label>
            <input
              type="text"
              value={numeroBooking}
              onChange={(e) => setNumeroBooking(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Naviera
            </label>
            <input
              type="text"
              value={naviera}
              onChange={(e) => setNaviera(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Buque
            </label>
            <input
              type="text"
              value={buque}
              onChange={(e) => setBuque(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Fecha de arribo
            </label>
            <input
              type="date"
              value={fechaArribo}
              onChange={(e) => setFechaArribo(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Fecha de carga *
            </label>
            <input
              type="date"
              value={fechaCarga}
              onChange={(e) => setFechaCarga(e.target.value)}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Orden
            </label>
            <input
              type="text"
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Mercaderia
            </label>
            <input
              type="text"
              value={mercaderia}
              onChange={(e) => setMercaderia(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Despacho
            </label>
            <input
              type="text"
              value={despacho}
              onChange={(e) => setDespacho(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Carga
            </label>
            <input
              type="text"
              value={carga}
              onChange={(e) => setCarga(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Terminal
            </label>
            <input
              type="text"
              value={terminal}
              onChange={(e) => setTerminal(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Devuelve en
            </label>
            <input
              type="text"
              value={devuelveEn}
              onChange={(e) => setDevuelveEn(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Libre hasta
            </label>
            <input
              type="date"
              value={libreHasta}
              onChange={(e) => setLibreHasta(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </fieldset>

      {/* Origen / Destino */}
      <fieldset className="space-y-4 rounded-lg border border-neutral-200 bg-white p-5">
        <legend className="px-2 text-sm font-semibold text-neutral-700">
          Origen y destino
        </legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Deposito / Puerto
            </label>
            <select
              value={origenDepositId}
              onChange={(e) => setOrigenDepositId(e.target.value)}
              className={inputClass}
            >
              <option value="">Seleccionar...</option>
              {deposits.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nombre} ({d.tipo})
                </option>
              ))}
              <option value="otro">Otro (texto libre)</option>
            </select>
          </div>
          {origenDepositId === "otro" && (
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Descripcion del origen
              </label>
              <input
                type="text"
                value={origenDescripcion}
                onChange={(e) => setOrigenDescripcion(e.target.value)}
                className={inputClass}
              />
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Destino
            </label>
            <input
              type="text"
              value={destinoDescripcion}
              onChange={(e) => setDestinoDescripcion(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </fieldset>

      {/* Contenedores */}
      <fieldset className="space-y-4 rounded-lg border border-neutral-200 bg-white p-5">
        <legend className="px-2 text-sm font-semibold text-neutral-700">
          Contenedores
        </legend>
        <p className="text-xs text-neutral-500">
          Cada contenedor genera un viaje independiente.
        </p>

        {containers.map((c, idx) => (
          <div
            key={c.key}
            className="flex flex-wrap items-end gap-3 rounded-md border border-neutral-100 bg-neutral-50 p-3"
          >
            <span className="self-center text-xs font-medium text-neutral-400">
              #{idx + 1}
            </span>
            <div className="flex-1 min-w-[140px]">
              <label className="mb-1 block text-xs font-medium text-neutral-600">
                N° contenedor
              </label>
              <input
                type="text"
                value={c.numero}
                onChange={(e) => updateContainer(c.key, "numero", e.target.value)}
                placeholder="Ej: MSKU1234567"
                className={inputClass}
              />
            </div>
            <div className="w-24">
              <label className="mb-1 block text-xs font-medium text-neutral-600">
                Tipo
              </label>
              <select
                value={c.tipo}
                onChange={(e) => updateContainer(c.key, "tipo", e.target.value)}
                className={inputClass}
              >
                <option value="">—</option>
                <option value="20">20&apos;</option>
                <option value="40">40&apos;</option>
                <option value="40HC">40&apos;HC</option>
              </select>
            </div>
            <div className="w-28">
              <label className="mb-1 block text-xs font-medium text-neutral-600">
                Peso (Kg)
              </label>
              <input
                type="number"
                value={c.peso_carga_kg}
                onChange={(e) =>
                  updateContainer(c.key, "peso_carga_kg", e.target.value)
                }
                min="0"
                step="0.01"
                className={inputClass}
              />
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="mb-1 block text-xs font-medium text-neutral-600">
                Observaciones
              </label>
              <input
                type="text"
                value={c.observaciones}
                onChange={(e) =>
                  updateContainer(c.key, "observaciones", e.target.value)
                }
                className={inputClass}
              />
            </div>
            {containers.length > 1 && (
              <button
                type="button"
                onClick={() => removeContainer(c.key)}
                className="mb-0.5 text-sm text-red-500 hover:underline"
              >
                Quitar
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addContainer}
          className="text-sm text-reysil-red hover:underline"
        >
          + Agregar contenedor
        </button>
      </fieldset>

      {/* Comentarios */}
      <fieldset className="space-y-4 rounded-lg border border-neutral-200 bg-white p-5">
        <legend className="px-2 text-sm font-semibold text-neutral-700">
          Comentarios
        </legend>
        <textarea
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          rows={3}
          placeholder="Instrucciones especiales..."
          className={inputClass}
        />
      </fieldset>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push("/cliente/solicitudes")}
          className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm hover:bg-neutral-100"
        >
          Cancelar
        </button>
        <SubmitButton />
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-reysil-red px-6 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-reysil-red-dark disabled:opacity-50"
    >
      {pending ? "Enviando..." : "Crear reserva"}
    </button>
  );
}
