/**
 * Req. 2.16 — Estados en los que una solicitud puede editarse.
 *
 * Una solicitud se edita mientras no haya arrancado. Apenas el chofer registra
 * el primer hito el viaje pasa a EN_CURSO y los datos quedan congelados.
 *
 * El equivalente en SQL es public.trip_estado_editable() (migracion 0024).
 * Si cambia uno hay que cambiar el otro — editable.test.ts verifica que la
 * lista de aca coincida con la de la migracion.
 */
export const EDITABLE_STATES = ["PENDIENTE", "PREASIGNADO", "ASIGNADO"] as const;

export type EditableState = (typeof EDITABLE_STATES)[number];

export function isTripEditable(estado: string | null | undefined): boolean {
  if (!estado) return false;
  return (EDITABLE_STATES as readonly string[]).includes(estado);
}

/** Mensaje unico para cuando se intenta editar un viaje que ya arranco. */
export const NOT_EDITABLE_ERROR =
  "El viaje ya esta en curso o finalizado y no se puede editar";
