import { Button } from "@/components/ui/button";
import { TruckForm } from "@/components/operador/truck-form";
import { TruckList } from "@/components/operador/truck-list";
import { getAllTrucks } from "@/lib/server/trucks/queries";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CamionesPage() {
  const trucks = await getAllTrucks();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Gestión de Camiones</h1>
          <p className="text-sm text-neutral-500 mt-2">
            Administra el registro de camiones y su disponibilidad diaria
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <CamionesClient initialTrucks={trucks} />
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Truck } from "@/lib/server/trucks/queries";

interface CamionesClientProps {
  initialTrucks: Truck[];
}

function CamionesClient({ initialTrucks }: CamionesClientProps) {
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
    // Revalidation is handled by revalidatePath in the server action
    // We could refresh here if needed, but the page will revalidate
    window.location.reload();
  };

  return (
    <>
      <div className="flex items-center justify-end mb-4">
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

      <TruckList
        trucks={trucks}
        onEdit={handleEdit}
        onRefresh={() => window.location.reload()}
      />

      <TruckForm
        truck={selectedTruck}
        open={formOpen}
        onOpenChange={handleFormClose}
        onSuccess={handleFormSuccess}
      />
    </>
  );
}
