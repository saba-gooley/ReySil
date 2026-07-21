"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createRepartoForClientAction, type TripActionState } from "@/lib/server/trips/actions";
import { updateRepartoAction } from "@/lib/server/trips/edit-actions";
import { MultiplesDestinosSection } from "@/components/ui/multiples-destinos";
import {
  emptyRepartoValues,
  type DestinoEntry,
  type RepartoInitialValues,
} from "@/lib/utils/reparto-form";

type Client = { id: string; nombre: string };
type Deposit = { id: string; nombre: string; direccion: string | null; tipo: string };

const initialState: TripActionState = {};

/**
 * Formulario de Reparto del operador. Sirve para el alta y, desde el req 2.16,
 * tambien para editar una solicitud existente.
 *
 * En modo "edit" el cliente queda fijo: un viaje no cambia de dueno al
 * editarse (lo refuerza el trigger de la migracion 0024).
 */
export function OperatorRepartoForm({
  clients,
  truckTypes,
  mode = "create",
  initialValues,
  onDone,
}: {
  clients: Client[];
  truckTypes: string[];
  mode?: "create" | "edit";
  initialValues?: RepartoInitialValues;
  onDone?: () => void;
}) {
  const isEdit = mode === "edit";
  const init = initialValues ?? emptyRepartoValues();

  const [state, formAction] = useFormState(
    isEdit ? updateRepartoAction : createRepartoForClientAction,
    initialState,
  );
  const router = useRouter();

  const [clientId, setClientId] = useState(init.clientId);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loadingDeposits, setLoadingDeposits] = useState(false);
  const [fechaSolicitada, setFechaSolicitada] = useState(init.fechaSolicitada);
  const [fechaEntrega, setFechaEntrega] = useState(init.fechaEntrega);
  const [origenDepositId, setOrigenDepositId] = useState(init.origenDepositId);
  const [origenDescripcion, setOrigenDescripcion] = useState(init.origenDescripcion);
  const [destinoDescripcion, setDestinoDescripcion] = useState(init.destinoDescripcion);
  const [observaciones, setObservaciones] = useState(init.observaciones);
  const [ndv, setNdv] = useState(init.ndv);
  const [pal, setPal] = useState(init.pal);
  const [cat, setCat] = useState(init.cat);
  const [nroUn, setNroUn] = useState(init.nroUn);
  const [cantidadBultos, setCantidadBultos] = useState(init.cantidadBultos);
  const [pesoKg, setPesoKg] = useState(init.pesoKg);
  const [toneladas, setToneladas] = useState(init.toneladas);
  const [codigoPostal, setCodigoPostal] = useState(init.codigoPostal);
  const [zonaTarifa, setZonaTarifa] = useState(init.zonaTarifa);
  const [horario, setHorario] = useState(init.horario);
  const [tipoCamion, setTipoCamion] = useState(init.tipoCamion);
  const [peon, setPeon] = useState(init.peon);
  const [multiplesDestinos, setMultiplesDestinos] = useState(init.multiplesDestinos);
  const [destinos, setDestinos] = useState<DestinoEntry[]>(init.destinos);

  useEffect(() => {
    if (!state.success) return;
    if (isEdit) {
      onDone?.();
      router.refresh();
    } else {
      router.push("/operador/pendientes");
    }
  }, [state.success, isEdit, onDone, router]);

  useEffect(() => {
    if (!clientId) {
      setDeposits([]);
      setOrigenDepositId("");
      return;
    }
    setLoadingDeposits(true);
    fetch(`/api/clients/deposits?client_id=${clientId}`)
      .then((r) => r.json())
      .then((data) => setDeposits(data))
      .catch(() => setDeposits([]))
      .finally(() => setLoadingDeposits(false));
  }, [clientId]);

  function handleSubmit(formData: FormData) {
    const payload = {
      // En edicion el viaje ya tiene dueno; el id manda y client_id se ignora.
      ...(isEdit ? { trip_id: init.tripId } : {}),
      client_id: clientId,
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
      multiples_destinos: multiplesDestinos,
      destinos: multiplesDestinos
        ? destinos.map((d) => ({ destino: d.destino, observaciones: d.observaciones }))
        : [],
    };
    formData.set("payload", JSON.stringify(payload));
    formAction(formData);
  }

  const inputClass =
    "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-reysil-red focus:outline-none focus:ring-1 focus:ring-reysil-red";

  return (
    <form action={handleSubmit} className="space-y-6">
      {state.error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{state.error}</div>
      )}

      {/* Selector de cliente — en edicion el viaje no cambia de dueno */}
      <fieldset className="space-y-4 rounded-lg border-2 border-reysil-red bg-reysil-red-light p-5">
        <legend className="px-2 text-sm font-semibold text-reysil-red">
          Cliente
        </legend>
        {isEdit ? (
          <div className="text-sm text-neutral-700">
            <span className="font-medium">
              {clients.find((c) => c.id === clientId)?.nombre ?? "—"}
            </span>
            <span className="ml-2 text-xs text-neutral-500">
              (el cliente de una solicitud no se puede cambiar)
            </span>
          </div>
        ) : (
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Cargar solicitud para *
            </label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              required
              className={inputClass}
            >
              <option value="">Seleccioná un cliente...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
            {state.fieldErrors?.client_id && (
              <p className="mt-1 text-xs text-red-600">{state.fieldErrors.client_id[0]}</p>
            )}
          </div>
        )}
      </fieldset>

      {/* Datos del viaje */}
      <fieldset className="space-y-4 rounded-lg border border-neutral-200 bg-white p-5">
        <legend className="px-2 text-sm font-semibold text-neutral-700">Datos del viaje</legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Fecha de carga *</label>
            <input type="date" value={fechaSolicitada} onChange={(e) => setFechaSolicitada(e.target.value)} required className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Fecha de entrega</label>
            <input type="date" value={fechaEntrega} onChange={(e) => setFechaEntrega(e.target.value)} min={fechaSolicitada || undefined} className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Deposito / Puerto</label>
            <select value={origenDepositId} onChange={(e) => setOrigenDepositId(e.target.value)} className={inputClass} disabled={loadingDeposits}>
              <option value="">{loadingDeposits ? "Cargando..." : "Seleccionar..."}</option>
              {deposits.map((d) => (
                <option key={d.id} value={d.id}>{d.nombre} ({d.tipo})</option>
              ))}
              <option value="otro">Otro (texto libre)</option>
            </select>
          </div>
          {origenDepositId === "otro" && (
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Descripcion del origen</label>
              <input type="text" value={origenDescripcion} onChange={(e) => setOrigenDescripcion(e.target.value)} placeholder="Direccion o lugar" className={inputClass} />
            </div>
          )}
          {!multiplesDestinos && (
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Destino</label>
              <input type="text" value={destinoDescripcion} onChange={(e) => setDestinoDescripcion(e.target.value)} className={inputClass} />
            </div>
          )}
          <div className="sm:col-span-2">
            <MultiplesDestinosSection
              enabled={multiplesDestinos}
              onToggle={(val) => {
                setMultiplesDestinos(val);
                if (val && destinoDescripcion) {
                  setDestinos([{ key: 1, destino: destinoDescripcion, observaciones: "" }]);
                }
              }}
              destinos={destinos}
              onUpdate={setDestinos}
              inputClass={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Codigo postal</label>
            <input type="text" value={codigoPostal} onChange={(e) => setCodigoPostal(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Zona de tarifa</label>
            <input type="text" value={zonaTarifa} onChange={(e) => setZonaTarifa(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Horario</label>
            <input type="text" value={horario} onChange={(e) => setHorario(e.target.value)} placeholder="Ej: 8:00 - 16:00" className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Tipo de camion</label>
            <select value={tipoCamion} onChange={(e) => setTipoCamion(e.target.value)} className={inputClass}>
              <option value="">Seleccionar...</option>
              {truckTypes.map((tt) => (
                <option key={tt} value={tt}>
                  {tt}
                </option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      {/* Datos de carga */}
      <fieldset className="space-y-4 rounded-lg border border-neutral-200 bg-white p-5">
        <legend className="px-2 text-sm font-semibold text-neutral-700">Datos de la carga</legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Hoja de Ruta / NDV</label>
            <input type="text" value={ndv} onChange={(e) => setNdv(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">N° Pallet (PAL)</label>
            <input type="number" value={pal} onChange={(e) => setPal(e.target.value)} min="0" className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Categoria (CAT)</label>
            <input type="text" value={cat} onChange={(e) => setCat(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Nro UN (peligroso)</label>
            <input type="text" value={nroUn} onChange={(e) => setNroUn(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Cantidad de bultos</label>
            <input type="number" value={cantidadBultos} onChange={(e) => setCantidadBultos(e.target.value)} min="0" className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">KG netos</label>
            <input type="number" value={pesoKg} onChange={(e) => setPesoKg(e.target.value)} min="0" step="0.01" className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Toneladas</label>
            <input type="number" value={toneladas} onChange={(e) => setToneladas(e.target.value)} min="0" step="0.01" className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Peon</label>
            <select value={peon} onChange={(e) => setPeon(e.target.value)} className={inputClass}>
              <option value="">Seleccionar...</option>
              <option value="SI">Si</option>
              <option value="NO">No</option>
            </select>
          </div>
        </div>
      </fieldset>

      {/* Comentarios */}
      <fieldset className="space-y-4 rounded-lg border border-neutral-200 bg-white p-5">
        <legend className="px-2 text-sm font-semibold text-neutral-700">Comentarios</legend>
        <textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} rows={3} placeholder="Instrucciones especiales, observaciones..." className={inputClass} />
      </fieldset>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => (isEdit ? onDone?.() : router.push("/operador/solicitudes"))}
          className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm hover:bg-neutral-100"
        >
          Cancelar
        </button>
        <SubmitButton isEdit={isEdit} />
      </div>
    </form>
  );
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="rounded-md bg-reysil-red px-6 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-reysil-red-dark disabled:opacity-50">
      {pending ? "Guardando..." : isEdit ? "Guardar cambios" : "Cargar solicitud"}
    </button>
  );
}
