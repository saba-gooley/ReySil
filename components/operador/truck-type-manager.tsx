"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createTruckTypeAction,
  updateTruckTypeAction,
  deactivateTruckTypeAction,
  reactivateTruckTypeAction,
} from "@/lib/server/truck-types/actions";
import type { TruckType } from "@/lib/server/truck-types/queries";

export function TruckTypeManager({
  truckTypes,
  isAdmin,
}: {
  truckTypes: TruckType[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [newNombre, setNewNombre] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState("");

  const activos = truckTypes.filter((t) => t.is_active);
  const inactivos = truckTypes.filter((t) => !t.is_active);

  async function run(fn: () => Promise<unknown>) {
    setLoading(true);
    setError(null);
    try {
      await fn();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!newNombre.trim()) return;
    await run(async () => {
      await createTruckTypeAction({ nombre: newNombre });
      setNewNombre("");
    });
  }

  async function handleUpdate(id: string) {
    if (!editNombre.trim()) return;
    await run(async () => {
      await updateTruckTypeAction(id, { nombre: editNombre });
      setEditingId(null);
    });
  }

  const inputClass =
    "rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-reysil-red focus:outline-none focus:ring-1 focus:ring-reysil-red";

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!isAdmin && (
        <p className="rounded-md bg-neutral-50 border border-neutral-200 p-3 text-xs text-neutral-500">
          Solo el Administrador puede modificar los tipos de camión.
        </p>
      )}

      {isAdmin && (
        <div className="flex items-end gap-2">
          <div className="flex-1 max-w-sm">
            <label className="mb-1 block text-xs font-medium text-neutral-500">
              Nuevo tipo de camión
            </label>
            <input
              type="text"
              value={newNombre}
              onChange={(e) => setNewNombre(e.target.value)}
              placeholder="Ej: SEMI"
              className={`${inputClass} w-full`}
            />
          </div>
          <button
            type="button"
            onClick={handleCreate}
            disabled={loading || !newNombre.trim()}
            className="rounded-md bg-reysil-red px-4 py-2 text-sm font-medium text-white hover:bg-reysil-red-dark disabled:opacity-50"
          >
            Agregar
          </button>
        </div>
      )}

      <div className="rounded-lg border border-neutral-200 bg-white">
        <h3 className="border-b border-neutral-200 px-4 py-3 text-sm font-semibold text-neutral-900">
          Activos ({activos.length})
        </h3>
        {activos.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-neutral-400">
            No hay tipos de camión activos.
          </p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {activos.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 px-4 py-3">
                {editingId === t.id ? (
                  <div className="flex flex-1 items-center gap-2">
                    <input
                      type="text"
                      value={editNombre}
                      onChange={(e) => setEditNombre(e.target.value)}
                      className={`${inputClass} flex-1 max-w-xs`}
                    />
                    <button
                      type="button"
                      onClick={() => handleUpdate(t.id)}
                      disabled={loading}
                      className="rounded-md bg-reysil-red px-3 py-1.5 text-xs font-medium text-white hover:bg-reysil-red-dark disabled:opacity-50"
                    >
                      Guardar
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-sm text-neutral-900">{t.nombre}</span>
                    {isAdmin && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(t.id);
                            setEditNombre(t.nombre);
                          }}
                          className="text-xs text-reysil-red hover:underline"
                        >
                          Modificar
                        </button>
                        <button
                          type="button"
                          onClick={() => run(() => deactivateTruckTypeAction(t.id))}
                          disabled={loading}
                          className="text-xs text-neutral-500 hover:underline disabled:opacity-50"
                        >
                          Dar de baja
                        </button>
                      </div>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {inactivos.length > 0 && (
        <div className="rounded-lg border border-neutral-200 bg-white">
          <h3 className="border-b border-neutral-200 px-4 py-3 text-sm font-semibold text-neutral-400">
            Inactivos ({inactivos.length})
          </h3>
          <ul className="divide-y divide-neutral-100">
            {inactivos.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <span className="text-sm text-neutral-400 line-through">{t.nombre}</span>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => run(() => reactivateTruckTypeAction(t.id))}
                    disabled={loading}
                    className="text-xs text-reysil-red hover:underline disabled:opacity-50"
                  >
                    Reactivar
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
