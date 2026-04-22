# ESTADO.md — Estado Actual del Proyecto

> Se actualiza automaticamente con /fin-sesion.
> Es lo primero que Claude lee para saber donde estamos.
> Ultima actualizacion: 2026-04-22 (cierre sesion 10 — Critical Bug Fixes)

---

## Estado General
🔄 Proyecto funcional — 8 módulos completos + Módulo 9 (Gestión de Camiones) en revisión. Listo para testing.

---

## Modulos

| # | Modulo | Estado | Notas |
|---|--------|--------|-------|
| 1 | Setup e Infraestructura | ✅ Completo | Next.js 14.2.35, schema SQL 17 tablas, middleware Supabase, PWA manifest, deploy Vercel |
| 2 | Autenticacion | ✅ Completo | Login, recuperar/restablecer contrasena, middleware RBAC, RLS policies 17 tablas, helpers getCurrentUser/requireRole |
| 3 | Administracion | ✅ Completo | ABM clientes (con emails y depositos) y ABM choferes (con generacion de credenciales). Panel operadores con layout y nav |
| 4 | Portal Cliente | ✅ Completo | Solicitud Reparto (form + grilla), Solicitud Contenedor, seguimiento realtime, historial. PR #3 y #4 mergeados |
| 5 | Panel Operadores | ✅ Completo | 8 vistas (Pendientes, Asignado, En Curso, Finalizadas, Remitos, Toneladas, Reportes, Clientes, Choferes). PR #5 mergeado |
| 6 | PWA Chofer | ✅ Completo | Layout mobile-first, viajes del dia, turno, inspeccion vehicular (5 secciones, 35 items). PR #6 mergeado |
| 7 | Notificaciones | ✅ Completo | SendGrid: email al asignar chofer (HU-NOT-001) y al subir remito (HU-NOT-002). Fire-and-forget. PR #7 mergeado |
| 8 | Integraciones | ✅ Completo | Google Drive upload (remitos + PDF inspecciones), @react-pdf/renderer para PDF inspeccion. PR #8 mergeado |
| 9 | Gestión de Camiones y Disponibilidad | 🔄 En revisión | ABM camiones, tablero de disponibilidad diaria, selectlists de trucks/drivers con status, menu reorganizado |

**Referencias:** ⬜ Pendiente · 🔄 En progreso · ✅ Completo · 🚫 Bloqueado

---

## Trabajo Completado en Esta Sesion (2026-04-22 — Sesion 10)
🐛 **Critical Bug Fixes — Basado en feedback de usuario**:

**Completado:**

**A. Menu Navigation Fix:**
- [x] Fix menu dropdown logic en `operador-nav.tsx`
- [x] "Camiones" y "General" ya no se marcan activos simultáneamente
- [x] Implementado `isConfiguracionItemActive()` helper con lógica exacta para "General"

**B. Chofer Asignado Interface:**
- [x] Nuevo componente `assigned-trip-actions.tsx`
- [x] Añadido "Modificar" button que togglea el formulario de edición
- [x] Matches pattern de `preassigned-trip-actions.tsx` para UX consistente
- [x] Actualizado `asignado-view.tsx` para usar nuevo componente

**C. Driver Password Management:**
- [x] `resetDriverPasswordAction()` en `lib/server/drivers/actions.ts` — permite a operadores resetear contraseñas
- [x] `changePasswordAction()` en `lib/server/auth/change-password.ts` — permite a drivers cambiar su propia contraseña (futuro)
- [x] `PasswordResetSection` component en `driver-form.tsx` para edit mode
- [x] Muestra nuevas credenciales después de reset (una sola vez)

**D. Email Notification Diagnostics:**
- [x] `/api/admin/notifications-diagnostics` endpoint — inspecciona configuración de sendgrid y tablas de preferencias
- [x] Ayuda a debuggear why emails no se envían (falta de SENDGRID_API_KEY, o tablas vacías)

**Commits realizados:**
1. `cbaed7b` — fix: menu dropdown logic (camiones vs general)
2. `af711a0` — fix: add modify button toggle for assigned trips
3. `a502cae` — add: notification diagnostics endpoint
4. `7c3f72d` — feat: add password reset functionality

**Archivos modificados:**
- `components/operador/operador-nav.tsx`
- `components/operador/asignado-view.tsx` (NEW: `components/operador/assigned-trip-actions.tsx`)
- `lib/server/drivers/actions.ts`
- `lib/server/auth/change-password.ts` (NEW)
- `components/operador/driver-form.tsx`
- `app/api/admin/notifications-diagnostics/route.ts` (NEW)

---

## Trabajo Completado en Sesion 9 (2026-04-22)
🚚 **Módulo 9: Gestión de Camiones y Disponibilidad Diaria**:

**Completado:**

**A. Base de Datos (Migration 0009):**
- [x] Tabla `trucks` (id UUID, marca, modelo, patente UNIQUE, is_active, timestamps)
- [x] Vista `truck_daily_status` (calcula LIBRE/PREASIGNADO/ASIGNADO por fecha)
- [x] Vista `driver_daily_status` (mismo patrón para drivers)
- [x] RLS policies: OPERADOR/ADMIN pueden ver y modificar trucks
- [x] FK en trip_assignments: truck_id references trucks(id)
- [x] Archivo: `supabase/migrations/0009_trucks_and_availability.sql`

**B. Server-Side Logic:**
- [x] `lib/server/trucks/queries.ts` — listActiveTrucks, getAllTrucks, getTruckStatusByDate, getTruckById, getTruckByPatente
- [x] `lib/server/trucks/actions.ts` — createTruckAction, updateTruckAction, deactivateTruckAction, reactivateTruckAction
- [x] `lib/validators/truck.ts` — TruckSchema con validación de patente (AAA123BB)
- [x] Driver queries extendidas: getDriverStatusByDate, listActiveDrivers

**C. ABM Camiones (/operador/configuracion/camiones):**
- [x] `components/operador/truck-form.tsx` — Dialog form para crear/editar camiones
- [x] `components/operador/truck-list.tsx` — Tabla con separación activos/inactivos
- [x] `app/operador/configuracion/camiones/page.tsx` — ABM page

**D. Selectlists para Asignaciones:**
- [x] `components/operador/truck-select-list.tsx` — SelectList con status indicators (LIBRE/PREASIGNADO/ASIGNADO)
- [x] `components/operador/driver-select-list.tsx` — Equivalent para drivers
- [x] Integradas en `assign-trip-form.tsx` reemplazando inputs text de patente
- [x] Fecha awareness: ambos selectlists cargan status de la fecha solicitada

**E. Tablero de Disponibilidad (/operador/disponibilidad):**
- [x] `components/operador/availability-board.tsx` — Grilla de trucks y drivers con status visual
- [x] Date selector con navegación (prev/next day, today button)
- [x] Legend de colores (verde/amarillo/rojo para LIBRE/PREASIGNADO/ASIGNADO)
- [x] Resumen de estadísticas (conteos por estado)
- [x] `app/operador/disponibilidad/page.tsx`

**F. Menu Reorganization:**
- [x] `components/operador/operador-nav.tsx` actualizado:
  - Main items: Inicio, Disponibilidad, Toneladas, Reportes
  - Solicitudes dropdown: Pendientes, Chofer Asignado, En Curso, Finalizadas
  - Configuración dropdown: Clientes, Choferes, Camiones, General
  - Documentación dropdown: Remitos, Inspecciones

---

## Trabajo Completado en Sesion 7 (2026-04-21)
🔧 **Features, Comentarios de Operador y Reorganizacion de Datos Chofer**:

**Features en Panel Operadores (viajes PENDIENTE/PREASIGNADO):**
- [x] Agregada columna "Hoja de Ruta" como primer campo en grilla de solicitudes (reparto-grid.tsx)
- [x] Hoja de Ruta incluida en payload de form y guardada en BD
- [x] Implementados botones para viajes PREASIGNADO: "Modificar" (reasignar sin cambiar estado) y "Confirmar" (pasar a ASIGNADO)
- [x] Nueva acción `updatePreassignedTripAction` para cambiar preasignaciones manteniendo estado PREASIGNADO

**Comentarios del Operador (Asignaciones/Reasignaciones):**
- [x] Campo `comentario_asignacion` guardado en PREASSIGN, REASSIGN, y UPDATE-PREASSIGNED actions
- [x] Comentario existente mostrado al abrir formulario de asignación (en PREASIGNADO y ASIGNADO)
- [x] Comentario visualizado en panel de detalles de viajes (trip-table.tsx, sección "Asignacion")
- [x] Label de botón cambió de "Reasignar" a "Modificar" para mayor claridad
- [x] Soporte en AsignadoView para pasar y mostrar comentarios existentes

**Reorganizacion de Datos Chofer (Turnos vs Viajes):**
- [x] Sección "Tipo de carga" (Km 50%, Km 100%, KM, Pernoctada) removida de Viajes (trip-data-form.tsx)
- [x] Nuevos campos implementados en Turnos (shift-view.tsx) con layout mejorado: radio selector Km 50/100 + campo único de KM
- [x] Lógica inteligente: dependiendo del radio seleccionado, el KM se guarda en km_50 o km_100
- [x] Pernoctada mantiene checkbox en Turnos

**Archivos modificados en esta sesion (7 commits):**
- `components/cliente/reparto-grid.tsx` — add hoja_ruta input cell, include in payload
- `app/chofer/layout.tsx` — remove WhatsApp FAB
- `components/operador/preassigned-trip-actions.tsx` — NEW: buttons for Modificar/Confirmar on PREASIGNADO
- `components/operador/pendientes-view.tsx` — use PreassignedTripActions for PREASIGNADO trips
- `lib/server/assignments/actions.ts` — add comentario_asignacion to preassignTripAction, NEW updatePreassignedTripAction
- `components/operador/assign-trip-form.tsx` — support update-preassigned mode, explicit Record types, pass currentComentario
- `components/operador/asignado-view.tsx` — pass currentComentario to AssignTripForm
- `components/operador/trip-table.tsx` — display comentario_asignacion in Asignacion section
- `components/chofer/shift-view.tsx` — refactor to radio selector + single KM input, new logic for kmType
- `components/chofer/trip-data-form.tsx` — remove Tipo de carga section, simplify finalization

---

## Proximo Paso Exacto

**Status actual:** 4 bugs críticos fixeados y deployeados a Vercel. Testing en progreso.

**Pendiente (Critical Issues no resueltos):**

### #4, #5, #6 — Email Notifications Not Working
**Estado:** Código implementado correctamente, pero emails no se envían.
**Causa probable:** Tablas de preferencias vacías o SENDGRID_API_KEY no configurada en Vercel.
**Acción requerida:**
1. Visitar `https://reysil.vercel.app/api/admin/notifications-diagnostics` para inspeccionar setup
2. Si `sendGridConfigured: false` → agregar SENDGRID_API_KEY a variables de entorno de Vercel
3. Si `clientNotificationPreferencesCount: 0` → insertar registros en tabla `client_notification_preferences` con:
   - `client_id`, `email`, `enviar_al_crear_solicitud=true`, `enviar_al_asignar_chofer=true`
4. Si `reysilNotificationEmailsCount: 0` → insertar registros en tabla `reysil_notification_emails` con:
   - `email`, `enviar_solicitudes=true`, `enviar_asignaciones=true`
5. Re-test: crear solicitud → verificar que llega email

### #9, #10 — Real-Time Updates (Chofer Asignado / Viajes)
**Estado:** No implementado.
**Descripción:** Datos de solicitud no se actualizan automáticamente cuando cambia el estado en otro panel.
**Arquitectura necesaria:**
- Implementar Supabase Realtime subscriptions en componentes que muestran trips
- Ubicaciones clave:
  - `app/operador/chofer-asignado/page.tsx` (asignado-view.tsx)
  - `app/chofer/turno/page.tsx` (trip data sections)
- Alternativa: Agregar manual refresh button (menos elegante pero más rápido)
**Esfuerzo:** ~2-3 horas con Realtime subscriptions

**Testing completado:**
- ✅ Menu fixes probado en dev
- ✅ Modificar button (chofer asignado) probado en dev  
- ✅ Password reset button añadido (no yet testedo en browser)
- ✅ Build sin errores
- ✅ Push a GitHub exitoso
- ⏳ Vercel deploy en progreso (automatic)

**Próxima iteración:**
1. Testing manual en Vercel deployment
2. Resolver email issues (probablemente agregar datos a tablas de preferencias)
3. Implementar real-time updates si hay tiempo/prioridad

---

## Decisiones Tomadas Durante la Construccion
- **Imports en `middleware.ts` raiz: usar paths relativos (`./lib/...`)**, NO el alias `@/...`. El bundler Edge de Vercel no resuelve siempre los path aliases en imports del middleware raiz, y eso rompia el deploy.
- **Vercel Framework Preset = "Next.js"** (no "Other", que es el default). Vercel a veces detecta el proyecto como "Other" al importarlo y eso rompe el bundling Edge del middleware (`__dirname is not defined`).
- **`CLAUDE.md` optimizado**: removidas las secciones que duplicaban `PLAN.md`, `docs/arquitectura.md` y `docs/funcional.md`. Resultado: ~49% menos tokens.
- **Trigger auth.users → user_profiles eliminado**: no es viable porque el CHECK constraint en `user_profiles` requiere `client_id IS NOT NULL` para rol CLIENTE, y un trigger no puede saber a que cliente vincular. Los usuarios se crean atomicamente desde las Server Actions del ABM (Modulo 3) usando Service Role key.
- **NEUTRAL_PATHS en middleware**: `/restablecer-contrasena` no es publica ni protegida — el usuario llega con una sesion temporal de recovery y no debe ser redirigido a su home antes de cambiar el password.
- **Credenciales de chofer con email sintetico**: formato `chofer.<dni>@reysil.app`. Supabase Auth requiere email como identificador; este formato es facil de recordar para el chofer (su propio DNI). No se envia email real — solo sirve como username.
- **Baja logica con ban de auth.users**: al desactivar un cliente/chofer, se banea a los usuarios auth asociados (`ban_duration: "876600h"` = ~100 anos). Al reactivar, se desbanea (`ban_duration: "none"`).
- **SECURITY DEFINER helpers para RLS**: `auth_is_staff()`, `trip_belongs_to_client()`, `trip_assigned_to_driver()`, `reservation_belongs_to_client()` evitan recursion infinita en policies que hacen JOIN a la misma tabla.
- **PEON como enum SI/NO**: no es numerico, es un campo de seleccion binaria (dropdown en el form).
- **Notificaciones fire-and-forget**: las llamadas a SendGrid nunca bloquean la operacion principal. Si falla, se loguea y se continua.
- **Google Drive Service Account Key en base64**: el JSON completo se codifica en base64 para almacenarlo como variable de entorno sin problemas de escape.

**Decisiones Sesion 7 (2026-04-21):**
- **PreassignedTripActions component**: UI con dos botones ("Modificar" y "Confirmar") para viajes PREASIGNADO.
- **updatePreassignedTripAction**: nueva acción separada para actualizar preasignaciones.
- **KM fields en shift_logs**: arquitectura: KM es por turno, no por viaje.
- **Radio selector para KM tipo**: mejor UX en shift-view.

**Decisiones Sesion 9 (2026-04-22 — Module 9):**
- **SQL views para status diario**: `truck_daily_status` y `driver_daily_status` son vistas que calculan estado bajo demanda desde trips. Nunca se sincroniza: single source of truth (trips table) → evita desincronización.
- **TruckSelectList usa patente como value**: el value del select es patente (no ID) porque los assignment actions esperan patente. Simplifica integración.
- **Fecha parametrizada**: getTruckStatusByDate(fecha) no usa CURRENT_DATE hardcoded. Application layer puede seleccionar cualquier fecha. Flexible para asignaciones futuras.
- **RLS policies en trucks**: solo OPERADOR/ADMIN pueden crear/leer/modificar trucks. Admin client bypassa RLS para queries en queries.ts (intentar con anon key fallaría).
- **Menu reorganized con dropdowns**: Solicitudes, Configuración, Documentación agrupan items. Reduce ruido visual. Clientes/Choferes/Camiones ahora bajo Configuración (no en main nav).

---

## Bloqueantes Activos
- **Ninguno** — Module 9 implementado sin blockers. Listo para testing.

---

## Deuda Tecnica Anotada
- **Lockout per-usuario despues de 5 intentos fallidos** (HU-AUTH-001): no implementado en v1. Dependemos del rate limiting nativo de Supabase Auth (por IP).
- **Cache de rol en middleware**: `lib/supabase/middleware.ts` consulta `user_profiles` en cada request. En producción con mucho tráfico, considerar cache en cookie.
- **`listUsers()` en updateClientAction**: trae TODOS los usuarios. Con muchos usuarios, paginar o buscar por email.
- **PDF de inspección fire-and-forget**: si falla upload a Drive, no hay retry.
- **Remito upload sin validación de tamaño**: considerar validar max ~10MB server-side.
- **Service Worker para PWA offline**: manifest.json configurado pero sin service worker real.
- **Module 9 testing antes de merge**: migration 0009 debe ejecutarse en Supabase. Selectlists deben validar carga de status correctamente. Tablero de disponibilidad debe ser actualizado en tiempo real si se asigna un viaje.
- **Email notifications not working (Critical #4, #5, #6):** Code is correct but SENDGRID_API_KEY may be missing from Vercel env or notification preference tables are empty. Diagnostics endpoint at `/api/admin/notifications-diagnostics` shows status.
- **Real-time updates missing (Critical #9, #10):** Chofer Asignado and Chofer Turno pages don't auto-refresh when trip data changes. Require Supabase Realtime subscriptions implementation.
- **Password reset UI not tested:** Component added but not verified in browser yet. Need testing on production deployment.

---

## Entorno y Configuracion

**Variables de entorno necesarias (.env.local):**

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# SendGrid
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=notificaciones@reysil.com

# Google Drive
GOOGLE_DRIVE_SERVICE_ACCOUNT_KEY=base64-encoded-service-account-json
GOOGLE_DRIVE_FOLDER_REMITOS=folder-id
GOOGLE_DRIVE_FOLDER_INSPECCIONES=folder-id

# WhatsApp
NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER=5491100000000

# App
NEXT_PUBLIC_APP_URL=https://reysil.vercel.app
```

**Para levantar el proyecto:**

```bash
# Instalar dependencias
npm install

# Levantar Next.js
npm run dev
```
