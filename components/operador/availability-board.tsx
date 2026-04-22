"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

type TruckWithStatus = {
  id: string;
  marca: string;
  modelo: string;
  patente: string;
  is_active: boolean;
  created_at: string;
  estado: "LIBRE" | "PREASIGNADO" | "ASIGNADO";
};

type DriverWithStatus = {
  id: string;
  codigo: string;
  dni: string;
  nombre: string;
  apellido: string;
  telefono: string | null;
  activo: boolean;
  created_at: string;
  estado: "LIBRE" | "PREASIGNADO" | "ASIGNADO";
};

interface AvailabilityBoardProps {}

const statusConfig = {
  LIBRE: {
    label: "Libre",
    bgColor: "bg-green-100",
    textColor: "text-green-800",
    borderColor: "border-green-200",
  },
  PREASIGNADO: {
    label: "Preasignado",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-800",
    borderColor: "border-yellow-200",
  },
  ASIGNADO: {
    label: "Asignado",
    bgColor: "bg-red-100",
    textColor: "text-red-800",
    borderColor: "border-red-200",
  },
} as const;

export function AvailabilityBoard({}: AvailabilityBoardProps) {
  const today = new Date().toISOString().split("T")[0];
  const [fecha, setFecha] = useState(today);
  const [trucks, setTrucks] = useState<TruckWithStatus[]>([]);
  const [drivers, setDrivers] = useState<DriverWithStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [truckRes, driverRes] = await Promise.all([
          fetch(`/api/trucks/status?fecha=${fecha}`),
          fetch(`/api/drivers/status?fecha=${fecha}`),
        ]);

        if (!truckRes.ok || !driverRes.ok) throw new Error("Failed to load data");

        const truckData = await truckRes.json();
        const driverData = await driverRes.json();

        setTrucks(truckData);
        setDrivers(driverData);
      } catch (error) {
        console.error("Error loading availability data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [fecha]);

  const handlePreviousDay = () => {
    const currentDate = new Date(fecha);
    currentDate.setDate(currentDate.getDate() - 1);
    setFecha(currentDate.toISOString().split("T")[0]);
  };

  const handleNextDay = () => {
    const currentDate = new Date(fecha);
    currentDate.setDate(currentDate.getDate() + 1);
    setFecha(currentDate.toISOString().split("T")[0]);
  };

  const handleToday = () => {
    setFecha(today);
  };

  const formatFecha = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-AR", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const StatusBadge = ({ estado }: { estado: TruckWithStatus["estado"] }) => {
    const config = statusConfig[estado];
    return (
      <div
        className={`text-xs font-semibold px-2 py-1 rounded border ${config.borderColor} ${config.bgColor} ${config.textColor}`}
      >
        {config.label}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            Tablero de Disponibilidad
          </h1>
          <p className="text-sm text-neutral-500 mt-2">
            Visualiza el estado de camiones y choferes por día
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white rounded-lg border border-neutral-200 p-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreviousDay}
          className="rounded-md"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex-1 flex gap-2">
          <Input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="max-w-xs"
          />
          <Button variant="outline" size="sm" onClick={handleToday}>
            Hoy
          </Button>
        </div>

        <div className="text-lg font-semibold text-neutral-900">
          {formatFecha(fecha)}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleNextDay}
          className="rounded-md"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
            <p className="text-sm text-neutral-500">Cargando datos...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trucks Section */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-neutral-900 mb-4">
              Camiones ({trucks.length})
            </h2>

            {trucks.length === 0 ? (
              <div className="text-sm text-neutral-500 text-center py-8">
                No hay camiones registrados
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {trucks.map((truck) => (
                  <div
                    key={truck.id}
                    className={`flex items-center justify-between p-3 rounded-lg border-l-4 ${
                      statusConfig[truck.estado].borderColor
                    } ${statusConfig[truck.estado].bgColor}`}
                  >
                    <div className="flex-1">
                      <div className="font-mono font-bold text-sm">
                        {truck.patente}
                      </div>
                      <div className="text-xs text-neutral-600">
                        {truck.marca} {truck.modelo}
                      </div>
                    </div>
                    <StatusBadge estado={truck.estado} />
                  </div>
                ))}
              </div>
            )}

            {/* Legend */}
            <div className="mt-4 pt-4 border-t border-neutral-200">
              <p className="text-xs font-semibold text-neutral-600 mb-2">
                Estado:
              </p>
              <div className="flex flex-col gap-1">
                {(Object.keys(statusConfig) as Array<keyof typeof statusConfig>).map(
                  (key) => {
                    const config = statusConfig[key];
                    return (
                      <div key={key} className="flex items-center gap-2 text-xs">
                        <div
                          className={`w-3 h-3 rounded ${config.bgColor} border ${config.borderColor}`}
                        />
                        <span>{config.label}</span>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </Card>

          {/* Drivers Section */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-neutral-900 mb-4">
              Choferes ({drivers.length})
            </h2>

            {drivers.length === 0 ? (
              <div className="text-sm text-neutral-500 text-center py-8">
                No hay choferes registrados
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {drivers.map((driver) => (
                  <div
                    key={driver.id}
                    className={`flex items-center justify-between p-3 rounded-lg border-l-4 ${
                      statusConfig[driver.estado].borderColor
                    } ${statusConfig[driver.estado].bgColor}`}
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-sm">
                        {driver.apellido}, {driver.nombre}
                      </div>
                      <div className="text-xs text-neutral-600">
                        {driver.codigo}
                      </div>
                    </div>
                    <StatusBadge estado={driver.estado} />
                  </div>
                ))}
              </div>
            )}

            {/* Legend */}
            <div className="mt-4 pt-4 border-t border-neutral-200">
              <p className="text-xs font-semibold text-neutral-600 mb-2">
                Estado:
              </p>
              <div className="flex flex-col gap-1">
                {(Object.keys(statusConfig) as Array<keyof typeof statusConfig>).map(
                  (key) => {
                    const config = statusConfig[key];
                    return (
                      <div key={key} className="flex items-center gap-2 text-xs">
                        <div
                          className={`w-3 h-3 rounded ${config.bgColor} border ${config.borderColor}`}
                        />
                        <span>{config.label}</span>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Statistics Summary */}
      <Card className="p-6 bg-neutral-50">
        <h3 className="text-lg font-bold text-neutral-900 mb-4">Resumen</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {trucks.filter((t) => t.estado === "LIBRE").length}
            </div>
            <p className="text-xs text-neutral-600 mt-1">Camiones Libres</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {trucks.filter((t) => t.estado === "PREASIGNADO").length}
            </div>
            <p className="text-xs text-neutral-600 mt-1">Camiones Preasignados</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {trucks.filter((t) => t.estado === "ASIGNADO").length}
            </div>
            <p className="text-xs text-neutral-600 mt-1">Camiones Asignados</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-neutral-600">
              {trucks.length}
            </div>
            <p className="text-xs text-neutral-600 mt-1">Camiones Total</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-neutral-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {drivers.filter((d) => d.estado === "LIBRE").length}
            </div>
            <p className="text-xs text-neutral-600 mt-1">Choferes Libres</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {drivers.filter((d) => d.estado === "PREASIGNADO").length}
            </div>
            <p className="text-xs text-neutral-600 mt-1">Choferes Preasignados</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {drivers.filter((d) => d.estado === "ASIGNADO").length}
            </div>
            <p className="text-xs text-neutral-600 mt-1">Choferes Asignados</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-neutral-600">
              {drivers.length}
            </div>
            <p className="text-xs text-neutral-600 mt-1">Choferes Total</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
