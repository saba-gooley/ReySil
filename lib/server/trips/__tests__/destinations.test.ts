import { describe, it, expect } from "vitest";
import {
  replaceTripDestinations,
  resolveDestinoDescripcion,
  type DestinoInput,
} from "../destinations";

type ExistingRow = {
  id: string;
  hora_llegada: string | null;
  hora_salida: string | null;
};

/**
 * Fake minimo del cliente de Supabase: registra las operaciones para poder
 * afirmar sobre ellas y devuelve las filas que le pasemos.
 */
function makeFakeSupabase(existing: ExistingRow[], opts: { readError?: string; deleteError?: string } = {}) {
  const calls = {
    deleted: false,
    inserted: null as Record<string, unknown>[] | null,
  };

  const client = {
    from() {
      return {
        select() {
          return {
            eq: async () => ({
              data: opts.readError ? null : existing,
              error: opts.readError ? { message: opts.readError } : null,
            }),
          };
        },
        delete() {
          return {
            eq: async () => {
              calls.deleted = true;
              return { error: opts.deleteError ? { message: opts.deleteError } : null };
            },
          };
        },
        insert: async (rows: Record<string, unknown>[]) => {
          calls.inserted = rows;
          return { error: null };
        },
      };
    },
  };

  // El fake solo implementa los metodos que usa replaceTripDestinations.
  return { client: client as unknown as Parameters<typeof replaceTripDestinations>[0], calls };
}

const TRIP_ID = "11111111-1111-1111-1111-111111111111";

describe("replaceTripDestinations", () => {
  it("inserta los destinos en el orden recibido", async () => {
    const { client, calls } = makeFakeSupabase([]);
    const destinos: DestinoInput[] = [
      { destino: "Av. Corrientes 1234", observaciones: "Porton azul" },
      { destino: "Ruta 2 km 50" },
      { destino: "Deposito Sur" },
    ];

    const err = await replaceTripDestinations(client, TRIP_ID, destinos);

    expect(err).toBeNull();
    expect(calls.inserted).toHaveLength(3);
    expect(calls.inserted!.map((r) => r.orden)).toEqual([0, 1, 2]);
    expect(calls.inserted!.map((r) => r.destino)).toEqual([
      "Av. Corrientes 1234",
      "Ruta 2 km 50",
      "Deposito Sur",
    ]);
    expect(calls.inserted![0].observaciones).toBe("Porton azul");
    // Sin observaciones se guarda null, no string vacio
    expect(calls.inserted![1].observaciones).toBeNull();
  });

  it("convierte un viaje de destino unico en multi-destino", async () => {
    // Un viaje de destino unico no tiene filas: agregar destinos las crea.
    const { client, calls } = makeFakeSupabase([]);

    const err = await replaceTripDestinations(client, TRIP_ID, [
      { destino: "Destino A" },
      { destino: "Destino B" },
    ]);

    expect(err).toBeNull();
    expect(calls.deleted).toBe(false); // no habia nada que borrar
    expect(calls.inserted).toHaveLength(2);
  });

  it("vuelve de multi-destino a destino unico borrando las filas", async () => {
    const { client, calls } = makeFakeSupabase([
      { id: "d1", hora_llegada: null, hora_salida: null },
      { id: "d2", hora_llegada: null, hora_salida: null },
    ]);

    const err = await replaceTripDestinations(client, TRIP_ID, []);

    expect(err).toBeNull();
    expect(calls.deleted).toBe(true);
    // Cero destinos = viaje de destino unico. No se insertan filas.
    expect(calls.inserted).toBeNull();
  });

  it("reemplaza los destinos existentes por los nuevos", async () => {
    const { client, calls } = makeFakeSupabase([
      { id: "d1", hora_llegada: null, hora_salida: null },
    ]);

    const err = await replaceTripDestinations(client, TRIP_ID, [
      { destino: "Nuevo 1" },
      { destino: "Nuevo 2" },
    ]);

    expect(err).toBeNull();
    expect(calls.deleted).toBe(true);
    expect(calls.inserted!.map((r) => r.destino)).toEqual(["Nuevo 1", "Nuevo 2"]);
  });

  // Asercion de invariante: hoy un viaje editable nunca tiene horas cargadas,
  // porque registrar la llegada lo pasa a EN_CURSO. Si eso cambiara, queremos
  // fallar ruidosamente en vez de borrar el registro del chofer.
  it("se niega a tocar destinos con hora de llegada registrada", async () => {
    const { client, calls } = makeFakeSupabase([
      { id: "d1", hora_llegada: "2026-07-21T10:00:00Z", hora_salida: null },
    ]);

    const err = await replaceTripDestinations(client, TRIP_ID, [{ destino: "Otro" }]);

    expect(err).toMatch(/horas ya registradas/i);
    expect(calls.deleted).toBe(false);
    expect(calls.inserted).toBeNull();
  });

  it("se niega a tocar destinos con hora de salida registrada", async () => {
    const { client, calls } = makeFakeSupabase([
      { id: "d1", hora_llegada: null, hora_salida: "2026-07-21T12:00:00Z" },
    ]);

    const err = await replaceTripDestinations(client, TRIP_ID, [{ destino: "Otro" }]);

    expect(err).toMatch(/horas ya registradas/i);
    expect(calls.deleted).toBe(false);
  });

  it("propaga el error de lectura sin borrar nada", async () => {
    const { client, calls } = makeFakeSupabase([], { readError: "conexion caida" });

    const err = await replaceTripDestinations(client, TRIP_ID, [{ destino: "X" }]);

    expect(err).toMatch(/conexion caida/);
    expect(calls.deleted).toBe(false);
    expect(calls.inserted).toBeNull();
  });

  it("no inserta si fallo el borrado", async () => {
    const { client, calls } = makeFakeSupabase(
      [{ id: "d1", hora_llegada: null, hora_salida: null }],
      { deleteError: "violacion de FK" },
    );

    const err = await replaceTripDestinations(client, TRIP_ID, [{ destino: "X" }]);

    expect(err).toMatch(/violacion de FK/);
    expect(calls.inserted).toBeNull();
  });
});

describe("resolveDestinoDescripcion", () => {
  it("replica el primer destino cuando hay multiples", () => {
    expect(
      resolveDestinoDescripcion(true, [{ destino: "Primero" }, { destino: "Segundo" }], ""),
    ).toBe("Primero");
  });

  it("usa el destino unico cuando no hay multiples", () => {
    expect(resolveDestinoDescripcion(false, [], "Destino unico")).toBe("Destino unico");
  });

  it("ignora los destinos multiples si el flag esta apagado", () => {
    expect(resolveDestinoDescripcion(false, [{ destino: "Ignorado" }], "El bueno")).toBe(
      "El bueno",
    );
  });

  it("devuelve null si no hay ningun destino", () => {
    expect(resolveDestinoDescripcion(false, [], "")).toBeNull();
    expect(resolveDestinoDescripcion(true, [], "")).toBeNull();
  });
});
