# ReySil — Contexto del Proyecto

## Que es este proyecto
Sistema de gestion de viajes para Transportes ReySil. Incluye un portal web de autogestion para clientes, un panel de back office para operadores, y una PWA mobile-first para choferes. Todo en un solo proyecto Next.js con Supabase como backend gestionado. Digitaliza todo el ciclo: solicitud de viaje, asignacion de chofer, ejecucion, foto de remito y notificacion al cliente.

## Stack Tecnologico
- App completa: Next.js 14 + TypeScript (App Router con Server Actions)
- Backend gestionado: Supabase (PostgreSQL + Auth + Realtime + RLS)
- Estado: Zustand + React Query (TanStack Query)
- Validacion: Zod (schemas compartidos client/server)
- Almacenamiento de archivos: Google Drive API v3 (Service Account)
- Email: SendGrid
- Generacion de PDF: @react-pdf/renderer (server-side)
- Deploy: Vercel
- Control de versiones: GitHub

## Roles de Usuario
- **Cliente**: Solicitar viajes (Reparto y Contenedor), ver estado y seguimiento, recibir notificaciones por email
- **Operador**: Ver solicitudes, asignar chofer/patente, confirmar asignaciones, gestionar remitos, reportes, ABM de clientes y choferes
- **Chofer**: Ver viajes del dia, registrar turno, registrar datos por viaje, foto de remito, inspeccion del camion, acceso a WhatsApp
- **Administrador**: Acceso completo a todas las funcionalidades, gestion de parametros del sistema

Los roles viven en la tabla `user_profiles.role` y se enforzan tanto en el middleware de Next.js como en las RLS policies de Supabase.

## Convenciones de Codigo
- Componentes React: PascalCase (`TripCard.tsx`)
- Funciones y variables: camelCase
- Tablas de BD: snake_case en plural (`trip_events`, `shift_logs`)
- Schemas Zod: PascalCase con sufijo (`CreateTripSchema`)
- Logica de negocio server-side: en `lib/server/{dominio}/` — nunca queries SQL en componentes
- Mutaciones: siempre via Server Actions o Route Handlers — nunca cliente Supabase directo desde componentes client
- Rutas protegidas: validadas por `middleware.ts` segun rol
- Rutas publicas: solo `/login` y `/recuperar-contrasena`

## Reglas Inamovibles
- Nunca hacer push directo a main — siempre rama + PR
- Crear rama `feature/nombre-modulo` antes de cada modulo nuevo
- No modificar PLAN.md sin pasar por /nuevo-requerimiento
- Respetar las decisiones de arquitectura de `docs/arquitectura.md`
- Usar las historias de usuario de `docs/historias.md` como base de cada modulo
- No construir un modulo si depende de otro que no esta completo
- Toda tabla nueva debe tener RLS activado y policies definidas — la seguridad vive en la BD
- Validar inputs con Zod en client y server (mismo schema)
- Variables de entorno para todos los secrets — nunca hardcodear
- NO usar Supabase Storage — los archivos van a Google Drive (requerimiento del cliente)

## Archivos Clave del Proyecto
- `PLAN.md` → arquitectura y modulos planificados (no modificar sin /nuevo-requerimiento)
- `ESTADO.md` → estado actual de construccion (se actualiza con /fin-sesion)
- `SESSION_LOG.md` → historial de sesiones (se actualiza con /fin-sesion)
- `docs/funcional.md` → documento funcional del cliente (fuente de verdad)
- `docs/historias.md` → historias de usuario (25 historias, 94 puntos)
- `docs/arquitectura.md` → arquitectura tecnica (fuente de verdad tecnica)

## Al Iniciar Cada Sesion
Leer en este orden:
1. `PLAN.md` — arquitectura acordada
2. `ESTADO.md` — donde estamos exactamente
3. `SESSION_LOG.md` — solo la ultima entrada

## Comandos Disponibles
- /generar-plan → genera archivos iniciales (ya ejecutado)
- /retomar → usar al inicio de cada sesion nueva
- /fin-sesion → usar antes de cerrar o antes de /compact
- /nuevo-requerimiento → cuando surge algo nuevo en el medio del proyecto
- /status → ver estado del proyecto en cualquier momento
