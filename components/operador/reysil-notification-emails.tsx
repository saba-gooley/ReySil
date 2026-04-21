"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useState } from "react";
import {
  addReysilNotificationEmail,
  updateReysilNotificationEmail,
  deleteReysilNotificationEmail,
  type PreferenceActionState,
} from "@/lib/server/notifications/client-preferences-actions";

export type ReysilNotificationEmail = {
  id: string;
  email: string;
  enviar_solicitudes: boolean;
  enviar_asignaciones: boolean;
  created_at: string;
  updated_at: string;
};

const initialState: PreferenceActionState = {};

type Props = {
  emails: ReysilNotificationEmail[];
};

export function ReysilNotificationEmails({ emails }: Props) {
  const [addState, addAction] = useFormState(
    addReysilNotificationEmail,
    initialState,
  );
  const [newEmail, setNewEmail] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function handleAddSubmit(formData: FormData) {
    formData.set(
      "payload",
      JSON.stringify({
        email: newEmail,
        enviar_solicitudes: true,
        enviar_asignaciones: true,
      }),
    );
    addAction(formData);
    setNewEmail("");
  }

  const inputClass =
    "rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-reysil-red focus:outline-none focus:ring-1 focus:ring-reysil-red";

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-neutral-900">
          Mails internos de ReySil
        </h3>
        <p className="text-sm text-neutral-500 mt-2">
          Configura qué direcciones internas de ReySil deben recibir copias de solicitudes y asignaciones.
        </p>
      </div>

      {/* Add new email */}
      <div className="rounded-md border border-neutral-200 bg-white p-4">
        <h4 className="text-sm font-medium text-neutral-900 mb-3">
          Agregar email interno
        </h4>
        <form action={handleAddSubmit} className="space-y-2">
          {addState.error && (
            <div className="text-xs text-red-600">{addState.error}</div>
          )}
          {addState.success && (
            <div className="text-xs text-green-600">Email agregado</div>
          )}
          <div className="flex gap-2">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="operador@reysil.com"
              className={`${inputClass} flex-1 text-sm`}
              required
            />
            <AddEmailBtn />
          </div>
        </form>
      </div>

      {/* List of emails */}
      <div className="space-y-2">
        {emails.length === 0 ? (
          <div className="rounded-md border border-neutral-200 bg-neutral-50 p-4 text-center text-sm text-neutral-500">
            Sin emails configurados
          </div>
        ) : (
          emails.map((emailRow) => (
            <EmailRow
              key={emailRow.id}
              emailRow={emailRow}
              isExpanded={expandedId === emailRow.id}
              onToggle={() =>
                setExpandedId(expandedId === emailRow.id ? null : emailRow.id)
              }
            />
          ))
        )}
      </div>
    </div>
  );
}

function EmailRow({
  emailRow,
  isExpanded,
  onToggle,
}: {
  emailRow: ReysilNotificationEmail;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const [updateState, updateAction] = useFormState(
    updateReysilNotificationEmail,
    initialState,
  );
  const [deleteState, deleteAction] = useFormState(
    deleteReysilNotificationEmail,
    initialState,
  );

  function handleUpdate(enviar_solicitudes: boolean, enviar_asignaciones: boolean) {
    const formData = new FormData();
    formData.set(
      "payload",
      JSON.stringify({
        id: emailRow.id,
        enviar_solicitudes,
        enviar_asignaciones,
      }),
    );
    updateAction(formData);
  }

  function handleDelete() {
    if (confirm(`¿Eliminar email ${emailRow.email}?`)) {
      const formData = new FormData();
      formData.set("id", emailRow.id);
      deleteAction(formData);
    }
  }

  return (
    <div className="rounded-md border border-neutral-200 bg-white overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-4 py-3 text-left hover:bg-neutral-50 flex items-center justify-between"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-neutral-900">{emailRow.email}</p>
          <p className="text-xs text-neutral-500 mt-0.5">
            {emailRow.enviar_solicitudes && "Solicitudes"}{" "}
            {emailRow.enviar_solicitudes && emailRow.enviar_asignaciones && "• "}
            {emailRow.enviar_asignaciones && "Asignaciones"}
          </p>
        </div>
        <span className="text-neutral-400">
          {isExpanded ? "−" : "+"}
        </span>
      </button>

      {isExpanded && (
        <div className="border-t border-neutral-200 px-4 py-4 space-y-3 bg-neutral-50">
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={emailRow.enviar_solicitudes}
                onChange={(e) =>
                  handleUpdate(e.target.checked, emailRow.enviar_asignaciones)
                }
                className="h-4 w-4 rounded border-neutral-300 text-reysil-red"
              />
              <span className="text-sm text-neutral-700">
                Enviar copias de solicitudes (REPARTO y CONTENEDOR)
              </span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={emailRow.enviar_asignaciones}
                onChange={(e) =>
                  handleUpdate(emailRow.enviar_solicitudes, e.target.checked)
                }
                className="h-4 w-4 rounded border-neutral-300 text-reysil-red"
              />
              <span className="text-sm text-neutral-700">
                Enviar copias de asignaciones de chofer
              </span>
            </label>
          </div>

          {updateState.error && (
            <p className="text-xs text-red-600">{updateState.error}</p>
          )}

          <button
            type="button"
            onClick={handleDelete}
            className="w-full rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
          >
            Eliminar email
          </button>

          {deleteState.error && (
            <p className="text-xs text-red-600">{deleteState.error}</p>
          )}
        </div>
      )}
    </div>
  );
}

function AddEmailBtn() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-reysil-red px-4 py-2 text-sm font-medium text-white hover:bg-reysil-red-dark disabled:opacity-50 whitespace-nowrap"
    >
      {pending ? "..." : "Agregar"}
    </button>
  );
}
