import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { EDITABLE_STATES, isTripEditable } from "../editable";

/** Todos los estados que existen en el enum trip_status. */
const ALL_STATES = [
  "PENDIENTE",
  "PREASIGNADO",
  "ASIGNADO",
  "EN_CURSO",
  "FINALIZADO",
  "CANCELADO",
];

describe("isTripEditable", () => {
  it("permite editar los viajes que todavia no arrancaron", () => {
    expect(isTripEditable("PENDIENTE")).toBe(true);
    expect(isTripEditable("PREASIGNADO")).toBe(true);
    expect(isTripEditable("ASIGNADO")).toBe(true);
  });

  it("bloquea los viajes en curso y finalizados — el corazon del req 2.16", () => {
    expect(isTripEditable("EN_CURSO")).toBe(false);
    expect(isTripEditable("FINALIZADO")).toBe(false);
  });

  it("bloquea los cancelados", () => {
    expect(isTripEditable("CANCELADO")).toBe(false);
  });

  it("no deja pasar valores vacios ni desconocidos", () => {
    expect(isTripEditable(null)).toBe(false);
    expect(isTripEditable(undefined)).toBe(false);
    expect(isTripEditable("")).toBe(false);
    expect(isTripEditable("pendiente")).toBe(false); // case sensitive
    expect(isTripEditable("CUALQUIER_COSA")).toBe(false);
  });

  it("cubre todos los estados del enum sin dejar ninguno indefinido", () => {
    for (const estado of ALL_STATES) {
      expect(typeof isTripEditable(estado)).toBe("boolean");
    }
  });
});

describe("sincronia entre el gate de TS y el de SQL", () => {
  // El gate vive duplicado a proposito: en la Server Action y en las policies
  // RLS. Si alguien cambia uno y se olvida del otro, la base y la app quedan
  // en desacuerdo y el bug es silencioso. Este test lo evita.
  it("EDITABLE_STATES coincide con trip_estado_editable() de la migracion 0024", () => {
    const migration = readFileSync(
      path.resolve(__dirname, "../../../../supabase/migrations/0024_edicion_solicitudes_reparto.sql"),
      "utf-8",
    );

    const match = migration.match(
      /CREATE OR REPLACE FUNCTION public\.trip_estado_editable[\s\S]*?SELECT p_estado IN \(([^)]*)\)/,
    );
    expect(match, "no se encontro trip_estado_editable en la migracion 0024").toBeTruthy();

    const sqlStates = match![1]
      .split(",")
      .map((s) => s.trim().replace(/'/g, ""))
      .filter(Boolean)
      .sort();

    expect(sqlStates).toEqual([...EDITABLE_STATES].sort());
  });
});
