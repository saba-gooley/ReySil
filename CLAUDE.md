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

## Archivos clave
- `PLAN.md` — arquitectura y modulos planificados
- `ESTADO.md` — estado actual de construccion
- `SESSION_LOG.md` — historial de sesiones (la mas reciente arriba)
- `docs/funcional.md`, `docs/historias.md`, `docs/arquitectura.md`, `docs/branding.md` — fuentes de verdad
