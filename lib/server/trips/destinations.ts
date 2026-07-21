import type { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = ReturnType<typeof createClient>;

export type DestinoInput = { destino: string; observaciones?: string };

/**
 * Inserta los destinos de un viaje respetando el orden del array.
 * La existencia de filas es lo que marca al viaje como multi-destino
 * (no hay flag persistido), asi que insertar cero filas lo deja como
 * viaje de destino unico.
 */
export async function insertTripDestinations(
  supabase: SupabaseServerClient,
  tripId: string,
  destinos: DestinoInput[],
): Promise<void> {
  if (destinos.length === 0) return;
  await supabase.from("trip_destinations").insert(
    destinos.map((d, i) => ({
      trip_id: tripId,
      destino: d.destino,
      observaciones: d.observaciones || null,
      orden: i,
    })),
  );
}

/**
 * Req. 2.16 — Reemplaza los destinos de un viaje que se esta editando.
 *
 * En los estados editables (PENDIENTE/PREASIGNADO/ASIGNADO) los destinos
 * nunca tienen horas cargadas: el campo "Salida del destino" no se habilita
 * hasta que exista la llegada, y registrar la llegada pasa el viaje a
 * EN_CURSO — donde la edicion ya esta bloqueada. Por eso alcanza con borrar
 * y reinsertar, sin preservar filas por id.
 *
 * El chequeo de horas de abajo no cubre un caso alcanzable hoy: es una
 * asercion de invariante. Si algun cambio futuro permite que un viaje
 * editable tenga horas (por ejemplo devolver un EN_CURSO a ASIGNADO), esto
 * falla ruidosamente en vez de borrar el registro del chofer en silencio.
 *
 * Devuelve un mensaje de error, o null si salio todo bien.
 */
export async function replaceTripDestinations(
  supabase: SupabaseServerClient,
  tripId: string,
  destinos: DestinoInput[],
): Promise<string | null> {
  const { data: existing, error: readError } = await supabase
    .from("trip_destinations")
    .select("id, hora_llegada, hora_salida")
    .eq("trip_id", tripId);

  if (readError) return `Error al leer destinos: ${readError.message}`;

  const conHoras = (existing ?? []).filter(
    (d) => d.hora_llegada !== null || d.hora_salida !== null,
  );
  if (conHoras.length > 0) {
    return "Hay destinos con horas ya registradas por el chofer. No se pueden modificar.";
  }

  if ((existing ?? []).length > 0) {
    const { error: delError } = await supabase
      .from("trip_destinations")
      .delete()
      .eq("trip_id", tripId);
    if (delError) return `Error al reemplazar destinos: ${delError.message}`;
  }

  await insertTripDestinations(supabase, tripId, destinos);
  return null;
}

/**
 * El primer destino se replica en trips.destino_descripcion por
 * compatibilidad: listados, mails y la PWA del chofer lo siguen leyendo.
 */
export function resolveDestinoDescripcion(
  multiplesDestinos: boolean,
  destinos: DestinoInput[],
  destinoUnico: string,
): string | null {
  if (multiplesDestinos && destinos.length > 0) {
    return destinos[0].destino;
  }
  return destinoUnico || null;
}
