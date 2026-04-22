# SESSION_LOG.md — Historial de Sesiones

> Generado automaticamente con /fin-sesion al final de cada sesion.
> No editar manualmente.
> Las entradas mas recientes van arriba.

---

## Sesión 2026-04-22 — Módulo 9: Gestión de Camiones y Disponibilidad

### ✅ Completado

**A. Base de Datos — Migration 0009:**
- Creada tabla `trucks` con campos: id UUID, marca, modelo, patente UNIQUE, is_active, timestamps
- Creadas vistas `truck_daily_status` y `driver_daily_status` que calculan LIBRE/PREASIGNADO/ASIGNADO
- Agregado FK `truck_id` a `trip_assignments` table
- Implementadas RLS policies: OPERADOR/ADMIN pueden leer/escribir trucks
- Archivo: `supabase/migrations/0009_trucks_and_availability.sql`

**B. Queries y Server Actions:**
- `lib/server/trucks/queries.ts`: listActiveTrucks, getAllTrucks, getTruckStatusByDate, getTruckById, getTruckByPatente
- `lib/server/trucks/actions.ts`: createTruckAction, updateTruckAction, deactivateTruckAction, reactivateTruckAction
- `lib/validators/truck.ts`: TruckSchema con validación de patente format (AAA123BB)
- Extendido driver queries: getDriverStatusByDate, listActiveDrivers, tipo DriverWithStatus

**C. ABM Camiones (Vehicles Management):**
- `components/operador/truck-form.tsx`: Dialog form para crear/editar camiones con validación
- `components/operador/truck-list.tsx`: Tabla con separación visual de camiones activos/inactivos
- `app/operador/configuracion/camiones/page.tsx`: Página del ABM con server-side data fetch

**D. Selectlists con Status Indicators:**
- `components/operador/truck-select-list.tsx`: SelectList de camiones mostrando marca/modelo/status badges
- `components/operador/driver-select-list.tsx`: SelectList de choferes mostrando código/status badges
- Ambos paramétrizados por fecha (getTruckStatusByDate, getDriverStatusByDate)
- Colores: Verde=LIBRE, Amarillo=PREASIGNADO, Rojo=ASIGNADO

**E. AssignTripForm Refactor:**
- Reemplazado input text de patente → TruckSelectList
- Agregado DriverSelectList con status indicators
- Agregado prop `fecha` para cargar status de la fecha específica
- Actualizado AssignTripForm en: pendientes-view, asignado-view, preassigned-trip-actions
- Integración con Textarea component de shadcn/ui

**F. Availability Board (Tablero de Disponibilidad):**
- `components/operador/availability-board.tsx`: Grilla con dos columnas (Trucks, Drivers)
- Date selector: input date, prev/next day buttons, today button
- Vista de status: tarjetas por entidad con color y estado
- Resumen con conteos (Libres, Preasignados, Asignados)
- `app/operador/disponibilidad/page.tsx`: Ruta principal

**G. Menu Reorganization:**
- `components/operador/operador-nav.tsx` refactorizado:
  - Main items (no dropdown): Inicio, Disponibilidad, Toneladas, Reportes
  - Solicitudes dropdown: Pendientes, Chofer Asignado, En Curso, Finalizadas
  - Configuración dropdown: Clientes, Choferes, Camiones, General
  - Documentación dropdown: Remitos, Inspecciones

### 🔄 En progreso
- Ninguno — Module 9 completo

### ⏭️ Próximos pasos
1. Ejecutar migration 0009 en Supabase (asignar role admin para migration)
2. Testing del ABM camiones: crear, editar, desactivar
3. Testing de selectlists: verificar que cargan status correcto por fecha
4. Testing de disponibilidad: tablero debe mostrar status actualizado
5. Crear PR, review, merge a main
6. Validar que no hay conflictos con módulos anteriores

### 💡 Decisiones tomadas
- **SQL views vs explicit assignment table**: Truck_daily_status es una vista calculada, no tabla. Single source of truth es trips table. Evita sincronización manual.
- **TruckSelectList usa patente como value**: El value es patente string (no ID), porque assignment actions esperan patente en payload.
- **Fecha parametrizada**: No hardcodeamos CURRENT_DATE. Application layer selecciona fecha (flexible para asignaciones futuras).
- **Menu grouping**: Solicitudes, Configuración, Documentación en dropdowns. Clientes/Choferes/Camiones bajo Configuración (no main nav) para reducir ruido.
- **Admin client para queries**: `createAdminClient()` bypassa RLS en trucks queries. RLS protect writes pero admin queries necesitan leer todos los trucks.

### ⚠️ Problemas / blockers
- Ninguno — Module 9 implementado sin compromisos

---

## Sesión 2026-04-22 — Password Recovery Bug Fix

### ✅ Completado
- Diagnosticado y resuelto error "otp_expired" en password recovery de Vercel
- Configurado Google Workspace SMTP en Supabase Auth (usando App Password)
- Email de password recovery ahora llega correctamente
- Modificado `/auth/callback/route.ts` para detectar flujo de Supabase `/auth/v1/verify`
  - Ahora detecta cuando hay sesión pero no hay code (flujo de Supabase)
  - Redirige a `/restablecer-contrasena` correctamente cuando `type=recovery`
- Incluido `type=recovery` en `redirectUrl` para mantener parámetro en redirección
  - Archivo: `app/(auth)/recuperar-contrasena/actions.ts:61`
- Flujo completo funciona: solicitar recovery → email llega → redirige a resetear contraseña → cambio exitoso

### 🔄 En progreso
- Ninguno

### ⏭️ Próximos pasos
- Testing del flujo de sesión 7 (comentarios operador, preasignaciones, KM reorganizado) si no fue validado
- Cualquier nueva funcionalidad solicitada por el cliente
- El sistema está listo para producción

### 💡 Decisiones tomadas
- Mantener Google Workspace SMTP en Supabase (reusable desde notificaciones existentes)
- No implementar `generateLink()` con envío manual porque Google Workspace SMTP funciona correctamente

### ⚠️ Problemas / blockers
- Ninguno

---

## Sesion 2026-04-21 — Features: Comentarios Operador, Preasignaciones, KM en Turnos

### ✅ Completado

**Features de Comentarios del Operador (Asignaciones):**
- Agregado campo `comentario_asignacion` al insert en `preassignTripAction`
  - Archivo: `lib/server/assignments/actions.ts:194-202`
- Creada nueva acción `updatePreassignedTripAction` para cambiar preasignaciones sin cambiar estado
  - Verifica que trip.estado === PREASIGNADO antes de actualizar
  - Archivo: `lib/server/assignments/actions.ts:226-275`
- Soporte en `AssignTripForm` para nuevo modo "update-preassigned"
  - Agregado explicit Record<> typing a ACTIONS y LABELS para type safety
  - Archivo: `components/operador/assign-trip-form.tsx:25-37`
- Comentario existente mostrado al abrir formulario de asignación (currentComentario prop)
  - Archivos: `components/operador/assign-trip-form.tsx`, `components/operador/asignado-view.tsx`, `components/operador/preassigned-trip-actions.tsx`
- Comentario visualizado en panel de detalles (trip-table.tsx)
  - Agregada fila "Comentario del operador" en sección Asignacion cuando existe
  - Archivo: `components/operador/trip-table.tsx:419-422`
- Label de botón cambió de "Reasignar" a "Modificar" para mayor claridad
  - Archivo: `components/operador/assign-trip-form.tsx:36`

**Features de Preasignaciones (PREASIGNADO trips):**
- Creada nueva vista `PreassignedTripActions` con dos botones
  - "Modificar": abre form en modo update-preassigned (cambiar chofer/patente/comentario)
  - "Confirmar": abre form en modo assign (pasar a ASIGNADO)
  - Archivo: `components/operador/preassigned-trip-actions.tsx` (NEW)
- Integrada en `PendientesView`: trips con estado PREASIGNADO muestran PreassignedTripActions
  - Trips PENDIENTE siguen mostrando preassign form
  - Archivo: `components/operador/pendientes-view.tsx:27-36`

**Features de Hoja de Ruta (Cliente Portal):**
- Agregado campo `hoja_ruta` como primer input en grilla de solicitudes
  - Archivo: `components/cliente/reparto-grid.tsx:161-169`
- Incluido en payload del form
  - Archivo: `components/cliente/reparto-grid.tsx:92`

**Refactor: KM 50/100 y Pernoctada de Viajes → Turnos:**
- Removida sección "Tipo de carga" completamente de `trip-data-form.tsx`
  - Eliminada sección HTML (líneas 98-174 original)
  - Removidas variables de estado kmType, kmValue, pernocto, obs
  - Removido registerTripDataAction import (no usado en finalizacion)
  - Removida función DataSubmitBtn
  - Archivo: `components/chofer/trip-data-form.tsx`
- Refactorizada `shift-view.tsx` con nuevo layout:
  - Radio selector: "Km 50%" / "Km 100%" (en lugar de dos campos separados)
  - Campo único de KM con placeholder "Ingrese km"
  - Lógica: dependiendo del radio seleccionado, se guarda en km_50 o km_100
  - Pernoctada mantiene checkbox
  - Archivo: `components/chofer/shift-view.tsx:27-123`
- Removida WhatsApp FAB de chofer layout
  - Archivo: `app/chofer/layout.tsx`

### 🔄 En progreso
- Ninguno

### ⏭️ Próximos pasos
- Testing completo del flujo de comentarios: preasignar → modificar → confirmar → visualizar en detalles
- Testing de KM en turnos: seleccionar Km 50 vs 100 → ingresar valor → verificar en BD
- Testing de Hoja de Ruta: ingresar en solicitud → verificar guardado → visualizar en operador
- Validar que KM NO aparece más en viajes (solo en turnos)
- Deployment a Vercel y testing en producción

### 💡 Decisiones tomadas
- Crear `PreassignedTripActions` component separado en lugar de agregar lógica compleja a PendientesView — mejora mantenimiento y reutilización
- Usar `updatePreassignedTripAction` separada de `reassignTripAction` porque reassign chequea estado ASIGNADO (no flexible)
- KM 50/100 en shift_logs (turno) en lugar de trip_driver_data — arquitectura: KM es por jornada laboral completa, no por viaje
- Radio selector en shift-view (en lugar de dos campos) — mejor UX para chofer: elige tipo primero, luego ingresa valor

### ⚠️ Problemas / blockers
- Ninguno

---

## Sesion 2026-04-21 — Ciclo de Bug Fixes y Refinamiento

### ✅ Completado

**Fixes Operador Panel (8 vistas):**
- Fixed search multipalabra con espacios ("Juan Garcia" ahora filtra correctamente)
  - Cambio: `string.includes(word)` → `tokens.some(tok => tok.startsWith(word))`
  - Archivo: `components/operador/trip-table.tsx:40-46`
- Agregada columna Origen a todas las tablas (Pendientes, Asignado, En Curso, Finalizadas)
  - Archivos: `components/operador/trip-table.tsx`, `lib/server/assignments/queries.ts`
- Corregido sort order: fecha_solicitada ascendente (activos), descendente (historial)
  - Archivos: `lib/server/assignments/queries.ts` (listPendingTrips, listFinishedTrips)
- Agregados nuevos campos de contenedor en detalle expandido
  - Orden, Mercaderia, Despacho, Carga, Terminal, Devuelve en, Libre hasta
  - Archivos: `components/operador/trip-table.tsx`, `lib/server/assignments/queries.ts` (OPERATOR_TRIP_SELECT)
- Remitos ahora con styling verde "Ver remito" + fallback "no hay remito cargado"
  - Archivos: `components/operador/trip-table.tsx:TripDetail`
- Remitos visibles en vista En Curso (agregado prop showRemitos)
  - Archivos: `app/operador/en-curso/page.tsx`

**Fixes Cliente Portal (Seguimiento + Historial):**
- Chofer/Patente ahora visible en tabla (estaba vacio porque RLS bloqueaba lectura de drivers)
  - Causa raiz: trips queries usaban `createClient()` (anon key con RLS), drivers table solo permite lectura a staff
  - Solucion: Cambiar a `createAdminClient()` (como operador queries), con filtro por client_id mantiene seguridad
  - Archivos: `lib/server/trips/queries.ts`, `lib/server/clients/queries.ts`
- Normalizador robusto para relaciones 1:1 anidadas
  - Supabase devuelve relaciones como arrays (anon key) u objetos (service_role)
  - Nueva helper `unwrapOne()` maneja ambos formatos
  - Archivos: `lib/server/trips/queries.ts:normalizeTrips()`
- Detalle expandido ahora muestra TODOS los datos de solicitud
  - REPARTO: NDV, PAL, CAT, Nro UN, KG, Toneladas, Bultos, Tipo camion, Peon, Horario, Hoja de ruta
  - CONTENEDOR: Contenedor, Tipo, Peso, Orden, Mercaderia, Despacho, Carga, Terminal, Devuelve en, Libre hasta, Booking, Naviera, Buque, Fechas
  - Archivo: `components/cliente/trip-list.tsx:TripDetail()`
- Sort orders fijos: Seguimiento por fecha asc, Historial por fecha desc

**Fixes PWA Chofer (Viajes del dia):**
- Form "Guardar datos" deshabilitado cuando trip.estado === FINALIZADO
  - Uso: `<fieldset disabled={trip.estado === "FINALIZADO"}>`
  - Archivo: `components/chofer/trip-data-form.tsx:88-163`

**Fixes Administracion (ABM Clientes):**
- **CRITICAL FIX**: Depositos ahora se persisten correctamente al editar cliente existente
  - Problema raiz: Delete fallaba silenciosamente porque trips referencian deposit IDs via FK (sin ON DELETE CASCADE)
  - Solucion: Cambiar de delete+re-insert a update/insert/deactivate (marcar como inactivo en vez de borrar)
  - Archivos: `lib/server/clients/actions.ts:updateClientAction()` (lineas 299-343)
- Client queries (listClients, getClientById) cambiadas a `createAdminClient()` para consistencia
  - Archivo: `lib/server/clients/queries.ts`
- Agregado debug logging para deposits en server actions
  - Console logs cuando se reciben, cuando se insertan, si hay errores
  - Archivo: `lib/server/clients/actions.ts` (createClientAction, updateClientAction)

**Commits en main (8 totales):**
1. `aba819b` fix: batch UI/data fixes across operator, client, and chofer views
2. `c14de78` fix: client trip list showing all solicitud data and chofer/patente
3. `5b395ac` fix: switch client queries to adminClient to bypass RLS on drivers table
4. `ab7f1e5` fix: deposits - switch client queries to adminClient + add debug logging
5. `a3ae447` fix: deposits sync uses update/insert instead of delete+re-insert

### 🔄 En progreso
- Ninguno

### ⏭️ Proximos pasos

1. **Testing end-to-end por rol** (siguiendo el checklist en ESTADO.md):
   - CLIENTE: crear viaje (reparto/contenedor) → ver en Seguimiento con Chofer asignado → expandir → verificar todos los campos
   - OPERADOR: buscar con espacios → expandir → verificar Origen y nuevos campos de contenedor
   - CHOFER: ver viaje FINALIZADO → verificar form deshabilitado
   - ADMIN: editar cliente con depositos previos → cambiar nombre + agregar/quitar deposits → guardar → verificar en BD

2. **Validar flujo completo de depositos:**
   - Crear cliente nuevo (funciona segun user)
   - Editar cliente existente (arreglado en esta sesion) — verificar que update/insert/deactivate funciona

3. **Remover debug logging de deposits** (console.log en updateClientAction) una vez confirmado que funciona

4. **Testing en mobile** — PWA chofer debe responder en iPhone/Android

5. **Deploy a produccion** cuando testing pase

### 💡 Decisiones tomadas
- **Client queries deben usar createAdminClient()** — aunque parece contra-intuitivo, la seguridad viene del filtro por client_id (en las queries mismas), no de RLS. RLS es segunda linea de defensa. Si client queries van via anon key, fallan silencios en esos joined tables que RLS no permite
- **Deposits: deactivate en vez de delete** — respeta FKs en trips (origen_deposit_id, destino_deposit_id no tienen ON DELETE CASCADE). Deactivate permite edit de clientes sin romper historial de viajes
- **Normalizador con unwrapOne()** — adminClient devuelve objetos, anon key devuelve arrays. Una sola funcion maneja ambos casos

### ⚠️ Problemas / blockers
- Debug logging aun activo en clients/actions.ts (console.log) — no es problema pero limpiar antes de release
- Depositos no habia forma de testear en Vercel porque el cliente de prueba tenia viajes referenciando sus deposits. Ahora se puede testear: editar cliente → cambiar nombre + qty de deposits → guardar → verificar que persisten

---

## Sesion 2026-04-11 — Modulos 5, 6, 7 y 8 completos (proyecto finalizado)

### ✅ Completado
- **Modulo 5 — Panel Operadores** (HU-OPE-001 a HU-OPE-008, 25 pts): 8 vistas (Pendientes, Chofer Asignado, En Curso, Finalizadas, Remitos, Toneladas, Reportes). Asignacion/reasignacion de chofer+patente. Queries en `lib/server/assignments/queries.ts`, actions en `lib/server/assignments/actions.ts`. Componentes: `trip-table.tsx`, `assign-trip-form.tsx`, `pendientes-view.tsx`, `asignado-view.tsx`, `finalizadas-view.tsx`, `remitos-view.tsx`, `toneladas-view.tsx`, `reportes-view.tsx`. PR #5 mergeado
- **Fix RLS critico** — migracion `0004_fix_rls_complete.sql`: SECURITY DEFINER helpers (`trip_belongs_to_client`, `trip_assigned_to_driver`, `reservation_belongs_to_client`), fix recursion infinita en trips policies, containers INSERT para CLIENTE. Migracion `0005_fix_driver_data_rls.sql` para trip_driver_data
- **Fix PEON** — cambiado de texto libre a enum SI/NO (dropdown) en Zod schema, reparto-form.tsx y reparto-grid.tsx
- **Fix foto_url → drive_url** — corregido nombre de columna en queries.ts y trip-list.tsx
- **Modulo 6 — PWA Chofer** (HU-CHO-001 a HU-CHO-006, 28 pts): layout mobile-first con bottom nav (`app/chofer/layout.tsx`, `chofer-nav.tsx`). Viajes del dia con detalle expandible (`trip-list.tsx`). Registro de turno con 4 hitos (`shift-view.tsx`). Registro de datos de viaje con eventos, km, pernocto (`trip-data-form.tsx`). Inspeccion vehicular con 5 secciones y 35 items (`inspection-view.tsx`). Queries en `lib/server/chofer/queries.ts`, actions en `lib/server/chofer/actions.ts` con INSPECTION_SECTIONS (35 items). PR #6 mergeado
- **Modulo 7 — Notificaciones** (HU-NOT-001, HU-NOT-002, 5 pts): servicio SendGrid en `lib/server/notifications/send-email.ts`. Templates HTML con branding ReySil en `templates.ts`. HU-NOT-001 (`notify-assignment.ts`): email al asignar/reasignar chofer. HU-NOT-002 (`notify-remito.ts`): email al subir remito. Patron fire-and-forget. PR #7 mergeado
- **Modulo 8 — Integraciones**: Google Drive upload via Service Account en `lib/server/drive/upload.ts`. PDF de inspeccion con `@react-pdf/renderer` en `lib/server/pdf/templates/inspection.tsx` + `generate-inspection.ts`. Upload real de remito (reemplazado placeholder). File input con `capture="environment"` para camara mobile. PR #8 mergeado

### 🔄 En progreso
- Ninguno — todos los modulos completados

### ⏭️ Proximos pasos
1. Ejecutar migraciones 0004 y 0005 en Supabase SQL Editor
2. Configurar SendGrid (API key, verificar sender email)
3. Configurar variables de Google Drive en Vercel (ya estan en .env.local)
4. Testing end-to-end: flujo completo CLIENTE → OPERADOR → CHOFER
5. Deploy a produccion con todas las env vars

### 💡 Decisiones tomadas
- **SECURITY DEFINER helpers para romper recursion RLS** — las policies que hacen JOIN a tablas con RLS propio generan recursion infinita. Se resuelve con funciones helper que corren con privilegios elevados
- **PEON como enum SI/NO** — el campo no es numerico, es seleccion binaria. Cambiado en Zod y en los forms
- **Notificaciones fire-and-forget** — nunca bloquean la operacion principal. Si SendGrid falla, se loguea y se continua
- **Google Drive Service Account Key en base64** — para almacenar el JSON completo como env var sin problemas de escape
- **PDF de inspeccion generado async** — se genera en background despues de completar la inspeccion, para no bloquear al chofer

### ⚠️ Problemas / blockers
- Migraciones 0004 y 0005 pendientes de ejecutar (sin ellas hay errores de RLS)
- SendGrid pendiente de configurar (emails no se envian, pero el sistema funciona)

---

## Sesion 2026-04-10 — Modulo 2 (Autenticacion) + Modulo 3 (Administracion) completos

### ✅ Completado
- Completado **Modulo 2 — Autenticacion** (HU-AUTH-001 + HU-AUTH-002, 5 pts): login, recuperar/restablecer contrasena, middleware RBAC, RLS policies para 17 tablas, helpers server-side
- Migracion `supabase/migrations/0002_auth_rls_policies.sql` con ~50 RLS policies y 4 helpers SECURITY DEFINER (`auth_role`, `auth_client_id`, `auth_driver_id`, `auth_is_staff`)
- Schemas Zod en `lib/validators/auth.ts` (LoginSchema, RecoverPasswordSchema, ResetPasswordSchema)
- Server Actions para login (`app/(auth)/login/actions.ts`), recuperar (`app/(auth)/recuperar-contrasena/actions.ts`), restablecer (`app/(auth)/restablecer-contrasena/actions.ts`)
- `app/auth/callback/route.ts` (exchange code for session) y `app/sign-out/route.ts` (POST + GET)
- Middleware RBAC extendido en `lib/supabase/middleware.ts` con PUBLIC_PATHS, NEUTRAL_PATHS y ROLE_PREFIX
- Helpers en `lib/server/auth/get-current-user.ts` (getCurrentUser, tryGetCurrentUser, requireRole, homePathForRole)
- Placeholders por rol con requireRole() para validar flujo end-to-end
- PR #1 abierto, mergeado y deployado. Login end-to-end validado con usuario CLIENTE de prueba
- Configuracion manual completada: migracion 0002 aplicada, Site URL + Redirect URLs + JWT expiry en Supabase, NEXT_PUBLIC_APP_URL en Vercel
- Completado **Modulo 3 — Administracion** (HU-ADMIN-001 + HU-ADMIN-002, 8 pts): ABM clientes y choferes
- Schemas Zod en `lib/validators/client.ts` y `lib/validators/driver.ts`
- Server Actions y queries en `lib/server/clients/` y `lib/server/drivers/`
- Creacion atomica de `auth.users` + `user_profiles` al dar de alta clientes (rol CLIENTE) y choferes (rol CHOFER) via Service Role key
- Credenciales de chofer generadas automaticamente: formato `chofer.<dni>@reysil.app` + password temporal mostrada una sola vez
- Baja logica con ban/unban de auth.users al togglear `activo`
- Panel operadores con layout compartido (`app/operador/layout.tsx`) + navegacion (`components/operador/operador-nav.tsx`)
- ABM clientes: lista con filtro, formulario con emails dinamicos (agregar/quitar, marcar principal) y depositos dinamicos
- ABM choferes: lista con filtro, formulario con display de credenciales post-creacion
- PR #2 abierto, mergeado y deployado. ABM validado end-to-end con usuario OPERADOR
- Creado usuario OPERADOR de prueba para validar el panel

### 🔄 En progreso
- Ninguno — Modulos 2 y 3 cerrados

### ⏭️ Proximos pasos
1. Crear rama `feature/portal-cliente` desde `main`
2. Leer HU-CLI-001 a HU-CLI-005 en `docs/historias.md`
3. Crear layout compartido para `/cliente/*` con requireRole("CLIENTE")
4. HU-CLI-001: formulario solicitud de Reparto (`app/cliente/solicitudes/reparto/`) con Server Action en `lib/server/trips/actions.ts`
5. HU-CLI-002: carga masiva de repartos (grilla con TanStack Table)
6. HU-CLI-003: solicitud de Contenedor (reservations + containers + trips)
7. HU-CLI-004: seguimiento de viajes con Supabase Realtime
8. HU-CLI-005: historial de viajes finalizados/cancelados

### 💡 Decisiones tomadas
- **Trigger auth.users → user_profiles eliminado** — no viable por CHECK constraint que requiere client_id NOT NULL para CLIENTE. Usuarios se crean atomicamente desde Server Actions del ABM con Service Role key
- **NEUTRAL_PATHS en middleware** — `/restablecer-contrasena` acepta sesion temporal de recovery sin redirigir al home, permitiendo completar el flujo de reset
- **Credenciales de chofer con email sintetico `chofer.<dni>@reysil.app`** — Supabase Auth requiere email; este formato usa el DNI del chofer como identificador facil de recordar
- **Baja logica con ban de auth.users** — ban_duration "876600h" (~100 anos) al desactivar, "none" al reactivar. Evita borrar datos de auth

### ⚠️ Problemas / blockers
- Ninguno

---

## Sesion 2026-04-09 (parte 2) — Modulo 1 ejecutado + CLAUDE.md optimizado

### ✅ Completado
- Creada rama `feature/setup-infraestructura` y ejecutado el setup completo del Modulo 1
- Inicializado proyecto Next.js 14.2.35 + TypeScript + App Router + Tailwind
- Instaladas dependencias core: `@supabase/supabase-js`, `@supabase/ssr` v0.5.2, `zod`, `zustand`, `@tanstack/react-query`, `@react-pdf/renderer`, `googleapis`, `@sendgrid/mail`
- Configurado Tailwind con paleta `reysil` (red `#DC2626` provisional + variantes red-dark/red-light/white) y fuente Inter
- Creados clientes Supabase: `lib/supabase/client.ts` (browser), `lib/supabase/server.ts` (server + admin/service_role), `lib/supabase/middleware.ts` (updateSession)
- Creado `middleware.ts` raiz con import RELATIVO a `./lib/supabase/middleware` y matcher excluyendo `_next/static`, `_next/image`, favicon, manifest, sw, icons
- Creado `public/manifest.json` PWA basico (theme color reysil-red, display standalone)
- Escrita migracion `supabase/migrations/0001_initial_schema.sql` con 17 tablas (`clients`, `client_emails`, `client_deposits`, `drivers`, `operators`, `user_profiles`, `reservations`, `containers`, `trips`, `trip_reparto_fields`, `trip_assignments`, `trip_events`, `trip_driver_data`, `remitos`, `shift_logs`, `inspections`, `inspection_items`), ENUMs (`user_role`, `trip_type`, `trip_status`, `inspection_state`, `inspection_status`, `remito_status`, `deposit_type`), RLS activado en TODAS, triggers de `updated_at`, Realtime publication para `trips`/`trip_events`/`trip_assignments`, CHECK constraint sobre `user_profiles` para consistencia rol-entidad
- Creado `docs/branding.md` con paleta completa, decisiones UX extraidas de los 3 mockups del cliente (header rojo, observaciones progresivas, estado N/A, indicador offline, validacion de orden de eventos, FAB WhatsApp), y 5 items pendientes de confirmar
- Configurado `.gitignore` (Next, env, .vercel, .claude/) y `.env.local.example`
- Build local validado con env vars placeholder
- Configurado proyecto en Vercel y resuelto deploy en 3 etapas:
  1. Removida linea `export const runtime = 'nodejs'` del middleware (Next 14 solo soporta Edge en middleware)
  2. Cambiado import de `@/lib/supabase/middleware` a `./lib/supabase/middleware` (Vercel Edge bundler no resuelve aliases en middleware raiz de manera consistente)
  3. **Cambiado Vercel Settings → General → Framework Preset de "Other" a "Next.js"** (causa raiz del `ReferenceError: __dirname is not defined`). Redeploy sin cache.
- Deploy productivo funcionando en Vercel
- Optimizado `CLAUDE.md` (67 lineas / 3845 bytes → 33 lineas / 1954 bytes, ~49% menos): removidas secciones que duplicaban `PLAN.md`/`docs/arquitectura.md`/`docs/funcional.md`/`docs/historias.md` (descripcion del proyecto, stack detallado, descripcion completa de roles, lista de slash commands). Las 9 reglas inamovibles, las convenciones de codigo y los pointers a fuentes de verdad se conservan integros
- Guardadas 2 memorias persistentes en `~/.claude/projects/.../memory/`:
  - `feedback_explain_before_running.md` — explicar antes de correr comandos con env vars (incluso placeholders)
  - `project_vercel_framework_preset.md` — Framework Preset = "Next.js", no "Other"

### 🔄 En progreso
- Ninguno — Modulo 1 cerrado

### ⏭️ Proximos pasos
1. Crear rama `feature/autenticacion` desde `main` (volver al flujo PR estricto)
2. Verificar si la migracion `0001_initial_schema.sql` ya se aplico en el proyecto Supabase remoto (deuda tecnica anotada)
3. Escribir migracion `supabase/migrations/0002_auth_rls_policies.sql` con RLS policies para las 17 tablas, una por rol, segun `docs/arquitectura.md` seccion "Seguridad y RLS"
4. Trigger SQL: insert en `auth.users` → crear fila en `public.user_profiles` con role inicial `cliente`
5. Crear `app/(auth)/login/page.tsx` (form email+password con `signInWithPassword` y schema Zod `LoginSchema` en `lib/validators/auth.ts`)
6. Crear `app/(auth)/recuperar-contrasena/page.tsx` (form con `resetPasswordForEmail` y schema Zod `RecoverPasswordSchema`)
7. Actualizar `lib/supabase/middleware.ts` para que despues de refrescar la sesion lea `user_profiles.role` y redirija segun rol (cliente/operador/chofer/admin)
8. Crear `lib/server/auth/get-current-user.ts` reutilizable desde Server Actions y Server Components
9. Probar el flujo end-to-end con un usuario de prueba creado a mano desde el SQL editor de Supabase
10. PR a `main` cuando el modulo funcione

(Detalle completo en `ESTADO.md` seccion "Proximo Paso Exacto")

### 💡 Decisiones tomadas
- **Imports en `middleware.ts` raiz: paths relativos, no `@/...`** — el bundler Edge de Vercel no resuelve siempre los aliases en imports del middleware raiz; con relativos siempre funciona
- **Vercel Framework Preset DEBE ser "Next.js" (no "Other")** — el default "Other" rompe el bundling Edge del middleware con `__dirname is not defined`. Diagnosticado via supabase/supabase#21009. Documentado tambien en memoria persistente
- **`CLAUDE.md` minimalista** — todo lo que duplicaba otros docs se removio. Reglas + convenciones + pointers, nada mas. Reduce tokens en cada turno sin perder informacion (los docs se leen on-demand)
- **Push directo a main durante el setup del Modulo 1 — excepcion justificada UNA SOLA VEZ.** A partir de Modulo 2 vuelve el flujo `feature/...` + PR estricto. Documentado como deuda en `ESTADO.md`

### ⚠️ Problemas / blockers
- Ninguno activo. Los 3 problemas de deploy en Vercel quedaron resueltos (runtime line, path alias, framework preset)

---

## Sesion 2026-04-09 — Cierre

### Completado
- Generados los 4 archivos de gestion del proyecto: `CLAUDE.md`, `PLAN.md`, `ESTADO.md`, `SESSION_LOG.md`
- Convertidos `docs/Arquitectura.docx` y `docs/Historias.docx` a Markdown con pandoc (`docs/arquitectura.md`, `docs/historias.md`)
- Evaluado React Native + Expo vs PWA para la app del chofer. Decision: PWA (un solo codebase, sin stores, updates instantaneos)
- Evaluado el stack frontend/backend separado (Next.js + NestJS + Railway + Prisma) vs monolitico (Next.js + Supabase). Decision: monolitico para un cliente unico
- Evaluado Puppeteer vs `@react-pdf/renderer` para generacion de PDFs. Decision: `@react-pdf/renderer` (sin Chromium binario, funciona en serverless)
- Reescrito completo `PLAN.md` (rev. 2) con stack Next.js + Supabase, 16 tablas con RLS, 8 modulos, 9 decisiones de arquitectura
- Reescrito completo `CLAUDE.md` con nuevo stack, convenciones y reglas inamovibles
- Actualizado `ESTADO.md` con variables de entorno de Supabase, comandos de setup y proximo paso detallado del Modulo 1
- Reescrito completo `docs/arquitectura.md` (rev. 1.2) sincronizado con PLAN.md (todas las decisiones reflejadas en el documento fuente del cliente)

### En progreso
- Ninguno — sesion 1 fue 100% planificacion. Cero codigo escrito.

### Proximos pasos
1. Esperar `aprobado` del usuario sobre `PLAN.md` (rev. 2)
2. Crear rama `feature/setup-infraestructura`
3. Inicializar Next.js 14 + TypeScript + App Router con `create-next-app`
4. Instalar dependencias core (`@supabase/supabase-js`, `@supabase/ssr`, `zod`, `zustand`, `@tanstack/react-query`, `@react-pdf/renderer`, `googleapis`, `@sendgrid/mail`)
5. Crear proyecto Supabase y configurar `.env.local`
6. Escribir primera migracion `0001_initial_schema.sql` con las 16 tablas y RLS activado (sin policies todavia)
7. Configurar `middleware.ts`, `lib/supabase/{client,server,middleware}.ts` y `public/manifest.json`
8. Conectar a Vercel, deploy preview, PR a `main`
9. NO iniciar Modulo 2 hasta que el setup este desplegado y el schema corra limpio en Supabase

(Detalle completo en `ESTADO.md` seccion "Proximo Paso Exacto")

### Decisiones tomadas
- **Stack monolitico Next.js + Supabase** — Eliminada separacion frontend/backend. Para un cliente unico con este volumen, NestJS + Railway + Prisma agrega complejidad de deployment innecesaria. Supabase Auth + RLS reemplaza ~80% del modulo de auth manual
- **PWA en lugar de React Native + Expo** — Cliente solo requiere que funcione en telefonos iOS/Android, no publicacion en stores. PWA cumple todos los requerimientos (camara, offline, deep links a WhatsApp)
- **`@react-pdf/renderer` en lugar de Puppeteer** — Puppeteer trae ~170MB de Chromium, problemas en serverless de Vercel. `@react-pdf/renderer` define PDFs como JSX, funciona out of the box en serverless
- **Disciplina `lib/server/{dominio}/`** — Toda logica de negocio server-side organizada por dominio para compensar la falta de estructura impuesta de NestJS
- **RBAC en dos capas: middleware + RLS** — Middleware Next.js para UX (redirecciones), Row Level Security en Supabase para seguridad real de datos
- **Google Drive obligatorio (NO Supabase Storage)** — Requerimiento explicito del cliente para acceso directo desde su cuenta
- **Actualizar `docs/arquitectura.md` directamente (Opcion A)** — En vez de mantener el original y registrar cambios solo en PLAN.md, se decidio mantener el doc fuente sincronizado con la realidad del proyecto
- **Costo objetivo: ~$25/mes** (bajo desde ~$70 estimado original) — Supabase Pro $25 + Vercel Hobby/Pro

### Problemas / blockers
- Ninguno

---

## 2026-04-09 — Sesion 1 (cont.): Simplificacion a Next.js + Supabase

**Que se hizo:**
- Reevaluacion completa del stack para un cliente unico
- Eliminados NestJS, Railway, Prisma y Passport.js
- Migracion completa a Next.js + Supabase + Vercel

**Cambios de alcance:**
- `/nuevo-requerimiento`: simplificacion arquitectonica para un solo cliente. Se elimina la separacion frontend/backend porque agrega complejidad innecesaria. Stack final: Next.js (un solo proyecto con Cliente + Operador + PWA Chofer) + Supabase como backend gestionado (PostgreSQL + Auth + Realtime + RLS) + Vercel como unico deploy.
- **Auth**: Supabase Auth reemplaza JWT + Passport + bcrypt + rate limiting manual (~80% menos codigo en el modulo de autenticacion).
- **RBAC**: Se mueve de guards de aplicacion a Row Level Security en Supabase. Los 4 roles viven en `user_profiles.role` y se enforzan tanto en middleware Next.js como en policies RLS.
- **Realtime**: Supabase Realtime para suscripciones en `trips` y `trip_events`. Habilita actualizaciones en vivo en panel de operadores y seguimiento del cliente sin polling.
- **PDFs**: Se descarta Puppeteer (binario de Chromium ~170MB, problemas en serverless de Vercel). Se cambia a `@react-pdf/renderer` (componentes JSX, funciona out of the box en serverless, comparte modelo mental de React).
- **Estructura de codigo**: server-side organizado por dominio en `lib/server/{dominio}/` para compensar la falta de estructura impuesta de NestJS.
- **Validacion**: Zod con schemas compartidos client/server en `lib/validators/`.
- **Google Drive**: se mantiene como almacenamiento de archivos (requerimiento explicito del cliente). NO se usa Supabase Storage.
- **Costo**: bajo de ~$45-50/mes a ~$25/mes (Supabase Pro $25 + Vercel Hobby/Pro segun trafico).

**Archivos actualizados:** PLAN.md, CLAUDE.md, ESTADO.md, docs/arquitectura.md (rev. 1.2: stack completo a Next.js + Supabase, decisiones de arquitectura reescritas, estructura de carpetas en monorepo Next.js, eliminados NestJS/Railway/Prisma/Passport, Puppeteer cambiado a @react-pdf/renderer).

**Estado al cierre:** Proyecto sin iniciar — esperando aprobacion del plan revisado

---

## 2026-04-08 — Sesion 1: Generacion del plan + cambio de arquitectura mobile

**Que se hizo:**
- Generados archivos iniciales: CLAUDE.md, PLAN.md, ESTADO.md, SESSION_LOG.md
- Convertidos docs/Arquitectura.docx y docs/Historias.docx a markdown
- Evaluado cambio de React Native + Expo a PWA para app del chofer

**Cambio de alcance:**
- `/nuevo-requerimiento`: Se reviso la decision de usar React Native + Expo. El requerimiento del cliente es que funcione en telefonos iOS/Android, no publicacion en stores. PWA cumple todos los requerimientos (camara, offline, WhatsApp). Se cambio a PWA mobile-first dentro del mismo proyecto Next.js. Beneficios: un solo codebase, un solo deploy, zero costo de stores, updates instantaneos.
- Se agrego Puppeteer al stack para generacion de PDFs server-side. Necesario para el PDF de inspeccion del camion (HU-CHO-006). Modulo `pdf/` en backend con templates HTML/CSS. Layout de 35 items en 6 secciones es mas mantenible con HTML que con PDFKit programatico.

**Archivos actualizados:** PLAN.md, CLAUDE.md, ESTADO.md, docs/arquitectura.md (rev. 1.1: Decisión 1 cambiada a PWA, agregada Decisión 5 Puppeteer y Decisión 6 monorepo Next.js, costos actualizados, estructura de carpetas actualizada)

**Estado al cierre:** Proyecto sin iniciar — esperando aprobacion del plan

---
