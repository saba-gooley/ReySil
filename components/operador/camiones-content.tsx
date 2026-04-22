"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TruckForm } from "./truck-form";
import { TruckList } from "./truck-list";
import { Truck } from "@/lib/server/trucks/queries";
import { Plus } from "lucide-react";

interface CamionesContentProps {
  initialTrucks: Truck[];
}

export function CamionesContent({ initialTrucks }: CamionesContentProps) {
  const [trucks, setTrucks] = useState(initialTrucks);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState<Truck | undefined>();

  const handleEdit = (truck: Truck) => {
    setSelectedTruck(truck);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setSelectedTruck(undefined);
  };

  const handleFormSuccess = () => {
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Gestión de Camiones</h1>
          <p className="text-sm text-neutral-500 mt-2">
            Administra el registro de camiones y su disponibilidad diaria
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedTruck(undefined);
            setFormOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Nuevo Camión
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <TruckList
          trucks={trucks}
          onEdit={handleEdit}
          onRefresh={() => window.location.reload()}
        />
      </div>

      <TruckForm
        truck={selectedTruck}
        open={formOpen}
        onOpenChange={handleFormClose}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}
