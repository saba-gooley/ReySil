# Branding & Guia de UX — ReySil

> Documento vivo. Las decisiones de paleta, tipografia y patrones de UI viven aca.
> Las capturas de referencia del mockup estan en `docs/mockups/chofer/`.

---

## Paleta de Colores

### Primaria
| Token | Hex | Uso |
|-------|-----|-----|
| `reysil-red` | `#DC2626` | **Provisorio** — color de marca principal. Headers, botones primarios, badges destacados. Pendiente confirmar codigo exacto del manual de marca del cliente. |
| `reysil-red-dark` | `#B91C1C` | Hover, estados activos, bordes acentuados |
| `reysil-red-light` | `#FEE2E2` | Backgrounds suaves, badges informativos |
| `reysil-white` | `#FFFFFF` | Background principal, texto sobre rojo |

### Estados (semantica universal)
| Token | Hex | Uso |
|-------|-----|-----|
| `success` | `#16A34A` | Cumple, completado, confirmado |
| `danger` | `#DC2626` | No cumple, error, rechazo |
| `warning` | `#EAB308` | Pendiente, atencion, en espera |
| `info` | `#2563EB` | Informativo, links |
| `neutral-900` | `#0F172A` | Texto principal |
| `neutral-500` | `#64748B` | Texto secundario, placeholders |
| `neutral-200` | `#E2E8F0` | Bordes, separadores |
| `neutral-50` | `#F8FAFC` | Background secundario |

> Nota: el rojo de marca y el `danger` semantico coinciden a proposito (ambos en `#DC2626`). Si el manual del cliente trae un rojo distinto, separarlos.

### PWA Manifest
- `theme_color`: `#DC2626`
- `background_color`: `#FFFFFF`
- `display`: `standalone`

---

## Tipografia
- Font family: **Inter** (sistema fallback: `-apple-system, BlinkMacSystemFont, sans-serif`)
- Headings: bold (700)
- Body: regular (400)
- Numeros grandes (cards de stats): bold (700) tamaño 36-48px

---

## Decisiones de UX derivadas del mockup (PWA Chofer)

> Estas decisiones surgen de las 3 capturas en `docs/mockups/chofer/`. Aplican al Modulo 6.

### Layout general (`/chofer/inicio`)
- **Header negro o rojo** con icono de camion + "ReySil Control" + fecha actual en español ("Jueves, 9 de Abril")
  - Sugerencia: header rojo `reysil-red` con texto blanco para reforzar marca (el mockup lo tiene en negro)
- **Stats cards arriba**: Total / Pendientes / Completados (3 columnas)
- **Tarjetas colapsables** apiladas verticalmente:
  1. Registro del Turno (X/4)
  2. Inspeccion del Camion (X/36)
- **Lista de viajes del dia** debajo, cada uno como card con nombre, direccion y badge de estado

### Registro del Turno (4 hitos)
| # | Hito | Tipo |
|---|------|------|
| 1 | Llegada Deposito ReySil | timestamp |
| 2 | Salida Deposito ReySil | timestamp |
| 3 | Vuelta al Deposito | timestamp |
| 4 | Fin del Turno | timestamp |

- Cada hito tiene: input de fecha/hora editable + boton **"Ahora"** que autocompleta con `new Date()`
- **Validacion de orden**: no se puede registrar "Salida" antes de "Llegada", etc. Mostrar disabled/tooltip si se intenta saltearlo.

### Inspeccion del Camion (36 items en 6 secciones colapsables)
Las 6 secciones (a confirmar nombres exactos con cliente):
1. **Documentacion** — ART, Seguro y Licencias, Cedula Verde, RUTA y VTV, etc.
2. **Estado del Vehiculo** — Carroceria, Pintura, Espejos, etc.
3. **Motor y Mecanica** — Aceite, Refrigerante, Correas, etc.
4. **Cabina y Interior** — Tablero, Cinturones, Asientos, etc.
5. **Luces y Electrico** — Faros, Stop, Giros, Bateria, etc.
6. **Seguridad y Emergencia** — Matafuego, Balizas, Botiquin, Crique, etc.

**Estructura por item:**
- Boton verde **Cumple** + boton rojo **No Cumple** (mutuamente exclusivos)
- Tercer estado **N/A** propuesto (para items que no apliquen al camion del dia)
- Campo **Observaciones** (texto libre)
  - **Mejora propuesta**: mostrar Observaciones solo cuando se selecciona "No Cumple" o "N/A". Reduce ruido visual en pantalla con 36 items.

**Resumen visual arriba de la inspeccion:**
- 3 indicadores: ● verde (cumple) | ● rojo (no cumple) | ● amarillo (pendiente)
- Contador "(X/36)" en el header de la seccion principal

### Patrones generales
- **Progresividad**: campos secundarios aparecen solo cuando son necesarios (ej. observaciones tras "No Cumple")
- **Indicador offline visible**: badge en header cuando el Service Worker esta sirviendo desde cache. Critico para chofer en ruta sin señal.
- **Persistencia local de inspeccion en curso**: si el chofer pierde señal a la mitad de los 36 items, los datos sobreviven en IndexedDB y se sincronizan al recuperar conexion.
- **Atajo flotante de WhatsApp**: boton fijo abajo a la derecha (FAB) que dispara `wa.me/{numero-empresa}`. Cumple HU-CHO requirement de comunicacion rapida.
- **Tap targets minimos 44x44px** (estandar mobile, especialmente para chofer con manos sucias o guantes).
- **Sin scroll horizontal**: todo cabe en viewport vertical de 375px (iPhone SE como minimo).

---

## Patrones de UI (a aplicar en todos los modulos)

### Botones
- **Primario**: bg `reysil-red`, texto blanco, hover `reysil-red-dark`
- **Secundario**: border `reysil-red`, texto `reysil-red`, bg blanco
- **Destructivo**: bg `danger`, texto blanco
- **Ghost**: sin bg, texto `neutral-900`, hover `neutral-50`

### Estados de viajes (badges)
| Estado | Color de badge | Texto |
|--------|---------------|-------|
| `pendiente` | `warning` light + texto warning dark | "Pendiente" |
| `asignado` | `info` light + texto info dark | "Asignado" |
| `en_curso` | `reysil-red` + texto blanco | "En curso" |
| `finalizado` | `success` light + texto success dark | "Finalizado" |
| `cancelado` | `neutral-200` + texto neutral-500 | "Cancelado" |

### Cards
- Border radius: `rounded-2xl` (16px)
- Shadow: `shadow-sm` por defecto, `shadow-md` en hover
- Padding: `p-4` (mobile) / `p-6` (desktop)
- Border: `border border-neutral-200`

---

## Items pendientes de confirmar con cliente

| # | Item | Impacto |
|---|------|---------|
| 1 | Codigo hex exacto del rojo de marca (provisorio: `#DC2626`) | Toda la UI |
| 2 | Logo en SVG (para header de PWA y favicons) | Modulo 1 + 6 |
| 3 | Numero exacto de items de inspeccion: el funcional decia ~35, el mockup muestra 36 | Modulo 6 |
| 4 | Nombres exactos de las 6 secciones de inspeccion | Modulo 6 |
| 5 | Numero de WhatsApp de la empresa para el atajo del chofer | Modulo 6 |

---

## Referencias visuales

Las capturas del mockup proporcionado por el cliente estan en:
- `docs/mockups/chofer/IMG_2952 reysil.PNG` — Inicio + viajes del dia
- `docs/mockups/chofer/IMG_2953 reysil.PNG` — Registro del Turno expandido
- `docs/mockups/chofer/IMG_2954resysil.PNG` — Inspeccion del Camion expandida

Usar como guia, no como blueprint. Las mejoras propuestas en este documento (header rojo, observaciones progresivas, estado N/A, indicador offline, validacion de orden) deberian aplicarse al construir el Modulo 6.
