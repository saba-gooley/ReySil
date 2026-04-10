"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  createRepartoAction,
  type TripActionState,
} from "@/lib/server/trips/actions";

type Deposit = { id: string; nombre: string; direccion: string | null; tipo: string };

const initialState: TripActionState = {};

export function RepartoForm({ deposits }: { deposits: Deposit[] }) {
  const [state, formAction] = useFormState(createRepartoAction, initialState);
  const router = useRouter();

  const [fechaSolicitada, setFechaSolicitada] = useState("");
  const [fechaEntrega, setFechaEntrega] = useState("");
  const [origenDepositId, setOrigenDepositId] = useState<string>("");
  const [origenDescripcion, setOrigenDescripcion] = useState("");
  const [destinoDescripcion, setDestinoDescripcion] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [ndv, setNdv] = useState("");
  const [pal, setPal] = useState("");
  const [cat, setCat] = useState("");
  const [nroUn, setNroUn] = useState("");
  const [cantidadBultos, setCantidadBultos] = useState("");
  const [pesoKg, setPesoKg] = useState("");
  const [toneladas, setToneladas] = useState("");
  const [codigoPostal, setCodigoPostal] = useState("");
  const [zonaTarifa, setZonaTarifa] = useState("");
  const [horario, setHorario] = useState("");
  const [tipoCamion, setTipoCamion] = useState("");
  const [peon, setPeon] = useState("");

  useEffect(() => {
    if (state.success) {
      router.push("/cliente/seguimiento");
    }
  }, [state.success, router]);

  function handleSubmit(formData: FormData) {
    const payload = {
      fecha_solicitada: fechaSolicitada,
      fecha_entrega: fechaEntrega,
      origen_deposit_id: origenDepositId === "otro" || !origenDepositId ? null : origenDepositId,
      origen_descripcion: origenDepositId === "otro" ? origenDescripcion : "",
      destino_descripcion: destinoDescripcion,
      observaciones_cliente: observaciones,
      ndv,
      pal: pal ? Number(pal) : null,
      cat,
      nro_un: nroUn,
      cantidad_bultos: cantidadBultos ? Number(cantidadBultos) : null,
      peso_kg: pesoKg ? Number(pesoKg) : null,
      toneladas: toneladas ? Number(toneladas) : null,
      codigo_postal: codigoPostal,
      zona_tarifa: zonaTarifa,
      horario,
      tipo_camion: tipoCamion,
      peon: peon || "",
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

      {/* Fechas y origen/destino */}
      <fieldset className="space-y-4 rounded-lg border border-neutral-200 bg-white p-5">
        <legend className="px-2 text-sm font-semibold text-neutral-700">
          Datos del viaje
        </legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Fecha de carga *
            </label>
            <input
              type="date"
              value={fechaSolicitada}
              onChange={(e) => setFechaSolicitada(e.target.value)}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Fecha de entrega
            </label>
            <input
              type="date"
              value={fechaEntrega}
              onChange={(e) => setFechaEntrega(e.target.value)}
              min={fechaSolicitada || undefined}
              className={inputClass}
            />
          </div>
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
                placeholder="Direccion o lugar"
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
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Codigo postal
            </label>
            <input
              type="text"
              value={codigoPostal}
              onChange={(e) => setCodigoPostal(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Zona de tarifa
            </label>
            <input
              type="text"
              value={zonaTarifa}
              onChange={(e) => setZonaTarifa(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Horario
            </label>
            <input
              type="text"
              value={horario}
              onChange={(e) => setHorario(e.target.value)}
              placeholder="Ej: 8:00 - 16:00"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Tipo de camion
            </label>
            <select
              value={tipoCamion}
              onChange={(e) => setTipoCamion(e.target.value)}
              className={inputClass}
            >
              <option value="">Seleccionar...</option>
              <option value="CHASIS">Chasis</option>
              <option value="SEMI">Semi</option>
              <option value="710">710</option>
              <option value="PICK UP">Pick Up</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
        </div>
      </fieldset>

      {/* Datos de carga */}
      <fieldset className="space-y-4 rounded-lg border border-neutral-200 bg-white p-5">
        <legend className="px-2 text-sm font-semibold text-neutral-700">
          Datos de la carga
        </legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Hoja de Ruta / NDV
            </label>
            <input
              type="text"
              value={ndv}
              onChange={(e) => setNdv(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              N° Pallet (PAL)
            </label>
            <input
              type="number"
              value={pal}
              onChange={(e) => setPal(e.target.value)}
              min="0"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Categoria (CAT)
            </label>
            <input
              type="text"
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Nro UN (peligroso)
            </label>
            <input
              type="text"
              value={nroUn}
              onChange={(e) => setNroUn(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Cantidad de bultos
            </label>
            <input
              type="number"
              value={cantidadBultos}
              onChange={(e) => setCantidadBultos(e.target.value)}
              min="0"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              KG netos
            </label>
            <input
              type="number"
              value={pesoKg}
              onChange={(e) => setPesoKg(e.target.value)}
              min="0"
              step="0.01"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Toneladas
            </label>
            <input
              type="number"
              value={toneladas}
              onChange={(e) => setToneladas(e.target.value)}
              min="0"
              step="0.01"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Peon
            </label>
            <input
              type="text"
              value={peon}
              onChange={(e) => setPeon(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
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
          placeholder="Instrucciones especiales, observaciones..."
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
      {pending ? "Enviando..." : "Solicitar viaje"}
    </button>
  );
}
