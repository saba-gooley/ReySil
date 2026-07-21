import { describe, it, expect } from "vitest";
import { repartoToInitialValues, emptyRepartoValues } from "../reparto-form";
import type { RepartoForEdit } from "@/lib/server/trips/queries";

function makeTrip(overrides: Partial<RepartoForEdit> = {}): RepartoForEdit {
  return {
    id: "11111111-1111-1111-1111-111111111111",
    codigo: "VJ-00042",
    client_id: "22222222-2222-2222-2222-222222222222",
    tipo: "REPARTO",
    estado: "PENDIENTE",
    origen_deposit_id: null,
    origen_descripcion: null,
    destino_descripcion: null,
    fecha_solicitada: null,
    observaciones_cliente: null,
    trip_reparto_fields: null,
    trip_destinations: [],
    ...overrides,
  };
}

describe("repartoToInitialValues", () => {
  it("mapea los campos del viaje y de trip_reparto_fields", () => {
    const values = repartoToInitialValues(
      makeTrip({
        fecha_solicitada: "2026-08-01",
        destino_descripcion: "Rosario centro",
        observaciones_cliente: "Entregar temprano",
        trip_reparto_fields: {
          ndv: "NDV-9",
          pal: 5,
          cat: "A",
          nro_un: "UN1234",
          cantidad_bultos: 20,
          peso_kg: 1500.5,
          toneladas: 1.5,
          metadata: {},
        },
      }),
    );

    expect(values.tripId).toBe("11111111-1111-1111-1111-111111111111");
    expect(values.codigo).toBe("VJ-00042");
    expect(values.fechaSolicitada).toBe("2026-08-01");
    expect(values.destinoDescripcion).toBe("Rosario centro");
    expect(values.observaciones).toBe("Entregar temprano");
    expect(values.ndv).toBe("NDV-9");
    // Los numeros se pasan a string porque alimentan <input>
    expect(values.pal).toBe("5");
    expect(values.pesoKg).toBe("1500.5");
    expect(values.toneladas).toBe("1.5");
  });

  it("saca del metadata los campos que no tienen columna propia", () => {
    const values = repartoToInitialValues(
      makeTrip({
        trip_reparto_fields: {
          ndv: null,
          pal: null,
          cat: null,
          nro_un: null,
          cantidad_bultos: null,
          peso_kg: null,
          toneladas: null,
          metadata: {
            fecha_entrega: "2026-08-05",
            codigo_postal: "2000",
            zona_tarifa: "Z3",
            horario: "8:00 - 16:00",
            tipo_camion: "Balancin",
            peon: "SI",
          },
        },
      }),
    );

    expect(values.fechaEntrega).toBe("2026-08-05");
    expect(values.codigoPostal).toBe("2000");
    expect(values.zonaTarifa).toBe("Z3");
    expect(values.horario).toBe("8:00 - 16:00");
    expect(values.tipoCamion).toBe("Balancin");
    expect(values.peon).toBe("SI");
  });

  it("convierte los null en string vacio, nunca en 'null'", () => {
    const values = repartoToInitialValues(makeTrip());

    expect(values.ndv).toBe("");
    expect(values.pal).toBe("");
    expect(values.destinoDescripcion).toBe("");
    expect(values.fechaEntrega).toBe("");
    expect(values.observaciones).toBe("");
  });

  it("no confunde un cero con un valor vacio", () => {
    const values = repartoToInitialValues(
      makeTrip({
        trip_reparto_fields: {
          ndv: null,
          pal: 0,
          cat: null,
          nro_un: null,
          cantidad_bultos: 0,
          peso_kg: 0,
          toneladas: null,
          metadata: {},
        },
      }),
    );

    expect(values.pal).toBe("0");
    expect(values.cantidadBultos).toBe("0");
    expect(values.pesoKg).toBe("0");
  });

  describe("origen", () => {
    it("usa el deposito preestablecido cuando lo hay", () => {
      const values = repartoToInitialValues(
        makeTrip({
          origen_deposit_id: "33333333-3333-3333-3333-333333333333",
          origen_descripcion: "Av. Siempreviva 742",
        }),
      );
      expect(values.origenDepositId).toBe("33333333-3333-3333-3333-333333333333");
    });

    it("arranca en 'otro' cuando el origen es texto libre", () => {
      const values = repartoToInitialValues(
        makeTrip({ origen_deposit_id: null, origen_descripcion: "Direccion suelta" }),
      );
      expect(values.origenDepositId).toBe("otro");
      expect(values.origenDescripcion).toBe("Direccion suelta");
    });

    it("queda vacio cuando no hay origen cargado", () => {
      const values = repartoToInitialValues(makeTrip());
      expect(values.origenDepositId).toBe("");
    });
  });

  describe("destinos", () => {
    it("marca multi-destino cuando existen filas y respeta el orden", () => {
      const values = repartoToInitialValues(
        makeTrip({
          trip_destinations: [
            { id: "d1", destino: "Parada 1", observaciones: "Porton azul", orden: 0 },
            { id: "d2", destino: "Parada 2", observaciones: null, orden: 1 },
          ],
        }),
      );

      expect(values.multiplesDestinos).toBe(true);
      expect(values.destinos.map((d) => d.destino)).toEqual(["Parada 1", "Parada 2"]);
      expect(values.destinos[0].observaciones).toBe("Porton azul");
      expect(values.destinos[1].observaciones).toBe("");
      // Las keys tienen que ser unicas: React las usa para identificar las filas
      expect(new Set(values.destinos.map((d) => d.key)).size).toBe(2);
    });

    it("sin filas es un viaje de destino unico", () => {
      const values = repartoToInitialValues(
        makeTrip({ destino_descripcion: "Unico destino" }),
      );

      expect(values.multiplesDestinos).toBe(false);
      expect(values.destinoDescripcion).toBe("Unico destino");
      // Igual arranca con una fila en blanco por si el usuario activa el modo
      expect(values.destinos).toHaveLength(1);
      expect(values.destinos[0].destino).toBe("");
    });
  });
});

describe("emptyRepartoValues", () => {
  it("devuelve un formulario en blanco listo para el alta", () => {
    const values = emptyRepartoValues();

    expect(values.tripId).toBe("");
    expect(values.clientId).toBe("");
    expect(values.multiplesDestinos).toBe(false);
    expect(values.destinos).toHaveLength(1);
    expect(Object.values(values).every((v) => v !== null && v !== undefined)).toBe(true);
  });
});
