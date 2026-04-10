# ESTADO.md — Estado Actual del Proyecto

> Se actualiza automaticamente con /fin-sesion.
> Es lo primero que Claude lee para saber donde estamos.
> Ultima actualizacion: 2026-04-10 (cierre sesion 3 — Modulos 2 y 3 completos)

---

## Estado General
🔄 En construccion — Modulos 1, 2 y 3 de 8 completos. Listo para arrancar Modulo 4 (Portal Cliente).

---

## Modulos

| # | Modulo | Estado | Notas |
|---|--------|--------|-------|
| 1 | Setup e Infraestructura | ✅ Completo | Next.js 14.2.35, schema SQL 17 tablas, middleware Supabase, PWA manifest, deploy Vercel |
| 2 | Autenticacion | ✅ Completo | Login, recuperar/restablecer contrasena, middleware RBAC, RLS policies 17 tablas, helpers getCurrentUser/requireRole |
| 3 | Administracion | ✅ Completo | ABM clientes (con emails y depositos) y ABM choferes (con generacion de credenciales). Panel operadores con layout y nav |
| 4 | Portal Cliente | ⬜ Pendiente | Solicitudes, seguimiento (realtime), historial |
| 5 | Panel Operadores | ⬜ Pendiente | Vistas con realtime, asignacion, remitos, reportes |
| 6 | PWA Chofer | ⬜ Pendiente | Rutas /chofer/* mobile-first con Service Worker |
| 7 | Notificaciones | ⬜ Pendiente | Emails automaticos via SendGrid |
| 8 | Integraciones | ⬜ Pendiente | Google Drive + @react-pdf/renderer |

**Referencias:** ⬜ Pendiente · 🔄 En progreso · ✅ Completo · 🚫 Bloqueado

---

## Modulo Actual en Progreso
Ninguno — Modulo 3 cerrado en sesion 3.

**Archivos creados/modificados en sesion 3 (Modulo 2 + Modulo 3):**

Modulo 2 (mergeado PR #1):
- `supabase/migrations/0002_auth_rls_policies.sql` (602 lineas, ~50 RLS policies, 4 helpers SECURITY DEFINER)
- `lib/validators/auth.ts` (LoginSchema, RecoverPasswordSchema, ResetPasswordSchema)
- `lib/server/auth/get-current-user.ts` (getCurrentUser, tryGetCurrentUser, requireRole, homePathForRole)
- `lib/supabase/middleware.ts` (extendido con RBAC: PUBLIC_PATHS, NEUTRAL_PATHS, ROLE_PREFIX)
- `app/(auth)/login/` (page, actions, login-form)
- `app/(auth)/recuperar-contrasena/` (page, actions, recover-form)
- `app/(auth)/restablecer-contrasena/` (page, actions, reset-form)
- `app/auth/callback/route.ts` (exchange code for session)
- `app/sign-out/route.ts` (POST + GET)
- `app/cliente/page.tsx`, `app/operador/page.tsx`, `app/chofer/page.tsx`, `app/admin/page.tsx` (placeholders con requireRole)
- `components/role-placeholder.tsx`

Modulo 3 (mergeado PR #2):
- `lib/validators/client.ts` (CreateClientSchema, UpdateClientSchema)
- `lib/validators/driver.ts` (CreateDriverSchema, UpdateDriverSchema)
- `lib/server/clients/queries.ts` (listClients, getClientById)
- `lib/server/clients/actions.ts` (createClientAction, updateClientAction, toggleClientAction)
- `lib/server/drivers/queries.ts` (listDrivers, getDriverById)
- `lib/server/drivers/actions.ts` (createDriverAction, updateDriverAction, toggleDriverAction)
- `app/operador/layout.tsx` (layout compartido con requireRole + nav)
- `app/operador/page.tsx` (reemplazado placeholder por indice de modulos)
- `app/operador/clientes/page.tsx`, `app/operador/clientes/nuevo/page.tsx`, `app/operador/clientes/[id]/page.tsx`
- `app/operador/choferes/page.tsx`, `app/operador/choferes/nuevo/page.tsx`, `app/operador/choferes/[id]/page.tsx`
- `components/operador/operador-nav.tsx`, `components/operador/client-table.tsx`, `components/operador/client-form.tsx`
- `components/operador/driver-table.tsx`, `components/operador/driver-form.tsx`

---

## Proximo Paso Exacto
Iniciar **Modulo 4 — Portal Cliente** (HU-CLI-001 a HU-CLI-005, 23 puntos historicos). Secuencia:

1. Crear rama `feature/portal-cliente` desde `main`.
2. Leer `docs/historias.md` secciones HU-CLI-001 a HU-CLI-005 para entender el alcance completo.
3. Crear layout compartido para `/cliente/*` similar al de `/operador/*` (header + nav + requireRole("CLIENTE")).
4. **HU-CLI-001 — Solicitud de Reparto**: formulario en `app/cliente/solicitudes/reparto/page.tsx` con los campos definidos en `trip_reparto_fields` (NDV, PAL, CAT, etc.). Server Action en `lib/server/trips/actions.ts` que inserta en `trips` (tipo REPARTO) + `trip_reparto_fields`. Schema Zod en `lib/validators/trip.ts`.
5. **HU-CLI-002 — Carga masiva de repartos**: grilla tipo planilla con TanStack Table o similar. Evaluar complejidad.
6. **HU-CLI-003 — Solicitud de Contenedor**: formulario que crea `reservations` + `containers` + `trips` (tipo CONTENEDOR). Schema Zod `ReservationSchema`.
7. **HU-CLI-004 — Seguimiento de viajes**: vista con Supabase Realtime suscripta a cambios en `trips` y `trip_events` filtrado por `client_id`.
8. **HU-CLI-005 — Historial**: listado paginado de viajes finalizados/cancelados.

**Decisiones previas que afectan este modulo:**
- El `client_id` del usuario logueado se obtiene de `getCurrentUser().profile.client_id`. Todas las queries del portal cliente filtran por este `client_id`.
- Los depositos preestablecidos del cliente (creados en ABM del Modulo 3) aparecen como opciones en los selectores de origen/destino.
- Los campos de reparto que son configurables por cliente se modelan como `metadata` JSONB en `trip_reparto_fields` (decision de `PLAN.md`).
- Realtime usa `supabase.channel()` suscripto a `trips` y `trip_events` — ya tiene publication habilitada en la migracion 0001.
- Items pendientes de confirmar con cliente: obligatoriedad de campos Reparto (item 1), campos Contenedor (item 2), definicion de NDV/PAL/CAT/Nro UN (item 6). Construir con defaults razonables (campos opcionales).

---

## Decisiones Tomadas Durante la Construccion
- **Imports en `middleware.ts` raiz: usar paths relativos (`./lib/...`)**, NO el alias `@/...`. El bundler Edge de Vercel no resuelve siempre los path aliases en imports del middleware raiz, y eso rompia el deploy.
- **Vercel Framework Preset = "Next.js"** (no "Other", que es el default). Vercel a veces detecta el proyecto como "Other" al importarlo y eso rompe el bundling Edge del middleware (`__dirname is not defined`).
- **`CLAUDE.md` optimizado**: removidas las secciones que duplicaban `PLAN.md`, `docs/arquitectura.md` y `docs/funcional.md`. Resultado: ~49% menos tokens.
- **Trigger auth.users → user_profiles eliminado**: no es viable porque el CHECK constraint en `user_profiles` requiere `client_id IS NOT NULL` para rol CLIENTE, y un trigger no puede saber a que cliente vincular. Los usuarios se crean atomicamente desde las Server Actions del ABM (Modulo 3) usando Service Role key.
- **NEUTRAL_PATHS en middleware**: `/restablecer-contrasena` no es publica ni protegida — el usuario llega con una sesion temporal de recovery y no debe ser redirigido a su home antes de cambiar el password.
- **Credenciales de chofer con email sintetico**: formato `chofer.<dni>@reysil.app`. Supabase Auth requiere email como identificador; este formato es facil de recordar para el chofer (su propio DNI). No se envia email real — solo sirve como username.
- **Baja logica con ban de auth.users**: al desactivar un cliente/chofer, se banea a los usuarios auth asociados (`ban_duration: "876600h"` = ~100 anos). Al reactivar, se desbanea (`ban_duration: "none"`).

---

## Bloqueantes Activos
Ninguno.

---

## Deuda Tecnica Anotada
- **Lockout per-usuario despues de 5 intentos fallidos** (HU-AUTH-001): no implementado en v1. Dependemos del rate limiting nativo de Supabase Auth (por IP). Trackear para iteracion futura.
- **Cache de rol en middleware**: `lib/supabase/middleware.ts` consulta `user_profiles` en cada request para obtener el rol. En produccion con mucho trafico podria ser un cuello de botella. Considerar cache en cookie para futuro.
- **`listUsers()` en updateClientAction**: para banear usuarios al remover emails, se llama a `admin.auth.admin.listUsers()` que trae TODOS los usuarios. Para pocos usuarios esta bien, pero con muchos hay que paginar o buscar por email directamente.

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
