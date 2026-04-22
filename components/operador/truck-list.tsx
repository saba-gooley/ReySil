"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  deactivateTruckAction,
  reactivateTruckAction,
} from "@/lib/server/trucks/actions";
import { Truck } from "@/lib/server/trucks/queries";
import { Trash2, RotateCcw, Pencil } from "lucide-react";

interface TruckListProps {
  trucks: Truck[];
  onEdit: (truck: Truck) => void;
  onRefresh: () => void;
}

export function TruckList({ trucks, onEdit, onRefresh }: TruckListProps) {
  const [loading, setLoading] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState<Truck | null>(null);

  const handleDeactivate = (truck: Truck) => {
    setSelectedTruck(truck);
    setAlertOpen(true);
  };

  const confirmDeactivate = async () => {
    if (!selectedTruck) return;

    setLoading(true);
    try {
      await deactivateTruckAction(selectedTruck.id);
      onRefresh();
    } catch (error) {
      console.error("Error deactivating truck:", error);
    } finally {
      setLoading(false);
      setAlertOpen(false);
      setSelectedTruck(null);
    }
  };

  const handleReactivate = async (truck: Truck) => {
    setLoading(true);
    try {
      await reactivateTruckAction(truck.id);
      onRefresh();
    } catch (error) {
      console.error("Error reactivating truck:", error);
    } finally {
      setLoading(false);
    }
  };

  const activeTrucks = trucks.filter((t) => t.is_active);
  const inactiveTrucks = trucks.filter((t) => !t.is_active);

  return (
    <div className="space-y-8">
      {/* Active Trucks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Camiones Activos ({activeTrucks.length})
          </h3>
        </div>

        {activeTrucks.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-gray-500">
            No hay camiones activos
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patente</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeTrucks.map((truck) => (
                  <TableRow key={truck.id}>
                    <TableCell className="font-mono font-semibold">
                      {truck.patente}
                    </TableCell>
                    <TableCell>{truck.marca}</TableCell>
                    <TableCell>{truck.modelo}</TableCell>
                    <TableCell>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Activo
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEdit(truck)}
                          disabled={loading}
                        >
                          <Pencil className="h-4 w-4" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => handleDeactivate(truck)}
                          disabled={loading}
                        >
                          Desactivar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Inactive Trucks */}
      {inactiveTrucks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-600">
              Camiones Inactivos ({inactiveTrucks.length})
            </h3>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-gray-50">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead>Patente</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inactiveTrucks.map((truck) => (
                  <TableRow key={truck.id} className="bg-gray-50">
                    <TableCell className="font-mono font-semibold text-gray-500">
                      {truck.patente}
                    </TableCell>
                    <TableCell className="text-gray-500">{truck.marca}</TableCell>
                    <TableCell className="text-gray-500">{truck.modelo}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-gray-200 text-gray-800">
                        Inactivo
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 hover:bg-green-50"
                        onClick={() => handleReactivate(truck)}
                        disabled={loading}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Deactivation Confirmation Dialog */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desactivar Camión</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas desactivar el camión {selectedTruck?.patente}?
              No aparecerá en las asignaciones hasta que sea reactivado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmDeactivate}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            Desactivar
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
