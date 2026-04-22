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

type TruckWithStatus = {
  id: string;
  marca: string;
  modelo: string;
  patente: string;
  is_active: boolean;
  created_at: string;
  estado: "LIBRE" | "PREASIGNADO" | "ASIGNADO";
};

interface TruckSelectListProps {
  value: string; // patente
  onValueChange: (patente: string) => void;
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

export function TruckSelectList({
  value,
  onValueChange,
  fecha,
  disabled = false,
}: TruckSelectListProps) {
  const [trucks, setTrucks] = useState<TruckWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadTrucks = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/trucks/status?fecha=${fecha}`);
        if (!res.ok) throw new Error("Failed to load trucks");
        const data = await res.json();
        setTrucks(data);
      } catch (error) {
        console.error("Error loading trucks:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTrucks();
  }, [fecha]);

  const filteredTrucks = trucks.filter((truck) =>
    truck.patente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      truck.marca.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedTruck = trucks.find((t) => t.patente === value);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Select value={value} onValueChange={onValueChange} disabled={disabled || loading}>
          <SelectTrigger className="w-full">
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando camiones...
              </div>
            ) : selectedTruck ? (
              <div className="flex items-center justify-between gap-2 w-full">
                <span className="font-mono font-semibold">{selectedTruck.patente}</span>
                <Badge className={statusConfig[selectedTruck.estado].className}>
                  {statusConfig[selectedTruck.estado].label}
                </Badge>
              </div>
            ) : (
              <SelectValue placeholder="Selecciona una patente" />
            )}
          </SelectTrigger>
          <SelectContentInline>
            <div className="p-2">
              <Input
                placeholder="Buscar por patente o marca..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 mb-2"
              />
            </div>
            {filteredTrucks.length === 0 ? (
              <div className="px-2 py-6 text-center text-sm text-gray-500">
                No se encontraron camiones
              </div>
            ) : (
              filteredTrucks.map((truck) => (
                <SelectItem key={truck.patente} value={truck.patente}>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold">
                      {truck.patente}
                    </span>
                    <Badge
                      variant="outline"
                      className={statusConfig[truck.estado].className}
                    >
                      {statusConfig[truck.estado].label}
                    </Badge>
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContentInline>
        </Select>
      </div>

      {selectedTruck && (
        <div className="text-xs text-gray-500">
          Estado:{" "}
          <span className="font-semibold">
            {statusConfig[selectedTruck.estado].label}
          </span>
        </div>
      )}
    </div>
  );
}
