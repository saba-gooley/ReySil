# ESTADO.md — Estado Actual del Proyecto

> Se actualiza automaticamente con /fin-sesion.
> Es lo primero que Claude lee para saber donde estamos.
> Ultima actualizacion: 2026-04-22 (cierre sesion 8 — password recovery bugfix)

---

## Estado General
✅ Proyecto completo — 8 de 8 modulos construidos y mergeados a main.

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

**Referencias:** ⬜ Pendiente · 🔄 En progreso · ✅ Completo · 🚫 Bloqueado

---

## Trabajo Completado en Esta Sesion (2026-04-22)
🔐 **Password Recovery Bug Fix - Autenticación**:

**Problema diagnosticado y resuelto:**
- [x] Error "otp_expired" en Vercel password recovery
- [x] Detectado: Supabase usando servicio de email built-in (sin configuración)
- [x] Configurado Google Workspace SMTP en Supabase Auth (App Password generada)
- [x] Modificado `/auth/callback` para detectar flujo de Supabase `/auth/v1/verify`
- [x] Incluido `type=recovery` en redirectUrl para mantener parámetro en redirección
- [x] Email ahora llega correctamente y redirige a `/restablecer-contrasena`

**Archivos modificados:**
- `app/auth/callback/route.ts` — agregar detección de sesión sin code para flujo recovery
- `app/(auth)/recuperar-contrasena/actions.ts` — incluir type=recovery en redirectUrl

**Commits:** 1d2979d, 51ae24b

**Flujo completo ahora funciona:**
- Usuario solicita password recovery en /recuperar-contrasena
- Email llega con link correcto (via Google Workspace SMTP)
- Click en link redirige a /restablecer-contrasena
- Usuario cambia contraseña exitosamente

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
**El proyecto está funcional. Todos los 8 módulos completos. Password recovery reparado.**

**Próxima sesión puede enfocarse en:**
- Testing completo del flujo de sesión 7 (comentarios operador, preasignaciones, KM reorganizado) si no fue validado aún
- Cualquier nueva funcionalidad o requerimiento del cliente
- Optimizaciones de performance o UX
- El sistema está listo para producción

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
- **PreassignedTripActions component**: UI con dos botones ("Modificar" y "Confirmar") para viajes PREASIGNADO. Permite cambiar chofer/patente/comentario sin cambiar estado, o confirmar a ASIGNADO. Mejor UX que un único dropdown con modos.
- **updatePreassignedTripAction**: nueva acción separada (en vez de reutilizar reassignTripAction) para actualizar preasignaciones. reassignTripAction chequea estado === ASIGNADO, no era viable para PREASIGNADO.
- **KM fields en shift_logs**: se movieron de trip_driver_data a shift_logs (km_50, km_100). Cambio arquitectonico: KM es por turno (jornada laboral), no por viaje individual. Turnos pueden tener múltiples viajes; el chofer reporta KM al final del turno, no al finalizar cada viaje.
- **Radio selector para KM tipo**: en shift-view, en lugar de dos campos (KM al 50%, KM al 100%), hay un selector radio + campo único. Mejor UX: el chofer elige el tipo de carga primero, luego ingresa el valor. El sistema guarda en el campo correspondiente (km_50 o km_100) automáticamente.

---

## Bloqueantes Activos
- **Ninguno** — todos los módulos funcionales. Password recovery completamente resuelto.

---

## Deuda Tecnica Anotada
- **Lockout per-usuario despues de 5 intentos fallidos** (HU-AUTH-001): no implementado en v1. Dependemos del rate limiting nativo de Supabase Auth (por IP). Trackear para iteracion futura.
- **Cache de rol en middleware**: `lib/supabase/middleware.ts` consulta `user_profiles` en cada request para obtener el rol. En produccion con mucho trafico podria ser un cuello de botella. Considerar cache en cookie para futuro.
- **`listUsers()` en updateClientAction**: para banear usuarios al remover emails, se llama a `admin.auth.admin.listUsers()` que trae TODOS los usuarios. Para pocos usuarios esta bien, pero con muchos hay que paginar o buscar por email directamente.
- **PDF de inspeccion se genera fire-and-forget**: si falla el upload a Drive, el campo `pdf_url` queda null. No hay retry. El chofer puede ver "Inspeccion completada" pero sin link al PDF.
- **Remito upload sin validacion de tamaño/tipo de archivo**: el form acepta `image/*` pero no hay limite de tamaño server-side. Considerar validar max ~10MB.
- **Service Worker para PWA offline**: el manifest.json esta configurado pero no hay service worker real. Para funcionamiento offline del chofer habria que implementar caching con Workbox.

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
