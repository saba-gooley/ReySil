# ReySil — Contexto del Proyecto

Sistema de gestion de viajes para Transportes ReySil: portal cliente, panel operadores y PWA chofer en un solo proyecto Next.js. Negocio en `docs/funcional.md`, arquitectura tecnica en `docs/arquitectura.md`, historias de usuario en `docs/historias.md`.

**Stack:** Next.js 14 (App Router) + TypeScript + Supabase (PostgreSQL + Auth + Realtime + RLS) + Tailwind. Deploy en Vercel.

## Al iniciar cada sesion
Leer en orden: `PLAN.md` → `ESTADO.md` → ultima entrada de `SESSION_LOG.md`.

## Reglas inamovibles
- Push directo a `main` PROHIBIDO. Siempre rama `feature/nombre-modulo` + PR.
- No modificar `PLAN.md` sin pasar por `/nuevo-requerimiento`.
- Respetar decisiones de `docs/arquitectura.md`. Construir cada modulo desde `docs/historias.md`.
- No construir un modulo si depende de otro incompleto.
- Toda tabla nueva: RLS activado + policies definidas. La seguridad vive en la BD.
- Mutaciones SOLO via Server Actions o Route Handlers. Nunca cliente Supabase directo desde componente client.
- Validar inputs con Zod (mismo schema en client y server).
- Secrets via env vars. Nunca hardcodear.
- **NO usar Supabase Storage** — los archivos van a Google Drive (requerimiento explicito del cliente).

## Convenciones de codigo
- Componentes React: PascalCase (`TripCard.tsx`)
- Funciones y variables: camelCase
- Tablas BD: snake_case plural (`trip_events`, `shift_logs`)
- Schemas Zod: PascalCase + sufijo (`CreateTripSchema`)
- Logica de negocio server-side en `lib/server/{dominio}/`. Nunca queries SQL en componentes.
- Rutas publicas: solo `/login` y `/recuperar-contrasena`. El resto pasa por middleware.

## Testing

**Comando principal:** `npm test` (Vitest, sin dependencias externas)

| Comando | Que corre | Necesita |
|---------|-----------|----------|
| `npm test` | Unitarios: gate de estados, validadores, mapeos, logica de destinos | nada |
| `npm run test:rls` | Policies RLS contra la BD real | Supabase local levantado |
| `npm run type-check` | `tsc --noEmit` | nada |
| `npm run lint` | ESLint de Next | nada |

**Supabase local (para `test:rls` y para desarrollar sin tocar produccion):**
```bash
npx supabase start      # levanta Postgres + Auth + Studio en Docker
npx supabase db reset    # aplica las migraciones y el seed de datos falsos
```
Usuarios del seed (`supabase/seed.sql`), todos con contrasena `password123`:
`operador@local.test`, `cliente-a@local.test`, `cliente-b@local.test`, `chofer@local.test`.
Para apuntar la app ahi, pisar `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
y `SUPABASE_SERVICE_ROLE_KEY` con los valores que imprime `supabase start`, y dejar
`SMTP_USER`/`SMTP_PASS` vacios para no mandar mails reales.

**Cobertura obligatoria** — si un cambio toca alguna de estas areas, tiene que tener test:
- **Aislamiento entre clientes**: un cliente nunca puede leer ni escribir datos de otro.
  Va como test de RLS, no solo de la Server Action.
- **Gate de estados de un viaje**: toda regla del tipo "solo se puede X si el viaje esta en
  estado Y" se valida en la policy RLS *y* en la Server Action, y ambas se testean.

Antes de cerrar un requerimiento: `npm test`, `npm run type-check` y `npm run lint` en verde.
Si el cambio toca RLS, tambien `npm run test:rls`.

## Archivos clave
- `PLAN.md` — arquitectura y modulos planificados
- `ESTADO.md` — estado actual de construccion
- `SESSION_LOG.md` — historial de sesiones (la mas reciente arriba)
- `docs/funcional.md`, `docs/historias.md`, `docs/arquitectura.md`, `docs/branding.md` — fuentes de verdad
