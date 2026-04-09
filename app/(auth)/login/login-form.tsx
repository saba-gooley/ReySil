"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-reysil-red px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-reysil-red-dark disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Ingresando..." : "Ingresar"}
    </button>
  );
}

export function LoginForm({ next }: { next: string | null }) {
  const [state, formAction] = useFormState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {next ? <input type="hidden" name="next" value={next} /> : null}

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

      <div>
        <label
          htmlFor="password"
          className="mb-1 block text-sm font-medium text-neutral-700"
        >
          Contrasena
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-reysil-red focus:outline-none focus:ring-1 focus:ring-reysil-red"
        />
        {state.fieldErrors?.password ? (
          <p className="mt-1 text-xs text-red-600">
            {state.fieldErrors.password}
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

      <div className="text-center">
        <Link
          href="/recuperar-contrasena"
          className="text-xs text-neutral-600 underline-offset-2 hover:text-reysil-red hover:underline"
        >
          Olvide mi contrasena
        </Link>
      </div>
    </form>
  );
}
