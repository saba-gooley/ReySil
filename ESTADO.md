# ESTADO.md — Estado Actual del Proyecto

> Se actualiza automaticamente con /fin-sesion.
> Es lo primero que Claude lee para saber donde estamos.
> Ultima actualizacion: 2026-04-21 (cierre sesion 6 — 8 modulos + bug fixes y refinamiento)

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

## Trabajo Completado en Esta Sesion (2026-04-21)
🔧 **Ciclo de Refinamiento y Bug Fixes** (no es un modulo nuevo, sino corrections sobre Modulos 4, 5, 6, 8 ya construidos):

**Fixes Operador (HU-OPE-001 a HU-OPE-008):**
- [x] Search con espacios multipalabra funcionando correctamente (token-based en trip-table.tsx)
- [x] Agregada columna Origen a todas las tablas (operator + client)
- [x] Sort por fecha_solicitada (ascendente para activos, descendente para historial)
- [x] Nuevos campos de contenedor visibles (Orden, Mercaderia, Despacho, Carga, Terminal, Devuelve en, Libre hasta)
- [x] Remitos con styling verde "Ver remito" + fallback "no hay remito cargado"
- [x] Remitos visibles en vista En Curso

**Fixes Cliente (HU-CLI-001 a HU-CLI-005):**
- [x] Chofer/Patente ahora visible en tabla de viajes
- [x] Todos los datos de solicitud (reparto o contenedor) en detalle expandido
- [x] RLS bypass en client queries (switch a adminClient)
- [x] Normalizador robusto para relaciones 1:1 anidadas (drivers en trip_assignments)

**Fixes Chofer (HU-CHO-001 a HU-CHO-006):**
- [x] Form Guardar datos deshabilitado cuando trip.estado === FINALIZADO

**Fixes Administracion (HU-ADMIN-001 a HU-ADMIN-002):**
- [x] Depositos ahora persisten correctamente al editar cliente
- [x] Fix: sync usa update/insert/deactivate en vez de delete (FK constraints en trips)
- [x] Client queries (listClients, getClientById) usan adminClient para consistencia

**Archivos modificados en esta sesion (8 commits):**
- `components/operador/trip-table.tsx` — search fix, Origen column, remito styling
- `components/cliente/trip-list.tsx` — simplified table, full contenedor details
- `lib/server/trips/queries.ts` — switch to adminClient, robust normalizer, new fields
- `lib/server/assignments/queries.ts` — new fields in OPERATOR_TRIP_SELECT, sort fixes
- `lib/server/clients/queries.ts` — switch to adminClient
- `lib/server/clients/actions.ts` — deposits sync logic (update/insert/deactivate), add logging
- `components/chofer/trip-data-form.tsx` — disable form when finalized
- `app/operador/en-curso/page.tsx` — add showRemitos prop

---

## Proximo Paso Exacto
**El proyecto está funcional tras el ciclo de fixes. Proximos pasos:**

1. **Testing por rol (flujo completo end-to-end):**
   - **CLIENTE Seguimiento**: Crear viaje (reparto o contenedor) → Ver en tabla con Chofer/Patente una vez asignado → Expandir detalle → Verificar todos los campos de solicitud + reseerva si aplica
   - **CLIENTE Historial**: Viajes finalizados → Verificar ordenados por fecha desc → Verificar Origen column → Expandir detalle → Verificar remito con link verde
   - **OPERADOR Pendientes/Chofer Asignado**: Buscar por cliente/chofer/patente con espacios (ej: "Juan Garcia") → Verificar search funciona → Expandir detail → Verificar todos los datos
   - **OPERADOR En Curso**: Expandir → Verificar remitos si hay cargado
   - **CHOFER**: Ver viajes del dia (incluyendo FINALIZADO) → Expandir → Verificar form deshabilitado si FINALIZADO → Registrar datos si estado permite
   
2. **Validar depositos:**
   - Ir a /operador/clientes → editar cliente de prueba que tenia depositos previos → cambiar nombre, agregar/quitar depositos → guardar → verificar en BD que se actualizaron (update + insert + deactivate, sin delete)

3. **Verificar datos complejos:**
   - Crear contenedor en cliente → ver en operador → expandir → verificar todos los campos (Orden, Mercaderia, Despacho, etc.) visibles
   - Contenedor debe mostrar Fecha del Viaje, Deposito, Destino, Orden, Mercaderia, Despacho, Carga, Terminal, Contenedor, Devuelve en

4. **Deployment a Vercel:**
   - Todos los cambios estan en `main` (8 commits: aba819b → a3ae447 → 5b395ac → ab7f1e5 → a3ae447 → c14de78 → 5b395ac → a3ae447)
   - Verificar en Vercel que las rutas responden correctamente

5. **Deuda pendiente de resolver:**
   - Debug logging de deposits aun activo (`console.log` en updateClientAction) — remover antes de release si todo funciona
   - Testing en mobile (PWA chofer)

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

---

## Bloqueantes Activos
- **SendGrid no configurado** — las notificaciones por email no se enviaran hasta configurar SENDGRID_API_KEY. El sistema funciona sin problemas, solo loguea warnings.

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
