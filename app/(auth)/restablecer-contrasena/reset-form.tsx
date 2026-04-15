"use client";

import { useState } from "react";
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            className="w-full rounded-md border border-neutral-300 px-3 py-2 pr-10 text-sm shadow-sm focus:border-reysil-red focus:outline-none focus:ring-1 focus:ring-reysil-red"
          />
          <button
            type="button"
            onClick={() => setShowPassword((previous) => !previous)}
            aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-neutral-500 transition hover:text-neutral-700"
          >
            {showPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3.11-11-7.5a11.82 11.82 0 0 1 5.17-5.94" />
                <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c5 0 9.27 3.11 11 7.5a11.89 11.89 0 0 1-1.67 2.88" />
                <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                <path d="M1 1l22 22" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
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
        <div className="relative">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            className="w-full rounded-md border border-neutral-300 px-3 py-2 pr-10 text-sm shadow-sm focus:border-reysil-red focus:outline-none focus:ring-1 focus:ring-reysil-red"
          />
          <button
            type="button"
            onClick={() =>
              setShowConfirmPassword((previous) => !previous)
            }
            aria-label={
              showConfirmPassword
                ? "Ocultar confirmacion de contrasena"
                : "Mostrar confirmacion de contrasena"
            }
            className="absolute inset-y-0 right-0 flex items-center px-3 text-neutral-500 transition hover:text-neutral-700"
          >
            {showConfirmPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3.11-11-7.5a11.82 11.82 0 0 1 5.17-5.94" />
                <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c5 0 9.27 3.11 11 7.5a11.89 11.89 0 0 1-1.67 2.88" />
                <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                <path d="M1 1l22 22" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
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
