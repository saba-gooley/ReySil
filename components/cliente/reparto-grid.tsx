"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  createBulkRepartosAction,
  type TripActionState,
} from "@/lib/server/trips/actions";

type Deposit = { id: string; nombre: string; direccion: string | null; tipo: string };

type GridRow = {
  key: number;
  fecha_solicitada: string;
  fecha_entrega: string;
  origen_deposit_id: string;
  destino_descripcion: string;
  ndv: string;
  pal: string;
  cat: string;
  peso_kg: string;
  cantidad_bultos: string;
  observaciones_cliente: string;
};

function emptyRow(key: number): GridRow {
  return {
    key,
    fecha_solicitada: "",
    fecha_entrega: "",
    origen_deposit_id: "",
    destino_descripcion: "",
    ndv: "",
    pal: "",
    cat: "",
    peso_kg: "",
    cantidad_bultos: "",
    observaciones_cliente: "",
  };
}

const initialState: TripActionState = {};

export function RepartoGrid({ deposits }: { deposits: Deposit[] }) {
  const [state, formAction] = useFormState(createBulkRepartosAction, initialState);
  const router = useRouter();
  const [nextKey, setNextKey] = useState(2);
  const [rows, setRows] = useState<GridRow[]>([emptyRow(1)]);

  useEffect(() => {
    if (state.success) {
      router.push("/cliente/seguimiento");
    }
  }, [state.success, router]);

  function addRow() {
    setRows([...rows, emptyRow(nextKey)]);
    setNextKey(nextKey + 1);
  }

  function removeRow(key: number) {
    if (rows.length <= 1) return;
    setRows(rows.filter((r) => r.key !== key));
  }

  function updateRow(key: number, field: keyof GridRow, value: string) {
    setRows(rows.map((r) => (r.key === key ? { ...r, [field]: value } : r)));
  }

  function handleSubmit(formData: FormData) {
    const payload = rows.map((r) => ({
      fecha_solicitada: r.fecha_solicitada,
      fecha_entrega: r.fecha_entrega,
      origen_deposit_id: r.origen_deposit_id || null,
      destino_descripcion: r.destino_descripcion,
      observaciones_cliente: r.observaciones_cliente,
      ndv: r.ndv,
      pal: r.pal ? Number(r.pal) : null,
      cat: r.cat,
      peso_kg: r.peso_kg ? Number(r.peso_kg) : null,
      cantidad_bultos: r.cantidad_bultos ? Number(r.cantidad_bultos) : null,
      nro_un: "",
      volumen_m3: null,
      origen_descripcion: "",
      codigo_postal: "",
      zona_tarifa: "",
      horario: "",
      tipo_camion: "",
      peon: null,
    }));
    formData.set("payload", JSON.stringify(payload));
    formAction(formData);
  }

  const cellClass =
    "border border-neutral-200 px-1 py-1 text-xs";
  const inputClass =
    "w-full border-0 bg-transparent px-1 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-reysil-red rounded";

  return (
    <form action={handleSubmit} className="space-y-4">
      {state.error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-left text-xs">
          <thead className="bg-neutral-50">
            <tr>
              <th className={cellClass}>#</th>
              <th className={cellClass}>Fecha carga *</th>
              <th className={cellClass}>Fecha entrega</th>
              <th className={cellClass}>Deposito</th>
              <th className={cellClass}>Destino</th>
              <th className={cellClass}>NDV</th>
              <th className={cellClass}>PAL</th>
              <th className={cellClass}>CAT</th>
              <th className={cellClass}>Peso Kg</th>
              <th className={cellClass}>Bultos</th>
              <th className={cellClass}>Comentarios</th>
              <th className={cellClass}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={row.key}>
                <td className={`${cellClass} text-center text-neutral-400`}>
                  {idx + 1}
                </td>
                <td className={cellClass}>
                  <input
                    type="date"
                    value={row.fecha_solicitada}
                    onChange={(e) =>
                      updateRow(row.key, "fecha_solicitada", e.target.value)
                    }
                    required
                    className={inputClass}
                  />
                </td>
                <td className={cellClass}>
                  <input
                    type="date"
                    value={row.fecha_entrega}
                    onChange={(e) =>
                      updateRow(row.key, "fecha_entrega", e.target.value)
                    }
                    min={row.fecha_solicitada || undefined}
                    className={inputClass}
                  />
                </td>
                <td className={cellClass}>
                  <select
                    value={row.origen_deposit_id}
                    onChange={(e) =>
                      updateRow(row.key, "origen_deposit_id", e.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="">—</option>
                    {deposits.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nombre}
                      </option>
                    ))}
                  </select>
                </td>
                <td className={cellClass}>
                  <input
                    type="text"
                    value={row.destino_descripcion}
                    onChange={(e) =>
                      updateRow(row.key, "destino_descripcion", e.target.value)
                    }
                    className={inputClass}
                  />
                </td>
                <td className={cellClass}>
                  <input
                    type="text"
                    value={row.ndv}
                    onChange={(e) =>
                      updateRow(row.key, "ndv", e.target.value)
                    }
                    className={inputClass}
                  />
                </td>
                <td className={cellClass}>
                  <input
                    type="number"
                    value={row.pal}
                    onChange={(e) =>
                      updateRow(row.key, "pal", e.target.value)
                    }
                    min="0"
                    className={`${inputClass} w-16`}
                  />
                </td>
                <td className={cellClass}>
                  <input
                    type="text"
                    value={row.cat}
                    onChange={(e) =>
                      updateRow(row.key, "cat", e.target.value)
                    }
                    className={`${inputClass} w-16`}
                  />
                </td>
                <td className={cellClass}>
                  <input
                    type="number"
                    value={row.peso_kg}
                    onChange={(e) =>
                      updateRow(row.key, "peso_kg", e.target.value)
                    }
                    min="0"
                    step="0.01"
                    className={`${inputClass} w-20`}
                  />
                </td>
                <td className={cellClass}>
                  <input
                    type="number"
                    value={row.cantidad_bultos}
                    onChange={(e) =>
                      updateRow(row.key, "cantidad_bultos", e.target.value)
                    }
                    min="0"
                    className={`${inputClass} w-16`}
                  />
                </td>
                <td className={cellClass}>
                  <input
                    type="text"
                    value={row.observaciones_cliente}
                    onChange={(e) =>
                      updateRow(row.key, "observaciones_cliente", e.target.value)
                    }
                    className={inputClass}
                  />
                </td>
                <td className={cellClass}>
                  {rows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRow(row.key)}
                      className="text-red-500 hover:underline"
                    >
                      x
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={addRow}
          className="text-sm text-reysil-red hover:underline"
        >
          + Agregar fila
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push("/cliente/solicitudes")}
            className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm hover:bg-neutral-100"
          >
            Cancelar
          </button>
          <SubmitButton count={rows.length} />
        </div>
      </div>
    </form>
  );
}

function SubmitButton({ count }: { count: number }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-reysil-red px-6 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-reysil-red-dark disabled:opacity-50"
    >
      {pending
        ? "Enviando..."
        : `Solicitar ${count} ${count === 1 ? "viaje" : "viajes"}`}
    </button>
  );
}
