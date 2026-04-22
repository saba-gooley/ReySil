"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  createDriverAction,
  updateDriverAction,
  resetDriverPasswordAction,
  type DriverActionState,
} from "@/lib/server/drivers/actions";
import type { DriverRow } from "@/lib/server/drivers/queries";

const initialState: DriverActionState = {};

export function DriverForm({ driver }: { driver?: DriverRow }) {
  const isEdit = !!driver;
  const action = isEdit ? updateDriverAction : createDriverAction;
  const [state, formAction] = useFormState(action, initialState);
  const router = useRouter();

  const [codigo, setCodigo] = useState(driver?.codigo ?? "");
  const [dni, setDni] = useState(driver?.dni ?? "");
  const [nombre, setNombre] = useState(driver?.nombre ?? "");
  const [apellido, setApellido] = useState(driver?.apellido ?? "");
  const [telefono, setTelefono] = useState(driver?.telefono ?? "");

  // On edit success, redirect
  useEffect(() => {
    if (state.success && isEdit) {
      router.push("/operador/choferes");
    }
  }, [state.success, isEdit, router]);

  // On create success, show credentials (don't redirect yet)
  if (state.success && state.generatedCredentials) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-green-200 bg-green-50 p-5">
          <h3 className="text-base font-semibold text-green-900">
            Chofer creado exitosamente
          </h3>
          <p className="mt-2 text-sm text-green-800">
            Las credenciales de acceso se muestran a continuacion.{" "}
            <strong>
              Copialas ahora — no se van a volver a mostrar.
            </strong>
          </p>
          <dl className="mt-4 space-y-2 rounded-md border border-green-200 bg-white p-4 font-mono text-sm">
            <div className="flex gap-2">
              <dt className="w-24 font-medium text-neutral-600">Email:</dt>
              <dd className="select-all text-neutral-900">
                {state.generatedCredentials.email}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-24 font-medium text-neutral-600">Password:</dt>
              <dd className="select-all text-neutral-900">
                {state.generatedCredentials.password}
              </dd>
            </div>
          </dl>
        </div>
        <button
          onClick={() => router.push("/operador/choferes")}
          className="rounded-md bg-reysil-red px-6 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-reysil-red-dark"
        >
          Volver a la lista
        </button>
      </div>
    );
  }

  function handleSubmit(formData: FormData) {
    const payload = {
      ...(isEdit ? { id: driver!.id } : {}),
      codigo,
      dni,
      nombre,
      apellido,
      telefono,
    };
    formData.set("payload", JSON.stringify(payload));
    formAction(formData);
  }

  return (
    <form action={handleSubmit} className="space-y-8">
      {state.error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <fieldset className="space-y-4 rounded-lg border border-neutral-200 bg-white p-5">
        <legend className="px-2 text-sm font-semibold text-neutral-700">
          Datos del chofer
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
              DNI *
            </label>
            <input
              type="text"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              required
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-reysil-red focus:outline-none focus:ring-1 focus:ring-reysil-red"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Nombre *
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
              Apellido *
            </label>
            <input
              type="text"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              required
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
        </div>

        {!isEdit && (
          <p className="text-xs text-neutral-500">
            Las credenciales de acceso a la app se generan automaticamente al
            crear el chofer. Se muestran una sola vez despues de guardar.
          </p>
        )}
      </fieldset>

      {isEdit && driver && <PasswordResetSection driverId={driver.id} />}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push("/operador/choferes")}
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
          : "Crear chofer"}
    </button>
  );
}

function PasswordResetSection({ driverId }: { driverId: string }) {
  const [state, formAction] = useFormState(resetDriverPasswordAction, {});
  const [isResetting, setIsResetting] = useState(false);

  if (state.success && state.generatedCredentials) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-5">
          <h3 className="text-base font-semibold text-yellow-900">
            Contraseña reseteada
          </h3>
          <p className="mt-2 text-sm text-yellow-800">
            Se ha generado una nueva contraseña temporal. Copialas ahora — no se
            van a volver a mostrar.
          </p>
          <dl className="mt-4 space-y-2 rounded-md border border-yellow-200 bg-white p-4 font-mono text-sm">
            <div className="flex gap-2">
              <dt className="w-24 font-medium text-neutral-600">Email:</dt>
              <dd className="select-all text-neutral-900">
                {state.generatedCredentials.email}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-24 font-medium text-neutral-600">Password:</dt>
              <dd className="select-all text-neutral-900">
                {state.generatedCredentials.password}
              </dd>
            </div>
          </dl>
          <button
            type="button"
            onClick={() => setIsResetting(false)}
            className="mt-4 rounded-md bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700"
          >
            Ok
          </button>
        </div>
      </div>
    );
  }

  if (isResetting) {
    return (
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="driver_id" value={driverId} />
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-5">
          <h3 className="text-base font-semibold text-yellow-900">
            ¿Resetear contraseña?
          </h3>
          <p className="mt-2 text-sm text-yellow-800">
            Se generará una nueva contraseña temporal para este chofer. Se
            mostrarán las nuevas credenciales.
          </p>
          {state.error && (
            <div className="mt-3 rounded bg-red-100 p-2 text-sm text-red-700">
              {state.error}
            </div>
          )}
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => setIsResetting(false)}
              className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-md bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700"
            >
              Resetear contraseña
            </button>
          </div>
        </div>
      </form>
    );
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-neutral-700">Seguridad</h3>
      <p className="mt-1 text-xs text-neutral-500">
        Si el chofer olvidó su contraseña, puedes resetearla aquí.
      </p>
      <button
        type="button"
        onClick={() => setIsResetting(true)}
        className="mt-3 rounded-md border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
      >
        Resetear contraseña
      </button>
    </div>
  );
}
