"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OperatorRepartoForm } from "./operator-reparto-form";
import type { RepartoInitialValues } from "@/lib/utils/reparto-form";

type EditData = {
  initialValues: RepartoInitialValues;
  clientName: string;
  truckTypes: string[];
};

/**
 * Req. 2.16 — Boton "Editar" + dialogo con el formulario de la solicitud.
 *
 * Los datos se piden recien al abrir: la grilla puede tener cientos de filas
 * y no tiene sentido cargar el detalle de todas.
 */
export function TripEditDialog({
  tripId,
  codigo,
  onDone,
  triggerClassName,
}: {
  tripId: string;
  codigo: string;
  onDone?: () => void;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<EditData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleOpen() {
    setOpen(true);
    setError(null);

    if (data) return; // ya cargado en una apertura anterior

    setLoading(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/edit-data`);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "No se pudo cargar la solicitud");
      } else {
        setData(json as EditData);
      }
    } catch {
      setError("No se pudo cargar la solicitud");
    } finally {
      setLoading(false);
    }
  }

  function handleDone() {
    setOpen(false);
    // Se descarta lo cacheado para que la proxima apertura traiga lo guardado.
    setData(null);
    onDone?.();
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={
          triggerClassName ??
          "rounded-md border border-neutral-300 bg-white px-2 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
        }
      >
        Editar Viaje
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Editar solicitud {codigo}</DialogTitle>
          </DialogHeader>

          {loading && (
            <p className="py-8 text-center text-sm text-neutral-500">Cargando…</p>
          )}

          {error && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>
          )}

          {data && !loading && !error && (
            <OperatorRepartoForm
              mode="edit"
              initialValues={data.initialValues}
              clients={[{ id: data.initialValues.clientId, nombre: data.clientName }]}
              truckTypes={data.truckTypes}
              onDone={handleDone}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
