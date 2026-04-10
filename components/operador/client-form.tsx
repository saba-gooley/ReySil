"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  createClientAction,
  updateClientAction,
  type ClientActionState,
} from "@/lib/server/clients/actions";
import type { ClientRow } from "@/lib/server/clients/queries";

type EmailEntry = { email: string; es_principal: boolean };
type DepositEntry = {
  id?: string;
  nombre: string;
  direccion: string;
  tipo: "DEPOSITO" | "PUERTO";
  activo: boolean;
};

const initialState: ClientActionState = {};

export function ClientForm({ client }: { client?: ClientRow }) {
  const isEdit = !!client;
  const action = isEdit ? updateClientAction : createClientAction;
  const [state, formAction] = useFormState(action, initialState);
  const router = useRouter();

  const [codigo, setCodigo] = useState(client?.codigo ?? "");
  const [nombre, setNombre] = useState(client?.nombre ?? "");
  const [cuit, setCuit] = useState(client?.cuit ?? "");
  const [telefono, setTelefono] = useState(client?.telefono ?? "");
  const [direccion, setDireccion] = useState(client?.direccion ?? "");

  const [emails, setEmails] = useState<EmailEntry[]>(
    client?.client_emails.map((e) => ({
      email: e.email,
      es_principal: e.es_principal,
    })) ?? [{ email: "", es_principal: true }],
  );

  const [depositos, setDepositos] = useState<DepositEntry[]>(
    client?.client_deposits.map((d) => ({
      id: d.id,
      nombre: d.nombre,
      direccion: d.direccion ?? "",
      tipo: d.tipo as "DEPOSITO" | "PUERTO",
      activo: d.activo,
    })) ?? [],
  );

  useEffect(() => {
    if (state.success) {
      router.push("/operador/clientes");
    }
  }, [state.success, router]);

  function handleSubmit(formData: FormData) {
    const payload = {
      ...(isEdit ? { id: client!.id } : {}),
      codigo,
      nombre,
      cuit,
      telefono,
      direccion,
      emails,
      depositos,
    };
    formData.set("payload", JSON.stringify(payload));
    formAction(formData);
  }

  // Email management
  function addEmail() {
    setEmails([...emails, { email: "", es_principal: false }]);
  }

  function removeEmail(index: number) {
    if (emails.length <= 1) return;
    const updated = emails.filter((_, i) => i !== index);
    if (!updated.some((e) => e.es_principal) && updated.length > 0) {
      updated[0].es_principal = true;
    }
    setEmails(updated);
  }

  function setPrincipal(index: number) {
    setEmails(
      emails.map((e, i) => ({ ...e, es_principal: i === index })),
    );
  }

  function updateEmail(index: number, value: string) {
    setEmails(emails.map((e, i) => (i === index ? { ...e, email: value } : e)));
  }

  // Deposit management
  function addDeposito() {
    setDepositos([
      ...depositos,
      { nombre: "", direccion: "", tipo: "DEPOSITO", activo: true },
    ]);
  }

  function removeDeposito(index: number) {
    setDepositos(depositos.filter((_, i) => i !== index));
  }

  function updateDeposito(index: number, field: keyof DepositEntry, value: string | boolean) {
    setDepositos(
      depositos.map((d, i) =>
        i === index ? { ...d, [field]: value } : d,
      ),
    );
  }

  return (
    <form action={handleSubmit} className="space-y-8">
      {state.error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          {state.error}
        </div>
      )}

      {/* Datos del cliente */}
      <fieldset className="space-y-4 rounded-lg border border-neutral-200 bg-white p-5">
        <legend className="px-2 text-sm font-semibold text-neutral-700">
          Datos del cliente
        </legend>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Codigo *
            </label>
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              required
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-reysil-red focus:outline-none focus:ring-1 focus:ring-reysil-red"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Nombre / Razon social *
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-reysil-red focus:outline-none focus:ring-1 focus:ring-reysil-red"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              CUIT
            </label>
            <input
              type="text"
              value={cuit}
              onChange={(e) => setCuit(e.target.value)}
              placeholder="Ej: 20-12345678-9"
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-reysil-red focus:outline-none focus:ring-1 focus:ring-reysil-red"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Telefono
            </label>
            <input
              type="text"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-reysil-red focus:outline-none focus:ring-1 focus:ring-reysil-red"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Direccion
            </label>
            <input
              type="text"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-reysil-red focus:outline-none focus:ring-1 focus:ring-reysil-red"
            />
          </div>
        </div>
      </fieldset>

      {/* Emails de acceso */}
      <fieldset className="space-y-4 rounded-lg border border-neutral-200 bg-white p-5">
        <legend className="px-2 text-sm font-semibold text-neutral-700">
          Emails de acceso
        </legend>
        <p className="text-xs text-neutral-500">
          Cada email genera un usuario con acceso al portal del cliente. El
          email principal recibe las notificaciones.
        </p>

        {emails.map((entry, index) => (
          <div key={index} className="flex items-center gap-3">
            <input
              type="email"
              value={entry.email}
              onChange={(e) => updateEmail(index, e.target.value)}
              placeholder="email@empresa.com"
              required
              className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-reysil-red focus:outline-none focus:ring-1 focus:ring-reysil-red"
            />
            <label className="flex items-center gap-1 text-xs text-neutral-600">
              <input
                type="radio"
                name="principal"
                checked={entry.es_principal}
                onChange={() => setPrincipal(index)}
              />
              Principal
            </label>
            {emails.length > 1 && (
              <button
                type="button"
                onClick={() => removeEmail(index)}
                className="text-sm text-red-500 hover:underline"
              >
                Quitar
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addEmail}
          className="text-sm text-reysil-red hover:underline"
        >
          + Agregar email
        </button>
      </fieldset>

      {/* Depositos preestablecidos */}
      <fieldset className="space-y-4 rounded-lg border border-neutral-200 bg-white p-5">
        <legend className="px-2 text-sm font-semibold text-neutral-700">
          Depositos / Puertos preestablecidos
        </legend>
        <p className="text-xs text-neutral-500">
          Estos valores aparecen en el selector cuando el cliente carga un viaje.
        </p>

        {depositos.length === 0 && (
          <p className="text-sm text-neutral-400">
            No hay depositos cargados.
          </p>
        )}

        {depositos.map((dep, index) => (
          <div
            key={index}
            className="flex flex-wrap items-end gap-3 rounded-md border border-neutral-100 bg-neutral-50 p-3"
          >
            <div className="flex-1 min-w-[180px]">
              <label className="mb-1 block text-xs font-medium text-neutral-600">
                Nombre *
              </label>
              <input
                type="text"
                value={dep.nombre}
                onChange={(e) => updateDeposito(index, "nombre", e.target.value)}
                required
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-reysil-red focus:outline-none focus:ring-1 focus:ring-reysil-red"
              />
            </div>
            <div className="flex-1 min-w-[180px]">
              <label className="mb-1 block text-xs font-medium text-neutral-600">
                Direccion
              </label>
              <input
                type="text"
                value={dep.direccion}
                onChange={(e) =>
                  updateDeposito(index, "direccion", e.target.value)
                }
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-reysil-red focus:outline-none focus:ring-1 focus:ring-reysil-red"
              />
            </div>
            <div className="w-32">
              <label className="mb-1 block text-xs font-medium text-neutral-600">
                Tipo
              </label>
              <select
                value={dep.tipo}
                onChange={(e) => updateDeposito(index, "tipo", e.target.value)}
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-reysil-red focus:outline-none focus:ring-1 focus:ring-reysil-red"
              >
                <option value="DEPOSITO">Deposito</option>
                <option value="PUERTO">Puerto</option>
              </select>
            </div>
            <button
              type="button"
              onClick={() => removeDeposito(index)}
              className="mb-0.5 text-sm text-red-500 hover:underline"
            >
              Quitar
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addDeposito}
          className="text-sm text-reysil-red hover:underline"
        >
          + Agregar deposito
        </button>
      </fieldset>

      {/* Submit */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push("/operador/clientes")}
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
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-reysil-red px-6 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-reysil-red-dark disabled:opacity-50"
    >
      {pending
        ? "Guardando..."
        : isEdit
          ? "Guardar cambios"
          : "Crear cliente"}
    </button>
  );
}
