"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AssignTripForm } from "./assign-trip-form";

type Driver = { id: string; codigo: string; nombre: string; apellido: string };

type Mode = "assign" | "reassign" | "preassign" | "update-preassigned";

const DIALOG_TITLES: Record<Mode, string> = {
  assign: "Confirmar Asignación",
  reassign: "Modificar Asignación",
  preassign: "Preasignar Chofer",
  "update-preassigned": "Modificar Preasignación",
};

const TRIGGER_LABELS: Record<Mode, string> = {
  assign: "Confirmar",
  reassign: "Modificar",
  preassign: "Preasignar",
  "update-preassigned": "Modificar",
};

const TRIGGER_CLASSES: Record<Mode, string> = {
  assign: "rounded-md bg-reysil-red px-2 py-1 text-xs font-medium text-white hover:bg-reysil-red-dark",
  reassign: "rounded-md border border-neutral-300 bg-white px-2 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-100",
  preassign: "rounded-md border border-neutral-300 bg-white px-2 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-100",
  "update-preassigned": "rounded-md border border-neutral-300 bg-white px-2 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-100",
};

type Props = {
  tripId: string;
  drivers: Driver[];
  mode: Mode;
  currentDriverId?: string;
  currentPatente?: string;
  currentComentario?: string | null;
  fecha?: string;
  onDone?: () => void;
  triggerLabel?: string;
  triggerClassName?: string;
};

export function AssignTripDialog({
  tripId,
  drivers,
  mode,
  currentDriverId,
  currentPatente,
  currentComentario,
  fecha,
  onDone,
  triggerLabel,
  triggerClassName,
}: Props) {
  const [open, setOpen] = useState(false);

  const handleDone = () => {
    setOpen(false);
    onDone?.();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={triggerClassName ?? TRIGGER_CLASSES[mode]}
      >
        {triggerLabel ?? TRIGGER_LABELS[mode]}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{DIALOG_TITLES[mode]}</DialogTitle>
          </DialogHeader>
          <AssignTripForm
            tripId={tripId}
            drivers={drivers}
            mode={mode}
            currentDriverId={currentDriverId}
            currentPatente={currentPatente}
            currentComentario={currentComentario}
            fecha={fecha}
            onDone={handleDone}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
