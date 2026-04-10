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
  origen_descripcion: string;
  destino_descripcion: string;
  codigo_postal: string;
  zona_tarifa: string;
  horario: string;
  tipo_camion: string;
  ndv: string;
  pal: string;
  cat: string;
  nro_un: string;
  cantidad_bultos: string;
  peso_kg: string;
  toneladas: string;
  peon: string;
  observaciones_cliente: string;
};

function emptyRow(key: number): GridRow {
  return {
    key,
    fecha_solicitada: "",
    fecha_entrega: "",
    origen_deposit_id: "",
    origen_descripcion: "",
    destino_descripcion: "",
    codigo_postal: "",
    zona_tarifa: "",
    horario: "",
    tipo_camion: "",
    ndv: "",
    pal: "",
    cat: "",
    nro_un: "",
    cantidad_bultos: "",
    peso_kg: "",
    toneladas: "",
    peon: "",
    observaciones_cliente: "",
  };
}

const initialState: TripActionState = {};

const TIPO_CAMION_OPTIONS = ["CHASIS", "SEMI", "710", "PICK UP", "Otro"];

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
      origen_deposit_id: r.origen_deposit_id === "otro" || !r.origen_deposit_id ? null : r.origen_deposit_id,
      origen_descripcion: r.origen_deposit_id === "otro" ? r.origen_descripcion : "",
      destino_descripcion: r.destino_descripcion,
      observaciones_cliente: r.observaciones_cliente,
      codigo_postal: r.codigo_postal,
      zona_tarifa: r.zona_tarifa,
      horario: r.horario,
      tipo_camion: r.tipo_camion,
      ndv: r.ndv,
      pal: r.pal ? Number(r.pal) : null,
      cat: r.cat,
      nro_un: r.nro_un,
      cantidad_bultos: r.cantidad_bultos ? Number(r.cantidad_bultos) : null,
      peso_kg: r.peso_kg ? Number(r.peso_kg) : null,
      toneladas: r.toneladas ? Number(r.toneladas) : null,
      peon: r.peon || "",
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
        <table className="w-full text-left text-xs" style={{ minWidth: "1400px" }}>
          <thead className="bg-neutral-50">
            <tr>
              <th className={cellClass}>#</th>
              <th className={cellClass}>Fecha carga *</th>
              <th className={cellClass}>Fecha entrega</th>
              <th className={cellClass}>Deposito</th>
              <th className={cellClass}>Destino</th>
              <th className={cellClass}>C.P.</th>
              <th className={cellClass}>Zona tarifa</th>
              <th className={cellClass}>Horario</th>
              <th className={cellClass}>Tipo camion</th>
              <th className={cellClass}>NDV</th>
              <th className={cellClass}>PAL</th>
              <th className={cellClass}>CAT</th>
              <th className={cellClass}>Nro UN</th>
              <th className={cellClass}>Bultos</th>
              <th className={cellClass}>KG netos</th>
              <th className={cellClass}>Toneladas</th>
              <th className={cellClass}>Peon</th>
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
                  <div className="space-y-1">
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
                      <option value="otro">Otro</option>
                    </select>
                    {row.origen_deposit_id === "otro" && (
                      <input
                        type="text"
                        value={row.origen_descripcion}
                        onChange={(e) =>
                          updateRow(row.key, "origen_descripcion", e.target.value)
                        }
                        placeholder="Direccion"
                        className={inputClass}
                      />
                    )}
                  </div>
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
                    value={row.codigo_postal}
                    onChange={(e) =>
                      updateRow(row.key, "codigo_postal", e.target.value)
                    }
                    className={`${inputClass} w-16`}
                  />
                </td>
                <td className={cellClass}>
                  <input
                    type="text"
                    value={row.zona_tarifa}
                    onChange={(e) =>
                      updateRow(row.key, "zona_tarifa", e.target.value)
                    }
                    className={`${inputClass} w-20`}
                  />
                </td>
                <td className={cellClass}>
                  <input
                    type="text"
                    value={row.horario}
                    onChange={(e) =>
                      updateRow(row.key, "horario", e.target.value)
                    }
                    placeholder="Ej: 8-16"
                    className={`${inputClass} w-20`}
                  />
                </td>
                <td className={cellClass}>
                  <select
                    value={row.tipo_camion}
                    onChange={(e) =>
                      updateRow(row.key, "tipo_camion", e.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="">—</option>
                    {TIPO_CAMION_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
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
                    type="text"
                    value={row.nro_un}
                    onChange={(e) =>
                      updateRow(row.key, "nro_un", e.target.value)
                    }
                    className={`${inputClass} w-16`}
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
                    value={row.toneladas}
                    onChange={(e) =>
                      updateRow(row.key, "toneladas", e.target.value)
                    }
                    min="0"
                    step="0.01"
                    className={`${inputClass} w-20`}
                  />
                </td>
                <td className={cellClass}>
                  <input
                    type="text"
                    value={row.peon}
                    onChange={(e) =>
                      updateRow(row.key, "peon", e.target.value)
                    }
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
