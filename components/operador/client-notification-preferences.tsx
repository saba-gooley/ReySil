"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useState } from "react";
import {
  addClientNotificationPreference,
  updateClientNotificationPreference,
  deleteClientNotificationPreference,
  type PreferenceActionState,
} from "@/lib/server/notifications/client-preferences-actions";
import type { ClientNotificationPreference } from "@/lib/server/notifications/client-preferences-queries";

const initialState: PreferenceActionState = {};

type Props = {
  clientId: string;
  preferences: ClientNotificationPreference[];
};

export function ClientNotificationPreferences({
  clientId,
  preferences,
}: Props) {
  const [addState, addAction] = useFormState(
    addClientNotificationPreference,
    initialState,
  );
  const [newEmail, setNewEmail] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function handleAddSubmit(formData: FormData) {
    formData.set(
      "payload",
      JSON.stringify({
        client_id: clientId,
        email: newEmail,
        enviar_al_crear_solicitud: true,
        enviar_al_asignar_chofer: true,
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
        <h4 className="text-sm font-semibold text-neutral-900">
          Mails de notificación
        </h4>
        <p className="text-xs text-neutral-500 mt-1">
          Especifica a qué direcciones de email se deben enviar notificaciones al crear solicitudes y asignar choferes.
        </p>
      </div>

      {/* Add new email */}
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
            placeholder="nombre@dominio.com"
            className={`${inputClass} flex-1 text-xs`}
            required
          />
          <SubmitBtn />
        </div>
      </form>

      {/* List of preferences */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {preferences.length === 0 ? (
          <p className="text-xs text-neutral-500 italic">
            Sin emails configurados
          </p>
        ) : (
          preferences.map((pref) => (
            <PreferenceRow
              key={pref.id}
              preference={pref}
              isExpanded={expandedId === pref.id}
              onToggle={() =>
                setExpandedId(expandedId === pref.id ? null : pref.id)
              }
            />
          ))
        )}
      </div>
    </div>
  );
}

function PreferenceRow({
  preference,
  isExpanded,
  onToggle,
}: {
  preference: ClientNotificationPreference;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const [updateState, updateAction] = useFormState(
    updateClientNotificationPreference,
    initialState,
  );
  const [deleteState, deleteAction] = useFormState(
    deleteClientNotificationPreference,
    initialState,
  );

  function handleUpdate(enviar_al_crear: boolean, enviar_al_asignar: boolean) {
    const formData = new FormData();
    formData.set(
      "payload",
      JSON.stringify({
        id: preference.id,
        enviar_al_crear_solicitud: enviar_al_crear,
        enviar_al_asignar_chofer: enviar_al_asignar,
      }),
    );
    updateAction(formData);
  }

  function handleDelete() {
    if (confirm(`¿Eliminar email ${preference.email}?`)) {
      const formData = new FormData();
      formData.set("id", preference.id);
      deleteAction(formData);
    }
  }

  return (
    <div className="rounded-md border border-neutral-200 bg-white overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-4 py-2 text-left hover:bg-neutral-50 flex items-center justify-between"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-neutral-900 truncate">
            {preference.email}
          </p>
          <p className="text-xs text-neutral-500 mt-0.5">
            {preference.enviar_al_crear_solicitud && "Solicitudes"}{" "}
            {preference.enviar_al_crear_solicitud && preference.enviar_al_asignar_chofer && "• "}
            {preference.enviar_al_asignar_chofer && "Asignaciones"}
          </p>
        </div>
        <span className="text-neutral-400">
          {isExpanded ? "−" : "+"}
        </span>
      </button>

      {isExpanded && (
        <div className="border-t border-neutral-200 px-4 py-3 space-y-3 bg-neutral-50">
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={preference.enviar_al_crear_solicitud}
                onChange={(e) =>
                  handleUpdate(
                    e.target.checked,
                    preference.enviar_al_asignar_chofer,
                  )
                }
                className="h-4 w-4 rounded border-neutral-300 text-reysil-red"
              />
              <span className="text-sm text-neutral-700">
                Enviar al crear solicitud
              </span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={preference.enviar_al_asignar_chofer}
                onChange={(e) =>
                  handleUpdate(preference.enviar_al_crear_solicitud, e.target.checked)
                }
                className="h-4 w-4 rounded border-neutral-300 text-reysil-red"
              />
              <span className="text-sm text-neutral-700">
                Enviar al asignar chofer
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

function SubmitBtn() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-reysil-red px-4 py-2 text-sm font-medium text-white hover:bg-reysil-red-dark disabled:opacity-50"
    >
      {pending ? "..." : "Agregar"}
    </button>
  );
}
