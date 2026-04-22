"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContentInline,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

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

interface DriverSelectListProps {
  value: string;
  onValueChange: (value: string) => void;
  fecha: string;
  disabled?: boolean;
}

const statusConfig = {
  LIBRE: { label: "Libre", className: "bg-green-100 text-green-800" },
  PREASIGNADO: {
    label: "Preasignado",
    className: "bg-yellow-100 text-yellow-800",
  },
  ASIGNADO: { label: "Asignado", className: "bg-red-100 text-red-800" },
} as const;

export function DriverSelectList({
  value,
  onValueChange,
  fecha,
  disabled = false,
}: DriverSelectListProps) {
  const [drivers, setDrivers] = useState<DriverWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadDrivers = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/drivers/status?fecha=${fecha}`);
        if (!res.ok) throw new Error("Failed to load drivers");
        const data = await res.json();
        setDrivers(data);
      } catch (error) {
        console.error("Error loading drivers:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDrivers();
  }, [fecha]);

  const filteredDrivers = drivers.filter((driver) =>
    driver.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedDriver = drivers.find((d) => d.id === value);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Select
          value={value}
          onValueChange={onValueChange}
          disabled={disabled || loading}
        >
          <SelectTrigger className="w-full">
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando choferes...
              </div>
            ) : selectedDriver ? (
              <div className="flex items-center justify-between gap-2 w-full">
                <span className="text-sm">
                  {selectedDriver.apellido}, {selectedDriver.nombre}
                </span>
                <Badge className={statusConfig[selectedDriver.estado].className}>
                  {statusConfig[selectedDriver.estado].label}
                </Badge>
              </div>
            ) : (
              <SelectValue placeholder="Selecciona un chofer" />
            )}
          </SelectTrigger>
          <SelectContentInline>
            <div className="p-2">
              <Input
                placeholder="Buscar por apellido, nombre o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 mb-2"
              />
            </div>
            {filteredDrivers.length === 0 ? (
              <div className="px-2 py-6 text-center text-sm text-gray-500">
                No se encontraron choferes
              </div>
            ) : (
              filteredDrivers.map((driver) => (
                <SelectItem key={driver.id} value={driver.id}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {driver.apellido}, {driver.nombre}
                    </span>
                    <Badge
                      variant="outline"
                      className={statusConfig[driver.estado].className}
                    >
                      {statusConfig[driver.estado].label}
                    </Badge>
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContentInline>
        </Select>
      </div>

      {selectedDriver && (
        <div className="text-xs text-gray-500">
          Estado:{" "}
          <span className="font-semibold">
            {statusConfig[selectedDriver.estado].label}
          </span>
        </div>
      )}
    </div>
  );
}
