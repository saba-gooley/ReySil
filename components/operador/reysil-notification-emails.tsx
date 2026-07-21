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
  enviar_remitos: boolean;
  enviar_salida_deposito: boolean;
  enviar_ediciones: boolean;
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
        enviar_remitos: true,
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

  /**
   * Recibe solo lo que cambia y completa el resto con lo que ya estaba.
   * Antes eran booleanos posicionales: con cinco checkboxes era cuestion de
   * tiempo mandar uno en la posicion equivocada y pisar la preferencia de al lado.
   */
  function handleUpdate(cambio: Partial<Omit<ReysilNotificationEmail, "id" | "email">>) {
    const formData = new FormData();
    formData.set(
      "payload",
      JSON.stringify({
        id: emailRow.id,
        enviar_solicitudes: emailRow.enviar_solicitudes,
        enviar_asignaciones: emailRow.enviar_asignaciones,
        enviar_remitos: emailRow.enviar_remitos,
        enviar_salida_deposito: emailRow.enviar_salida_deposito,
        enviar_ediciones: emailRow.enviar_ediciones,
        ...cambio,
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
            {[
              emailRow.enviar_solicitudes && "Solicitudes",
              emailRow.enviar_asignaciones && "Asignaciones",
              emailRow.enviar_remitos && "Remitos",
              emailRow.enviar_salida_deposito && "Salida depósito",
              emailRow.enviar_ediciones && "Ediciones",
            ].filter(Boolean).join(" • ") || "Sin notificaciones"}
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
                onChange={(e) => handleUpdate({ enviar_solicitudes: e.target.checked })}
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
                onChange={(e) => handleUpdate({ enviar_asignaciones: e.target.checked })}
                className="h-4 w-4 rounded border-neutral-300 text-reysil-red"
              />
              <span className="text-sm text-neutral-700">
                Enviar copias de asignaciones de chofer
              </span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={emailRow.enviar_remitos}
                onChange={(e) => handleUpdate({ enviar_remitos: e.target.checked })}
                className="h-4 w-4 rounded border-neutral-300 text-reysil-red"
              />
              <span className="text-sm text-neutral-700">
                Enviar copias al cargar remito
              </span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={emailRow.enviar_salida_deposito}
                onChange={(e) => handleUpdate({ enviar_salida_deposito: e.target.checked })}
                className="h-4 w-4 rounded border-neutral-300 text-reysil-red"
              />
              <span className="text-sm text-neutral-700">
                Enviar copias al salir del depósito (Contenedor)
              </span>
            </label>

            {/* req. 2.16 — solo se dispara cuando edita el CLIENTE */}
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={emailRow.enviar_ediciones}
                onChange={(e) => handleUpdate({ enviar_ediciones: e.target.checked })}
                className="h-4 w-4 rounded border-neutral-300 text-reysil-red"
              />
              <span className="text-sm text-neutral-700">
                Avisar cuando el cliente modifica una solicitud
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
