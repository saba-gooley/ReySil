"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ClientRow } from "@/lib/server/clients/queries";
import { toggleClientAction } from "@/lib/server/clients/actions";
import { useState } from "react";

export function ClientTable({ clients }: { clients: ClientRow[] }) {
  const [filter, setFilter] = useState("");
  const router = useRouter();

  const filtered = clients.filter((c) => {
    const q = filter.toLowerCase();
    return (
      c.codigo.toLowerCase().includes(q) ||
      c.nombre.toLowerCase().includes(q) ||
      c.client_emails.some((e) => e.email.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <input
          type="text"
          placeholder="Buscar por codigo, nombre o email..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full max-w-sm rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-reysil-red focus:outline-none focus:ring-1 focus:ring-reysil-red"
        />
        <Link
          href="/operador/clientes/nuevo"
          className="rounded-md bg-reysil-red px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-reysil-red-dark"
        >
          Nuevo cliente
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50">
            <tr>
              <th className="px-4 py-3 font-medium text-neutral-600">Codigo</th>
              <th className="px-4 py-3 font-medium text-neutral-600">Nombre</th>
              <th className="px-4 py-3 font-medium text-neutral-600">Email principal</th>
              <th className="px-4 py-3 font-medium text-neutral-600">CUIT</th>
              <th className="px-4 py-3 font-medium text-neutral-600">Estado</th>
              <th className="px-4 py-3 font-medium text-neutral-600">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-400">
                  {filter
                    ? "No se encontraron clientes con ese criterio"
                    : "No hay clientes registrados"}
                </td>
              </tr>
            ) : (
              filtered.map((client) => {
                const primaryEmail = client.client_emails.find(
                  (e) => e.es_principal,
                );
                return (
                  <tr key={client.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 font-mono text-xs">
                      {client.codigo}
                    </td>
                    <td className="px-4 py-3 font-medium">{client.nombre}</td>
                    <td className="px-4 py-3 text-neutral-600">
                      {primaryEmail?.email ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {client.cuit ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          client.activo
                            ? "bg-green-100 text-green-700"
                            : "bg-neutral-100 text-neutral-500"
                        }`}
                      >
                        {client.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link
                          href={`/operador/clientes/${client.id}`}
                          className="text-sm text-reysil-red hover:underline"
                        >
                          Editar
                        </Link>
                        <ToggleButton client={client} />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ToggleButton({ client }: { client: ClientRow }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleToggle() {
    const confirmed = window.confirm(
      client.activo
        ? `¿Dar de baja a "${client.nombre}"? Los usuarios del cliente no podran acceder.`
        : `¿Reactivar a "${client.nombre}"?`,
    );
    if (!confirmed) return;

    setLoading(true);
    const result = await toggleClientAction(client.id, !client.activo);
    setLoading(false);

    if (result.error) {
      alert(result.error);
    } else {
      router.refresh();
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="text-sm text-neutral-500 hover:underline disabled:opacity-50"
    >
      {loading ? "..." : client.activo ? "Dar de baja" : "Reactivar"}
    </button>
  );
}
