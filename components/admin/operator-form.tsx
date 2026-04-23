"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  createOperatorAction,
  updateOperatorAction,
  resetOperatorPasswordAction,
  type OperatorActionState,
} from "@/lib/server/operators/actions";
import type { OperatorRow } from "@/lib/server/operators/queries";

const initialState: OperatorActionState = {};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-reysil-red px-6 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-reysil-red-dark disabled:opacity-50"
    >
      {pending ? "Guardando..." : label}
    </button>
  );
}

export function OperatorForm({ operator }: { operator?: OperatorRow }) {
  const isEdit = !!operator;
  const action = isEdit ? updateOperatorAction : createOperatorAction;
  const [state, formAction] = useFormState(action, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.success && isEdit && !state.generatedCredentials) {
      router.push("/admin/operadores");
    }
  }, [state.success, isEdit, state.generatedCredentials, router]);

  // Show credentials after create
  if (state.success && state.generatedCredentials) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-green-200 bg-green-50 p-5">
          <h3 className="text-base font-semibold text-green-900">
            {isEdit ? "Contraseña reseteada" : "Operador creado exitosamente"}
          </h3>
          <p className="mt-2 text-sm text-green-800">
            Compartí estas credenciales con el operador.{" "}
            <strong>Se muestran una sola vez.</strong>
          </p>
          <dl className="mt-4 space-y-2 rounded-md border border-green-200 bg-white p-4 font-mono text-sm">
            <div className="flex gap-2">
              <dt className="w-24 font-medium text-neutral-600">Email:</dt>
              <dd className="select-all text-neutral-900">{state.generatedCredentials.email}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-24 font-medium text-neutral-600">Password:</dt>
              <dd className="select-all text-neutral-900">{state.generatedCredentials.password}</dd>
            </div>
          </dl>
        </div>
        <button
          onClick={() => router.push("/admin/operadores")}
          className="rounded-md bg-reysil-red px-6 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-reysil-red-dark"
        >
          Volver a la lista
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{state.error}</div>
      )}
      {isEdit && <input type="hidden" name="id" value={operator.id} />}

      <fieldset className="space-y-4 rounded-lg border border-neutral-200 bg-white p-5">
        <legend className="px-2 text-sm font-semibold text-neutral-700">
          Datos del operador
        </legend>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Nombre completo *
            </label>
            <input
              name="full_name"
              type="text"
              defaultValue={operator?.full_name ?? ""}
              required
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-reysil-red focus:outline-none focus:ring-1 focus:ring-reysil-red"
            />
          </div>

          {!isEdit && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  Email *
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-reysil-red focus:outline-none focus:ring-1 focus:ring-reysil-red"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  Contraseña inicial *
                </label>
                <input
                  name="password"
                  type="text"
                  required
                  minLength={8}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-reysil-red focus:outline-none focus:ring-1 focus:ring-reysil-red"
                />
              </div>
            </>
          )}

          {isEdit && (
            <div className="sm:col-span-1">
              <label className="mb-1 block text-sm font-medium text-neutral-500">Email</label>
              <p className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-500">
                {operator.email}
              </p>
            </div>
          )}
        </div>
      </fieldset>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push("/admin/operadores")}
          className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm hover:bg-neutral-100"
        >
          Cancelar
        </button>
        <SubmitButton label={isEdit ? "Guardar cambios" : "Crear operador"} />
      </div>
    </form>
  );
}

export function ResetPasswordForm({ operator }: { operator: OperatorRow }) {
  const [state, formAction] = useFormState(resetOperatorPasswordAction, initialState);
  const [showForm, setShowForm] = useState(false);

  if (state.success && state.generatedCredentials) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-5">
        <h3 className="text-base font-semibold text-yellow-900">Contraseña reseteada</h3>
        <p className="mt-2 text-sm text-yellow-800">
          <strong>Guardá estas credenciales — no se volverán a mostrar.</strong>
        </p>
        <dl className="mt-4 space-y-2 rounded-md border border-yellow-200 bg-white p-4 font-mono text-sm">
          <div className="flex gap-2">
            <dt className="w-24 font-medium text-neutral-600">Email:</dt>
            <dd className="select-all">{state.generatedCredentials.email}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-24 font-medium text-neutral-600">Password:</dt>
            <dd className="select-all">{state.generatedCredentials.password}</dd>
          </div>
        </dl>
      </div>
    );
  }

  if (!showForm) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-neutral-700">Seguridad</h3>
        <p className="mt-1 text-xs text-neutral-500">
          Resetear la contraseña del operador y mostrar las nuevas credenciales.
        </p>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="mt-3 rounded-md border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
        >
          Resetear contraseña
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="rounded-lg border border-yellow-200 bg-yellow-50 p-5 space-y-4">
      <input type="hidden" name="id" value={operator.id} />
      <h3 className="text-sm font-semibold text-yellow-900">Resetear contraseña</h3>
      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">Nueva contraseña *</label>
        <input
          name="password"
          type="text"
          required
          minLength={8}
          placeholder="Mínimo 8 caracteres"
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none"
        />
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={() => setShowForm(false)} className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100">
          Cancelar
        </button>
        <button type="submit" className="rounded-md bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700">
          Confirmar reset
        </button>
      </div>
    </form>
  );
}
