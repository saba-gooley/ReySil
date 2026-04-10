import { z } from "zod";

/**
 * Schema para solicitud de viaje tipo Reparto (HU-CLI-001).
 *
 * Campos del formulario mapeados a trips + trip_reparto_fields:
 * - Fecha de Carga → trips.fecha_solicitada
 * - Deposito/Puerto → trips.origen_deposit_id / trips.origen_descripcion
 * - Destino → trips.destino_descripcion
 * - Comentarios → trips.observaciones_cliente
 * - NDV, PAL, CAT, Nro UN, cantidad_bultos, peso_kg, volumen_m3 → trip_reparto_fields
 * - Resto (fecha_entrega, codigo_postal, zona_tarifa, horario, tipo_camion, peon) → metadata JSONB
 */
export const CreateRepartoSchema = z.object({
  // trips fields
  fecha_solicitada: z.string().min(1, "Fecha de carga requerida"),
  origen_deposit_id: z.string().uuid().optional().nullable(),
  origen_descripcion: z.string().optional().default(""),
  destino_descripcion: z.string().optional().default(""),
  observaciones_cliente: z.string().optional().default(""),

  // trip_reparto_fields
  ndv: z.string().optional().default(""),
  pal: z.coerce.number().int().nonnegative().optional().nullable(),
  cat: z.string().optional().default(""),
  nro_un: z.string().optional().default(""),
  cantidad_bultos: z.coerce.number().int().nonnegative().optional().nullable(),
  peso_kg: z.coerce.number().nonnegative().optional().nullable(),
  volumen_m3: z.coerce.number().nonnegative().optional().nullable(),

  // metadata JSONB fields
  fecha_entrega: z.string().optional().default(""),
  codigo_postal: z.string().optional().default(""),
  zona_tarifa: z.string().optional().default(""),
  horario: z.string().optional().default(""),
  tipo_camion: z.string().optional().default(""),
  peon: z.coerce.number().int().nonnegative().optional().nullable(),
});

export type CreateRepartoInput = z.infer<typeof CreateRepartoSchema>;

/**
 * Schema para solicitud tipo Contenedor (HU-CLI-003).
 * Crea reservation + containers + trips.
 */
const containerEntry = z.object({
  numero: z.string().optional().default(""),
  tipo: z.string().optional().default(""),
  peso_carga_kg: z.coerce.number().nonnegative().optional().nullable(),
  observaciones: z.string().optional().default(""),
});

export const CreateContenedorSchema = z.object({
  // reservation fields
  numero_booking: z.string().optional().default(""),
  naviera: z.string().optional().default(""),
  buque: z.string().optional().default(""),
  fecha_arribo: z.string().optional().default(""),
  fecha_carga: z.string().min(1, "Fecha de carga requerida"),
  observaciones: z.string().optional().default(""),

  // trip routing
  origen_deposit_id: z.string().uuid().optional().nullable(),
  origen_descripcion: z.string().optional().default(""),
  destino_descripcion: z.string().optional().default(""),

  // containers
  containers: z
    .array(containerEntry)
    .min(1, "Al menos un contenedor es requerido"),
});

export type CreateContenedorInput = z.infer<typeof CreateContenedorSchema>;
