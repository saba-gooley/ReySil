"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  startInspectionAction,
  updateInspectionItemAction,
  completeInspectionAction,
  INSPECTION_SECTIONS,
} from "@/lib/server/chofer/actions";

type InspectionItem = {
  id: string;
  seccion: string;
  item_codigo: string;
  item_descripcion: string;
  estado: string;
  observaciones: string | null;
};

type Inspection = {
  id: string;
  patente: string;
  fecha: string;
  status: string;
  pdf_url: string | null;
  observaciones_generales: string | null;
  completado_at: string | null;
  inspection_items: InspectionItem[];
} | null;

const SECTION_LABELS: Record<string, string> = {
  DOCUMENTACION: "Documentacion",
  ESTADO_VEHICULO: "Estado del Vehiculo",
  SEG_PERSONAL: "Seguridad del Personal",
  SEG_VEHICULO: "Seguridad del Vehiculo",
  KIT_DERRAMES: "Kit Derrames y Otros",
};

const SECTION_ORDER = Object.keys(INSPECTION_SECTIONS);

export function InspectionView({
  inspection,
}: {
  inspection: Inspection;
}) {
  const router = useRouter();
  const [patente, setPatente] = useState("");
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [completing, setCompleting] = useState(false);

  async function handleStart() {
    if (!patente.trim()) {
      setError("Ingresa la patente");
      return;
    }
    setStarting(true);
    setError(null);
    const result = await startInspectionAction(patente.toUpperCase());
    setStarting(false);
    if ("error" in result) {
      setError(result.error);
    } else {
      router.refresh();
    }
  }

  async function handleComplete() {
    if (!inspection) return;
    setCompleting(true);
    const result = await completeInspectionAction(inspection.id);
    setCompleting(false);
    if (result.error) {
      setError(result.error);
    } else {
      router.refresh();
    }
  }

  // No inspection yet — show start form
  if (!inspection) {
    return (
      <div className="space-y-4">
        {error && (
          <p className="text-xs text-red-600">{error}</p>
        )}
        <p className="text-sm text-neutral-500">
          Ingresa la patente del camion para iniciar la inspeccion de hoy.
        </p>
        <input
          type="text"
          value={patente}
          onChange={(e) => setPatente(e.target.value.toUpperCase())}
          placeholder="Patente (ej: ABC123)"
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm font-mono focus:border-reysil-red focus:outline-none focus:ring-1 focus:ring-reysil-red"
        />
        <button
          type="button"
          onClick={handleStart}
          disabled={starting}
          className="w-full rounded-md bg-reysil-red px-4 py-3 text-sm font-medium text-white hover:bg-reysil-red-dark disabled:opacity-50"
        >
          {starting ? "Creando..." : "Iniciar Inspeccion"}
        </button>
      </div>
    );
  }

  // Inspection completed
  if (inspection.status === "COMPLETADA") {
    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-green-50 border border-green-200 p-4">
          <p className="text-sm font-medium text-green-700">
            Inspeccion completada
          </p>
          <p className="text-xs text-green-600 mt-1">
            Patente: {inspection.patente} — {new Date(inspection.completado_at!).toLocaleString("es-AR")}
          </p>
        </div>
        {inspection.pdf_url && (
          <a
            href={inspection.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-sm text-reysil-red hover:underline"
          >
            Ver PDF de inspeccion
          </a>
        )}
      </div>
    );
  }

  // In progress — show sections
  const items = inspection.inspection_items;
  const sectionKey = SECTION_ORDER[currentSection];
  const sectionItems = items.filter((i) => i.seccion === sectionKey);
  const allDone = items.every((i) => i.estado !== "PENDIENTE");

  return (
    <div className="space-y-4">
      {error && <p className="text-xs text-red-600">{error}</p>}

      <p className="text-xs text-neutral-500">
        Patente: <strong className="font-mono">{inspection.patente}</strong>
      </p>

      {/* Section tabs */}
      <div className="flex gap-1 overflow-x-auto">
        {SECTION_ORDER.map((sec, idx) => {
          const secItems = items.filter((i) => i.seccion === sec);
          const done = secItems.every((i) => i.estado !== "PENDIENTE");
          return (
            <button
              key={sec}
              type="button"
              onClick={() => setCurrentSection(idx)}
              className={`whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium transition ${
                idx === currentSection
                  ? "bg-reysil-red text-white"
                  : done
                    ? "bg-green-100 text-green-700"
                    : "bg-neutral-100 text-neutral-600"
              }`}
            >
              {idx + 1}. {SECTION_LABELS[sec]?.split(" ")[0] ?? sec}
            </button>
          );
        })}
      </div>

      {/* Section items */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-neutral-700">
          {SECTION_LABELS[sectionKey] ?? sectionKey}
        </h3>
        {sectionItems.map((item) => (
          <InspectionItemRow
            key={item.id}
            item={item}
            onUpdate={() => router.refresh()}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
          disabled={currentSection === 0}
          className="rounded-md border px-4 py-2 text-sm disabled:opacity-40"
        >
          Anterior
        </button>
        {currentSection < SECTION_ORDER.length - 1 ? (
          <button
            type="button"
            onClick={() => setCurrentSection(currentSection + 1)}
            className="rounded-md bg-neutral-800 px-4 py-2 text-sm text-white"
          >
            Siguiente
          </button>
        ) : (
          <button
            type="button"
            onClick={handleComplete}
            disabled={!allDone || completing}
            className="rounded-md bg-reysil-red px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {completing ? "Finalizando..." : "Finalizar Inspeccion"}
          </button>
        )}
      </div>
    </div>
  );
}

function InspectionItemRow({
  item,
  onUpdate,
}: {
  item: InspectionItem;
  onUpdate: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleState(estado: "CUMPLE" | "NO_CUMPLE") {
    setLoading(true);
    await updateInspectionItemAction(item.id, estado);
    setLoading(false);
    onUpdate();
  }

  const isCumple = item.estado === "CUMPLE";
  const isNoCumple = item.estado === "NO_CUMPLE";

  return (
    <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-3 py-2">
      <span className="text-sm text-neutral-800">
        {item.item_descripcion}
      </span>
      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => handleState("CUMPLE")}
          disabled={loading || isCumple}
          className={`rounded px-3 py-1 text-xs font-medium transition ${
            isCumple
              ? "bg-green-500 text-white"
              : "bg-neutral-100 text-neutral-500 hover:bg-green-100"
          }`}
        >
          Si
        </button>
        <button
          type="button"
          onClick={() => handleState("NO_CUMPLE")}
          disabled={loading || isNoCumple}
          className={`rounded px-3 py-1 text-xs font-medium transition ${
            isNoCumple
              ? "bg-red-500 text-white"
              : "bg-neutral-100 text-neutral-500 hover:bg-red-100"
          }`}
        >
          No
        </button>
      </div>
    </div>
  );
}
