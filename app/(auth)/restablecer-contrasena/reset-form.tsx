"use client";

import { useFormState, useFormStatus } from "react-dom";
import { resetPasswordAction, type ResetState } from "./actions";

const initialState: ResetState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-reysil-red px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-reysil-red-dark disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Guardando..." : "Guardar nueva contrasena"}
    </button>
  );
}

export function ResetForm() {
  const [state, formAction] = useFormState(resetPasswordAction, initialState);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <p className="text-xs text-neutral-600">
        Ingresa tu nueva contrasena. Despues de guardar, accederas al sistema
        automaticamente.
      </p>

      <div>
        <label
          htmlFor="password"
          className="mb-1 block text-sm font-medium text-neutral-700"
        >
          Nueva contrasena
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-reysil-red focus:outline-none focus:ring-1 focus:ring-reysil-red"
        />
        {state.fieldErrors?.password ? (
          <p className="mt-1 text-xs text-red-600">
            {state.fieldErrors.password}
          </p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="mb-1 block text-sm font-medium text-neutral-700"
        >
          Confirmar contrasena
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-reysil-red focus:outline-none focus:ring-1 focus:ring-reysil-red"
        />
        {state.fieldErrors?.confirmPassword ? (
          <p className="mt-1 text-xs text-red-600">
            {state.fieldErrors.confirmPassword}
          </p>
        ) : null}
      </div>

      {state.error ? (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {state.error}
        </div>
      ) : null}

      <SubmitButton />
    </form>
  );
}
