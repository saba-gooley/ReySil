# ESTADO.md — Estado Actual del Proyecto

> Se actualiza automaticamente con /fin-sesion.
> Es lo primero que Claude lee para saber donde estamos.
> Ultima actualizacion: 2026-04-09 (cierre sesion 2 — Modulo 1 completo + CLAUDE.md optimizado)

---

## Estado General
🔄 En construccion — Modulo 1 de 8 completo. Listo para arrancar Modulo 2 (Autenticacion).

---

## Modulos

| # | Modulo | Estado | Notas |
|---|--------|--------|-------|
| 1 | Setup e Infraestructura | ✅ Completo | Next.js 14.2.35 scaffoldeado, dependencias instaladas, schema SQL inicial escrito (17 tablas + RLS), middleware Supabase, PWA manifest, deploy Vercel funcionando |
| 2 | Autenticacion | ⬜ Pendiente | Supabase Auth, middleware de roles, recuperacion de contrasena, RLS policies para las 17 tablas |
| 3 | Administracion | ⬜ Pendiente | ABM clientes y choferes (con creacion automatica de usuarios en Supabase Auth) |
| 4 | Portal Cliente | ⬜ Pendiente | Solicitudes, seguimiento (realtime), historial |
| 5 | Panel Operadores | ⬜ Pendiente | Vistas con realtime, asignacion, remitos, reportes |
| 6 | PWA Chofer | ⬜ Pendiente | Rutas /chofer/* mobile-first con Service Worker |
| 7 | Notificaciones | ⬜ Pendiente | Emails automaticos via SendGrid |
| 8 | Integraciones | ⬜ Pendiente | Google Drive + @react-pdf/renderer |

**Referencias:** ⬜ Pendiente · 🔄 En progreso · ✅ Completo · 🚫 Bloqueado

---

## Modulo Actual en Progreso
Ninguno — Modulo 1 cerrado en sesion 2. La sesion 2 ejecuto el setup completo (Next.js + Supabase + Vercel) y termino optimizando `CLAUDE.md` para reducir tokens.

**Archivos creados/modificados en sesion 2:**
- `package.json` (Next.js 14.2.35, deps core: @supabase/supabase-js, @supabase/ssr, zod, zustand, @tanstack/react-query, @react-pdf/renderer, googleapis, @sendgrid/mail)
- `next.config.js`, `tsconfig.json`, `postcss.config.js`, `tailwind.config.ts` (con paleta `reysil` red+white)
- `app/layout.tsx`, `app/page.tsx`, `app/globals.css`
- `lib/supabase/client.ts` (createBrowserClient)
- `lib/supabase/server.ts` (createServerClient + createAdminClient)
- `lib/supabase/middleware.ts` (updateSession con cookies)
- `middleware.ts` raiz (import RELATIVO, no `@/...`, con matcher excluyendo assets PWA)
- `public/manifest.json` (PWA basico, theme color reysil-red)
- `supabase/migrations/0001_initial_schema.sql` (17 tablas + ENUMs + RLS activado en todas + triggers updated_at + Realtime publication para trips/trip_events/trip_assignments)
- `docs/branding.md` (paleta completa, decisiones UX de los mockups, items pendientes con cliente)
- `.gitignore` (Next, env, .vercel, .claude/)
- `.env.local.example`
- `CLAUDE.md` (optimizado: 67→33 lineas, 3.8KB→2KB)

---

## Proximo Paso Exacto
Iniciar **Modulo 2 — Autenticacion** (HU-AUTH-001 + HU-AUTH-002, 5 puntos historicos). Secuencia:

1. Crear rama `feature/autenticacion` desde `main`. **A partir de este modulo volver a flujo PR** (en sesion 2 hubo push directo a main por el setup, no se repite).
2. Aplicar la migracion `supabase/migrations/0001_initial_schema.sql` en el proyecto Supabase si todavia no se corrio (verificar primero con `select count(*) from user_profiles;` desde el SQL editor del dashboard).
3. Escribir `supabase/migrations/0002_auth_rls_policies.sql` con las RLS policies para las 17 tablas, una por rol (cliente, operador, chofer, administrador). Usar las decisiones de `docs/arquitectura.md` seccion "Seguridad y RLS".
4. Crear `app/(auth)/login/page.tsx` — formulario de email + password con `signInWithPassword` de Supabase. Validar inputs con un schema Zod nuevo en `lib/validators/auth.ts` (`LoginSchema`).
5. Crear `app/(auth)/recuperar-contrasena/page.tsx` — formulario de email con `resetPasswordForEmail` de Supabase. Schema Zod `RecoverPasswordSchema`.
6. Actualizar `lib/supabase/middleware.ts` (`updateSession`) para que despues de refrescar la sesion lea `user_profiles.role` y redirija segun rol: cliente→`/cliente`, operador→`/operador`, chofer→`/chofer`, administrador→`/admin`. Las unicas rutas publicas son `/login` y `/recuperar-contrasena`.
7. Crear `lib/server/auth/get-current-user.ts` — funcion server-side que retorna `{ user, profile }` o redirige a `/login`. Reutilizable desde Server Actions y Server Components.
8. Trigger SQL en migracion 0002: cuando se inserta una fila en `auth.users`, crear automaticamente la fila correspondiente en `public.user_profiles` con role inicial `cliente` (puede cambiarse despues por un operador via ABM en Modulo 3).
9. Probar el flujo end-to-end con un usuario de prueba creado a mano desde el SQL editor de Supabase.
10. Commit por etapa, push a rama, abrir PR a `main`, mergear cuando funcione.

**Decisiones previas que afectan este modulo:**
- Auth = Supabase Auth (no Passport, no JWT manual). Decision documentada en `PLAN.md` y `docs/arquitectura.md`.
- RBAC en dos capas: middleware Next.js + RLS Supabase. Las dos son obligatorias.
- Mutaciones SOLO via Server Actions. Nada de cliente Supabase desde componentes client.
- Validaciones Zod compartidas client/server.

---

## Decisiones Tomadas Durante la Construccion
- **Imports en `middleware.ts` raiz: usar paths relativos (`./lib/...`)**, NO el alias `@/...`. El bundler Edge de Vercel no resuelve siempre los path aliases en imports del middleware raiz, y eso rompia el deploy.
- **Vercel Framework Preset = "Next.js"** (no "Other", que es el default). Vercel a veces detecta el proyecto como "Other" al importarlo y eso rompe el bundling Edge del middleware (`__dirname is not defined`). Documentado tambien en memoria persistente para futuras sesiones.
- **`CLAUDE.md` optimizado**: removidas las secciones que duplicaban `PLAN.md`, `docs/arquitectura.md` y `docs/funcional.md` (descripcion del proyecto, stack detallado, descripcion de roles, lista de slash commands). Resultado: ~49% menos tokens en cada turno sin perder ninguna regla critica.

---

## Bloqueantes Activos
Ninguno.

---

## Deuda Tecnica Anotada
- **Push directo a `main` durante el setup del Modulo 1** — viola la regla inamovible "siempre rama + PR". Justificado solo porque era setup inicial sin usuarios afectados. **A partir del Modulo 2 vuelve el flujo PR estricto.**
- **RLS policies pendientes para las 17 tablas**. La migracion `0001_initial_schema.sql` activa RLS en todas pero no define policies todavia. Eso queda como tarea explicita del Modulo 2 (paso 3 del proximo paso exacto).
- **Verificar si la migracion `0001_initial_schema.sql` ya se aplico en el proyecto Supabase**. En sesion 2 se escribio el SQL pero no quedo confirmado si se ejecuto contra la base remota. Validar antes de empezar el Modulo 2.

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
