"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { createTruckAction, updateTruckAction } from "@/lib/server/trucks/actions";
import { TruckSchema } from "@/lib/validators/truck";
import { Truck } from "@/lib/server/trucks/queries";
import { ZodError } from "zod";

interface TruckFormProps {
  truck?: Truck;
  onSuccess?: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TruckForm({
  truck,
  onSuccess,
  open,
  onOpenChange,
}: TruckFormProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const data = {
      marca: formData.get("marca"),
      modelo: formData.get("modelo"),
      patente: formData.get("patente"),
    };

    try {
      const schema = truck ? TruckSchema.update : TruckSchema.create;
      const parsed = schema.parse(data);

      if (truck) {
        await updateTruckAction(truck.id, parsed);
      } else {
        await createTruckAction(parsed);
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path.join(".");
          fieldErrors[path] = err.message;
        });
        setErrors(fieldErrors);
      } else if (error instanceof Error) {
        setErrors({ _global: error.message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {truck ? "Editar Camión" : "Crear Nuevo Camión"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors._global && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {errors._global}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="marca">Marca</Label>
            <Input
              id="marca"
              name="marca"
              placeholder="ej. Scania"
              defaultValue={truck?.marca || ""}
              disabled={loading}
              className={errors.marca ? "border-red-500" : ""}
            />
            {errors.marca && (
              <p className="text-sm text-red-500">{errors.marca}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="modelo">Modelo</Label>
            <Input
              id="modelo"
              name="modelo"
              placeholder="ej. R440"
              defaultValue={truck?.modelo || ""}
              disabled={loading}
              className={errors.modelo ? "border-red-500" : ""}
            />
            {errors.modelo && (
              <p className="text-sm text-red-500">{errors.modelo}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="patente">Patente</Label>
            <Input
              id="patente"
              name="patente"
              placeholder="ej. AAA123BB"
              defaultValue={truck?.patente || ""}
              disabled={loading}
              className={errors.patente ? "border-red-500" : ""}
            />
            {errors.patente && (
              <p className="text-sm text-red-500">{errors.patente}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : truck ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
