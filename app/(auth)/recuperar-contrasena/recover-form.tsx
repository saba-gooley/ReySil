"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { recoverPasswordAction, type RecoverState } from "./actions";

const initialState: RecoverState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-reysil-red px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-reysil-red-dark disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Enviando..." : "Enviar instrucciones"}
    </button>
  );
}

export function RecoverForm() {
  const [state, formAction] = useFormState(
    recoverPasswordAction,
    initialState,
  );

  if (state.success) {
    return (
      <div className="space-y-4">
        <div
          role="status"
          className="rounded-md border border-green-200 bg-green-50 px-3 py-3 text-sm text-green-800"
        >
          Si el email esta registrado, recibiras un mensaje con las
          instrucciones para restablecer tu contrasena. El link expira en 1
          hora.
        </div>
        <Link
          href="/login"
          className="block text-center text-xs text-neutral-600 underline-offset-2 hover:text-reysil-red hover:underline"
        >
          Volver a ingresar
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <p className="text-xs text-neutral-600">
        Ingresa tu email y te enviaremos un link para restablecer tu
        contrasena.
      </p>

      <div>
        <label
          htmlFor="email"
          className="mb-1 block text-sm font-medium text-neutral-700"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-reysil-red focus:outline-none focus:ring-1 focus:ring-reysil-red"
        />
        {state.fieldErrors?.email ? (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.email}</p>
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

      <div className="text-center">
        <Link
          href="/login"
          className="text-xs text-neutral-600 underline-offset-2 hover:text-reysil-red hover:underline"
        >
          Volver a ingresar
        </Link>
      </div>
    </form>
  );
}
