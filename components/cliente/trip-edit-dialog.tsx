"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RepartoForm } from "./reparto-form";
import type { RepartoInitialValues } from "@/lib/utils/reparto-form";

type Deposit = { id: string; nombre: string; direccion: string | null; tipo: string };

type EditData = {
  initialValues: RepartoInitialValues;
  truckTypes: string[];
  deposits: Deposit[];
};

/**
 * Req. 2.16 — El cliente edita su propia solicitud de Reparto desde el
 * seguimiento, mientras el viaje no haya arrancado.
 *
 * El endpoint valida dueno y estado, asi que si el viaje arranco entre que se
 * pinto la lista y se hace clic, el dialogo muestra el motivo en vez del
 * formulario.
 */
export function ClientTripEditDialog({
  tripId,
  codigo,
  onDone,
}: {
  tripId: string;
  codigo: string;
  onDone?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<EditData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleOpen(e: React.MouseEvent) {
    // La fila entera es clickeable para expandir el detalle: sin esto, abrir
    // el editor tambien la expandiria.
    e.stopPropagation();
    setOpen(true);
    setError(null);

    if (data) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/edit-data`);
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudo cargar la solicitud");
      else setData(json as EditData);
    } catch {
      setError("No se pudo cargar la solicitud");
    } finally {
      setLoading(false);
    }
  }

  function handleDone() {
    setOpen(false);
    setData(null);
    onDone?.();
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="rounded-md border border-neutral-300 bg-white px-2 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
      >
        Editar
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
            <RepartoForm
              mode="edit"
              initialValues={data.initialValues}
              deposits={data.deposits}
              truckTypes={data.truckTypes}
              onDone={handleDone}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
