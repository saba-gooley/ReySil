# ESTADO.md — Estado Actual del Proyecto

> Se actualiza automaticamente con /fin-sesion.
> Es lo primero que Claude lee para saber donde estamos.
> Ultima actualizacion: 2026-04-09 (cierre sesion 1)

---

## Estado General
⬜ Sin iniciar — esperando aprobacion del PLAN.md (rev. 2 — Next.js + Supabase)

---

## Modulos

| # | Modulo | Estado | Notas |
|---|--------|--------|-------|
| 1 | Setup e Infraestructura | ⬜ Pendiente | Scaffolding Next.js, proyecto Supabase, schema SQL inicial, RLS base, PWA manifest |
| 2 | Autenticacion | ⬜ Pendiente | Supabase Auth, middleware de roles, recuperacion de contrasena |
| 3 | Administracion | ⬜ Pendiente | ABM clientes y choferes (con creacion automatica de usuarios en Supabase Auth) |
| 4 | Portal Cliente | ⬜ Pendiente | Solicitudes, seguimiento (realtime), historial |
| 5 | Panel Operadores | ⬜ Pendiente | Vistas con realtime, asignacion, remitos, reportes |
| 6 | PWA Chofer | ⬜ Pendiente | Rutas /chofer/* mobile-first con Service Worker |
| 7 | Notificaciones | ⬜ Pendiente | Emails automaticos via SendGrid |
| 8 | Integraciones | ⬜ Pendiente | Google Drive + @react-pdf/renderer |

**Referencias:** ⬜ Pendiente · 🔄 En progreso · ✅ Completo · 🚫 Bloqueado

---

## Modulo Actual en Progreso
Ninguno — proyecto sin iniciar. Toda la sesion 1 fue de planificacion: generacion de archivos de gestion, conversion de docs Word a Markdown, evaluacion de stack y simplificacion arquitectonica.

---

## Proximo Paso Exacto
Esperar aprobacion del usuario ("aprobado") sobre `PLAN.md` (rev. 2 — Next.js + Supabase + @react-pdf/renderer). Una vez aprobado, arrancar el **Modulo 1 — Setup e Infraestructura** con esta secuencia exacta:

1. Crear rama `feature/setup-infraestructura` desde `main`.
2. Inicializar proyecto Next.js 14 con TypeScript y App Router (`npx create-next-app@latest . --typescript --app --tailwind --eslint`).
3. Instalar dependencias core: `@supabase/supabase-js`, `@supabase/ssr`, `zod`, `zustand`, `@tanstack/react-query`, `@react-pdf/renderer`, `googleapis`, `@sendgrid/mail`.
4. Crear proyecto en Supabase (manual desde dashboard) y obtener URL + anon key + service role key.
5. Configurar `.env.local` con todas las variables documentadas mas abajo en este mismo archivo.
6. Crear estructura de carpetas segun PLAN.md seccion "Estructura de Carpetas" (`app/`, `lib/server/{dominio}/`, `lib/supabase/`, `lib/validators/`, `supabase/migrations/`, `store/`).
7. Crear `lib/supabase/client.ts`, `lib/supabase/server.ts` y `lib/supabase/middleware.ts` siguiendo el patron oficial de `@supabase/ssr`.
8. Escribir primera migracion `supabase/migrations/0001_initial_schema.sql` con las 16 tablas listadas en PLAN.md y RLS activado en TODAS (sin policies todavia, eso queda para Modulo 2).
9. Crear `middleware.ts` en raiz que lea la sesion de Supabase y deje pasar todo (las redirecciones por rol vienen en Modulo 2).
10. Crear `public/manifest.json` con configuracion PWA basica (theme, icons, display: standalone).
11. Configurar Vercel: conectar repo, definir variables de entorno, deploy preview.
12. Commit + PR a `main` con el setup base.

**Importante**: NO iniciar Modulo 2 (Auth) hasta que el setup este desplegado en Vercel y el schema corra limpio en Supabase.

---

## Decisiones Tomadas Durante la Construccion
Ninguna aun durante construccion. Todas las decisiones de arquitectura tomadas en sesion 1 estan documentadas en `PLAN.md` seccion "Decisiones de Arquitectura" y en `docs/arquitectura.md` (rev. 1.2).

---

## Bloqueantes Activos
Ninguno.

---

## Deuda Tecnica Anotada
Ninguna.

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
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Para levantar el proyecto:**

```bash
# Instalar dependencias
npm install

# Levantar Supabase local (opcional, requiere Docker)
npx supabase start

# Aplicar migraciones
npx supabase db reset

# Levantar Next.js
npm run dev
```
