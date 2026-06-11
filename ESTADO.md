# ESTADO.md — Estado Actual del Proyecto

> Se actualiza automaticamente con /fin-sesion.
> Es lo primero que Claude lee para saber donde estamos.
> Ultima actualizacion: 2026-06-12 (sesion 21 — aprobados reqs 2.13 Codigo Viaje Secuencial, 2.14 Validacion Km cierre turno, 2.15 ABM Tipos de Camion)

---

## Estado General
✅ Proyecto funcional — 10 módulos completos. Sistema en producción. PR #36 mergeado. Sesión 21: aprobados via /nuevo-requerimiento los reqs 2.13 (Código de Viaje Secuencial — tipo A), 2.14 (Validación Km al cierre de turno — tipo D) y 2.15 (ABM Tipos de Camión — módulo 11 nuevo). Orden de construcción: 2.14 → 2.13 → 2.15, cada uno en rama feature + PR separado.

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
| 7 | Notificaciones | ✅ Completo | SMTP Ferozo (nodemailer): email al crear solicitud, asignar/reasignar chofer, cargar remito. Preferencias por cliente y ReySil. Await (no fire-and-forget). |
| 8 | Integraciones | ✅ Completo | Google Drive upload (remitos + PDF inspecciones), @react-pdf/renderer para PDF inspeccion. PR #8 mergeado |
| 9 | Gestión de Camiones y Disponibilidad | ✅ Completo | ABM camiones, tablero disponibilidad, selectlists con status, menu reorganizado, dialogs fijos |
| 10 | Panel Admin — ABM Operadores | ✅ Completo | Layout admin, ABM operadores (create/edit/deactivate/reactivate/reset password), acceso a panel operadores |
| 11 | ABM Tipos de Camion | ⬜ Pendiente | Req. 2.15 aprobado 2026-06-12. Tabla truck_types + ABM en Configuracion (escritura solo ADMIN) + forms Reparto cargan tipos desde BD |

**Referencias:** ⬜ Pendiente · 🔄 En progreso · ✅ Completo · 🚫 Bloqueado

---

## Trabajo en Esta Sesion (2026-06-12 — Sesion 21)

📋 **Scope change — 3 requerimientos nuevos aprobados via /nuevo-requerimiento**:

- [x] **2.13 — Código de Viaje Secuencial (tipo A)**: columna `trips.codigo` (`VJ-#####`, secuencia PostgreSQL + backfill histórico por created_at). Visible en app chofer, listados de solicitudes (primera columna), listado de remitos y filtros. Nombre de archivo de remito en Drive incorpora el código.
- [x] **2.14 — Validación Km al cierre de turno (tipo D)**: soft-check de km se muda de finalizar viaje individual (`trip-actions.ts`) a finalizar turno (`registerShiftEvent("fin_turno")` valida `shift_logs.km_50/km_100` con advertencia confirmable).
- [x] **2.15 — ABM Tipos de Camión (tipo B → Módulo 11)**: tabla `truck_types` con RLS (escritura solo ADMIN) + seed valores actuales, ABM en `/operador/configuracion/tipos-camion`, forms de Reparto (cliente, operador, grilla) cargan options desde BD.
- [x] PLAN.md actualizado (módulo 11, tabla truck_types, convención de nombre de remito)
- [x] `.claude/modules/tipos-camion.md` creado
- Orden de construcción: 2.14 → 2.13 → 2.15 (ramas + PRs separados)

---

## Trabajo Completado en Esta Sesion (2026-05-29 — Sesion 20)

🆕 **Feature — Duracion Paradas + edición inline**:

- [x] `supabase/migrations/0015_shift_stops_duracion.sql` — columna `duracion_min INTEGER` en `shift_stops`. **Aplicar manualmente en Supabase.**
- [x] `lib/validators/shift-stop.ts` — `duracion_min` en schema + `UpdateShiftStopSchema` (edición de parada existente)
- [x] `lib/server/chofer/shift-actions.ts` — `addShiftStopAction` acepta `duracion_min`; nuevo `updateShiftStopAction`
- [x] `lib/server/chofer/queries.ts` — tipo `ShiftStop` incluye `duracion_min`; select extendido
- [x] `components/chofer/shift-stops.tsx` (REWRITE) — motivo en blanco por defecto, campo duracion, edición inline por parada (editingId, editHora, editMotivo, editObs, editDuracion)
- [x] `components/chofer/shift-view.tsx` — fix visibilidad: sección Paradas siempre visible (mensaje guía cuando shift es null)
- [x] `lib/server/reports/shift-queries.ts` — `ShiftReportStop` incluye `duracion_min`; `duracion_paradas_min` calculado en map
- [x] `components/operador/shift-report-table.tsx` — columna "Dur. Paradas" con `formatDuracion(min)`
- [x] `components/operador/shift-detail-dialog.tsx` — muestra duración por parada en modal

🆕 **Feature — Reporte de Paradas**:

- [x] `lib/server/reports/stops-queries.ts` (NUEVO) — `listStopsReport(filters)`: query shift_logs JOIN drivers JOIN shift_stops, flatten a rows, filtros (fechaDesde, fechaHasta, driverId, motivo) aplicados en JS
- [x] `app/operador/reportes/paradas/page.tsx` (NUEVO) — página server, force-dynamic, filtros via searchParams
- [x] `components/operador/stops-report-filters.tsx` (NUEVO) — filtros: desde, hasta, chofer, tipo parada
- [x] `components/operador/stops-report-table.tsx` (NUEVO) — toggle desglosado/agrupado; sort por fecha/chofer/motivo; groupRows por driver+motivo suma duracion
- [x] `components/operador/operador-nav.tsx` — "Paradas" agregado a dropdown Reportes

🆕 **Feature — Llegada/Salida Depósito para viajes Contenedor + email notificación (PR #36)**:

- [x] `supabase/migrations/0016_salida_deposito_notifications.sql` — `enviar_salida_deposito BOOLEAN DEFAULT FALSE` en `client_notification_preferences` y `reysil_notification_emails`. **Aplicar manualmente en Supabase antes de deployar.**
- [x] `lib/validators/shift-assignment.ts` — `enviar_salida_deposito` en ambos schemas Zod
- [x] `lib/server/notifications/client-preferences-queries.ts` — nuevo campo en tipos; `getClientMailsForSalidaDeposito(clientId)`; `getReysilNotificationEmails` acepta `"salida_deposito"`
- [x] `lib/server/notifications/client-preferences-actions.ts` — ambos update actions incluyen `enviar_salida_deposito`
- [x] `lib/server/notifications/templates.ts` — `SalidaDepositoEmailData` + `salidaDepositoSubject` + `salidaDepositoHtml` con todos los datos del contenedor
- [x] `lib/server/notifications/notify-salida-deposito.ts` (NUEVO) — query trip con clients + containers + reservations, envía email, nunca lanza excepción
- [x] `lib/server/chofer/trip-actions.ts` — importa `notifySalidaDeposito`; trigger al registrar `SALIDA_DEPOSITO`
- [x] `components/chofer/trip-data-form.tsx` — split en `REPARTO_EVENTS` (2) y `CONTENEDOR_EVENTS` (4: Llegada Depósito, Salida Depósito, Llegada Cliente, Salida Cliente)
- [x] `components/operador/client-notification-preferences.tsx` — nuevo checkbox "Enviar al salir del depósito (Contenedor)"
- [x] `components/operador/reysil-notification-emails.tsx` — nuevo checkbox "Enviar copias al salir del depósito (Contenedor)"

---

## Trabajo Completado en Esta Sesion (2026-05-28 — Sesion 19)

🆕 **Feature — Paradas de Turno**:

- [x] `supabase/migrations/0014_shift_stops.sql` — tabla `shift_stops` (id, shift_id FK, hora TIMESTAMPTZ, motivo CHECK, observaciones). RLS: CHOFER ve/inserta/elimina las propias; OPERADOR/ADMIN leen todas. **Aplicar manualmente en Supabase.**
- [x] `lib/validators/shift-stop.ts` — `MOTIVOS_PARADA` enum + `AddShiftStopSchema` Zod
- [x] `lib/server/chofer/shift-actions.ts` — `addShiftStopAction` (construye ISO con offset -03:00) + `deleteShiftStopAction`
- [x] `lib/server/chofer/queries.ts` — `getTodayShift` incluye `shift_stops(id, hora, motivo, observaciones)`; nuevo tipo `ShiftStop`
- [x] `components/chofer/shift-stops.tsx` (NUEVO) — lista paradas con botón Eliminar + formulario inline: hora (default hora AR actual), motivo selector, observaciones condicional (solo "Otros")
- [x] `components/chofer/shift-view.tsx` — nueva sección "Paradas (N)" al final del turno
- [x] `lib/server/reports/shift-queries.ts` — `ShiftReportRow` incluye `paradas_count` y `paradas[]`; query extendida con `shift_stops`
- [x] `components/operador/shift-report-table.tsx` — columna Paradas muestra conteo real (antes "—")
- [x] `components/operador/shift-detail-dialog.tsx` — sección Paradas con hora AR + motivo + observaciones

---

## Trabajo Completado en Esta Sesion (2026-05-28 — Sesion 18)

🆕 **Feature — Reporte Control de Turno (Reportes > Turnos)**:

- [x] `lib/server/reports/shift-queries.ts` — `listShiftReport(filters)`: query a `shift_logs` JOIN `drivers`, filtros por rango de fechas, chofer y "llegada después de [hora]". El filtro de hora se aplica en JS comparando el timestamp en timezone AR (maneja correctamente el wrap-around de medianoche)
- [x] `lib/server/reports/shift-actions.ts` — `updateShiftTimeAction(shiftId, field, timeAR)`: reconstruye el timestamp conservando la fecha original del turno + nueva hora AR, guarda con offset `-03:00` para que PostgreSQL convierta a UTC
- [x] `app/operador/reportes/turnos/page.tsx` — página server con `force-dynamic`, filtra por searchParams, carga datos en paralelo
- [x] `components/operador/shift-report-filters.tsx` — filtros: rango de fechas, selector de chofer, input time "llegada después de". Actualiza URL con router.push
- [x] `components/operador/shift-report-table.tsx` — tabla con columnas requeridas. Paradas muestra "—" (pendiente futura funcionalidad). Click en fila abre detalle. Horas siempre en timezone AR
- [x] `components/operador/shift-detail-dialog.tsx` — modal con dos modos: vista (km_50, km_100, total km, pernoctado) y edición (inputs type="time" solo para hora). Botón "Editar" solo visible al abrir el dialog
- [x] `components/operador/operador-nav.tsx` — "Reportes" convertido de link directo a dropdown con tres items: "Viajes x Chofer", "Viajes x Cliente", "Turnos"

🆕 **Feature — Split reporte Viajes en dos reportes independientes**:

- [x] `app/operador/reportes/viajes-chofer/page.tsx` — página server para Viajes x Chofer
- [x] `app/operador/reportes/viajes-cliente/page.tsx` — página server para Viajes x Cliente
- [x] `components/operador/reporte-viajes-chofer-view.tsx` — mismos datos y filtros que el reporte original + selector de chofer (filtrado client-side instantáneo)
- [x] `components/operador/reporte-viajes-cliente-view.tsx` — ídem con selector de cliente
- La página original `/operador/reportes` se conserva sin cambios pero ya no aparece en el menú

**PR #33 mergeado a main.**

---

## Trabajo Completado en Esta Sesion (2026-05-23 — Sesion 17)

🐛 **3 bug fixes — Disponibilidad camiones, Carga peligrosa turno, Timezone Argentina**:

**A. Fix — Disponibilidad de camiones: todos aparecían como LIBRE (PR #30)**:
- [x] `supabase/migrations/0012_fix_truck_daily_status_join.sql` — `truck_daily_status` hacía el JOIN por `truck_id` (siempre NULL); cambiado a JOIN por `patente` (clave única del camión). Las acciones de asignación siempre guardaron `patente`, nunca `truck_id`.

**B. Feature — Campo Carga peligrosa en turno (PR #31)**:
- [x] `supabase/migrations/0013_add_carga_peligrosa_shift.sql` — columna `carga_peligrosa BOOLEAN DEFAULT FALSE` en `shift_logs`
- [x] `lib/server/chofer/shift-actions.ts` — `updateShiftData` acepta `carga_peligrosa`
- [x] `components/chofer/shift-view.tsx` — checkbox en sección "Datos del Turno" junto a Pernoctada

**C. Fix — Timezone Argentina en toda lógica de fechas server-side (PR #32)**:
- [x] `lib/utils/date.ts` — nuevo helper `todayAR()`: `new Date().toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" })`
- [x] `lib/server/chofer/shift-actions.ts`, `queries.ts`, `inspection-actions.ts`, `actions.ts`, `remito-actions.ts` — reemplazado `new Date().toISOString().split("T")[0]` por `todayAR()`
- [x] `app/operador/reportes/page.tsx`, `app/operador/toneladas/page.tsx` — ídem

---

## Trabajo Completado en Esta Sesion (2026-05-22 — Sesion 16)

🔧 **Performance PWA Chofer + Features + Bug fixes**:

**A. Performance — Inspección vehicular (PR #24):**
- [x] `components/chofer/inspection-view.tsx` — optimistic update en `InspectionItemRow`: botón verde al instante sin esperar round-trip
- [x] `lib/server/chofer/inspection-actions.ts` — eliminado `revalidatePath` redundante en `updateInspectionItemAction` (página es `force-dynamic`)

**B. Performance — Finalizar viaje (PR #25):**
- [x] `lib/server/chofer/trip-actions.ts` — queries de validación (`trip_assignments` + `trip_events`) y soft checks (km + remito) ahora corren en paralelo con `Promise.all`. Eliminado `revalidatePath("/chofer")` redundante.

**C. Feature — Viajes futuros y pasados EN_CURSO en PWA chofer (PR #26):**
- [x] `lib/server/chofer/queries.ts` — nueva función `listDriverTrips` reemplaza `listTodayTrips`. Trae viajes EN_CURSO (cualquier fecha), ASIGNADO (hoy y futuras), FINALIZADO (solo hoy)
- [x] `app/chofer/page.tsx` — usa `listDriverTrips`, título "Mis viajes"
- [x] `components/chofer/trip-list.tsx` — reorganizado en 3 secciones: "⚠ En curso" (pasados), "Hoy", "Próximos". Viajes futuros son solo lectura

**D. Fix — Email remito: agregar Mercadería y Orden (PR #27):**
- [x] `lib/server/notifications/notify-remito.ts` — query ampliada: `containers(numero, reservations(mercaderia, orden))`
- [x] `lib/server/notifications/templates.ts` — `RemitoEmailData` con `mercaderia?` y `orden?`, ambos en el HTML

**E. Fix — Timeout en upload de remito a Google Drive (PR #28):**
- [x] `lib/server/chofer/remito-actions.ts` — `Promise.race` con timeout de 25s. Si Drive no responde, el chofer ve mensaje claro en lugar del spinner infinito

**F. Fix — Disponibilidad: EN_CURSO aparecía como LIBRE (PR #29):**
- [x] `supabase/migrations/0011_fix_availability_en_curso.sql` — recrea `truck_daily_status` y `driver_daily_status` incluyendo `EN_CURSO` en el cálculo de ASIGNADO. Migración aplicada manualmente en Supabase.

---

## Trabajo Completado en Esta Sesion (2026-05-21 — Sesion 15)
🔧 **Módulo 7 — Notificaciones: preferencias remito + tipos camión + SMTP Ferozo**:

**A. Fix texto incorrecto en formulario de cliente:**
- [x] `components/operador/client-form.tsx` — eliminada frase "El email principal recibe las notificaciones" (era falsa; las notifs van a `client_notification_preferences`)

**B. Tipos de camión Balancín y Doble Piso (PR #22):**
- [x] `lib/validators/trip.ts` — enum Zod actualizado
- [x] `components/operador/operator-reparto-form.tsx` — nuevas options
- [x] `components/cliente/reparto-form.tsx` — nuevas options
- [x] `components/cliente/reparto-grid.tsx` — `TIPO_CAMION_OPTIONS` actualizado

**C. Alinear notify-remito con sistema de preferencias (PR #22):**
- [x] `supabase/migrations/0010_add_remito_notification_preference.sql` — agrega `enviar_al_cargar_remito` a `client_notification_preferences` y `enviar_remitos` a `reysil_notification_emails`
- [x] `lib/validators/shift-assignment.ts` — nuevos campos en schemas Zod
- [x] `lib/server/notifications/client-preferences-queries.ts` — nueva función `getClientMailsForRemito()`, `getReysilNotificationEmails` acepta `"remitos"`
- [x] `lib/server/notifications/client-preferences-actions.ts` — update actions pasan `enviar_al_cargar_remito` y `enviar_remitos`
- [x] `lib/server/notifications/notify-remito.ts` — reemplaza query directa a `client_emails` por preferencias + ReySil
- [x] `components/operador/client-notification-preferences.tsx` — nuevo checkbox "Enviar al cargar remito"
- [x] `components/operador/reysil-notification-emails.tsx` — nuevo checkbox "Enviar copias al cargar remito"

**D. Mejorar template email de remito (PR #23):**
- [x] `lib/server/notifications/templates.ts` — agrega `tipoSolicitud` y `numeroContenedor` (opcional, solo CONTENEDOR)
- [x] `lib/server/notifications/notify-remito.ts` — query ampliada para traer `tipo` y `containers ( numero )`

**E. SMTP migrado de Gmail a Ferozo:**
- [x] Variables SMTP actualizadas en Vercel y `.env.local`: `SMTP_HOST=fe000466.ferozo.com`, usuario `administracion@tfaster.com.ar`
- [ ] Pendiente: confirmar que mails llegan correctamente desde Ferozo en producción

---

## Trabajo Completado en Esta Sesion (2026-05-12 — Sesion 14)
🔧 **Mejora Módulo 3 — Generación de contraseña inicial de choferes**:

- [x] `lib/server/drivers/actions.ts` — reemplazado `generateTempPassword()` (random) por `generateDriverPassword(dni)`: los primeros 5 dígitos del DNI + las 3 primeras letras del mes en curso en español. Ejemplo: `22029ene`. Aplica tanto al alta de chofer (`createDriverAction`) como al reset de contraseña (`resetDriverPasswordAction`).

---

## Trabajo Completado en Esta Sesion (2026-05-05 — Sesion 13)
🐛 **Bug fixes de producción — Módulo 10 (Panel Admin)**:

**A. Middleware: ADMIN bloqueado de /operador/* (PR #16)**
- [x] `lib/supabase/middleware.ts` — agregado `EXTRA_ALLOWED: { ADMIN: ["/operador"] }` para que el middleware permita al admin acceder al panel de operadores sin ser redirigido a /admin

**B. TypeScript build error: `banned` no existe en tipo User (PR #17)**
- [x] `lib/server/operators/queries.ts` — reemplazado `authUser.banned` por `!!authUser.banned_until && new Date(authUser.banned_until) > new Date()` en `listOperators()` y `getOperatorById()`

**C. createOperatorAction violaba check constraint (PR #18)**
- [x] `lib/server/operators/actions.ts` — la acción ahora crea primero la fila en `operators` (nombre/apellido/email), luego auth user, luego `user_profiles` con `operator_id` correcto. Rollback completo en fallo.

**D. Link "← Panel Admin" en panel operadores (PR #19)**
- [x] `app/operador/layout.tsx` — link condicional visible solo cuando `user.profile.role === "ADMIN"`, en el header junto al email y botón Salir

---

## Trabajo Completado en Esta Sesion (2026-04-23 — Sesion 12)
🚀 **Módulo 10 + Nuevas features de operador**:

**A. Pantalla de inicio del operador (app/operador/page.tsx):**
- [x] Agregadas cards: "Nueva Solicitud", "Disponibilidad", "Camiones", "Configuración General"

**B. Operador carga solicitudes por cliente:**
- [x] `app/api/clients/deposits/route.ts` (NEW) — GET depósitos por client_id
- [x] `lib/server/trips/actions.ts` — nuevas acciones `createRepartoForClientAction`, `createContenedorForClientAction` (client_id explícito en payload, adminClient)
- [x] `components/operador/operator-reparto-form.tsx` (NEW) — mismo form que cliente + selector de cliente + depósitos dinámicos
- [x] `components/operador/operator-contenedor-form.tsx` (NEW) — ídem para contenedores
- [x] `app/operador/solicitudes/page.tsx` (NEW) — selector Reparto / Contenedor
- [x] `app/operador/solicitudes/reparto/page.tsx` (NEW)
- [x] `app/operador/solicitudes/contenedor/page.tsx` (NEW)
- [x] Nav operador: link "Nueva Solicitud" entre Inicio y Solicitudes dropdown

**C. Módulo 10 — Panel Admin + ABM Operadores:**
- [x] `app/admin/layout.tsx` (NEW) — layout ADMIN con nav Admin | Operadores | → Panel Operadores
- [x] `app/admin/page.tsx` — reemplaza placeholder con cards funcionales
- [x] `app/admin/operadores/page.tsx` (NEW) — lista activos/inactivos
- [x] `app/admin/operadores/nuevo/page.tsx` (NEW) — form crear operador
- [x] `app/admin/operadores/[id]/page.tsx` (NEW) — editar + reset password
- [x] `lib/server/operators/queries.ts` (NEW) — listOperators(), getOperatorById()
- [x] `lib/server/operators/actions.ts` (NEW) — create/update/deactivate/reactivate/resetPassword
- [x] `components/admin/operator-list.tsx` (NEW) — tabla activos/inactivos con acciones inline
- [x] `components/admin/operator-form.tsx` (NEW) — form crear/editar + ResetPasswordForm
- [x] `PLAN.md` — Módulo 10 agregado

---

## Trabajo Completado en Sesion 11 (2026-04-23 — UX Bug Fixes + Email SMTP)
🐛 **UX Bug Fixes + Email SMTP + Polish**:

**A. Dialogs Superpuestos — Solución definitiva:**
- [x] `components/operador/assign-trip-dialog.tsx` (NEW) — Dialog wrapper para el form de asignación
- [x] `components/operador/pendientes-view.tsx` — usa AssignTripDialog (botón abre modal)
- [x] `components/operador/preassigned-trip-actions.tsx` — refactored con AssignTripDialog
- [x] `components/operador/assigned-trip-actions.tsx` — refactored con AssignTripDialog
- [x] `components/ui/select.tsx` — agregado `SelectContentInline` (sin portal) para usar dentro de dialogs
- [x] `components/operador/driver-select-list.tsx` — usa SelectContentInline
- [x] `components/operador/truck-select-list.tsx` — usa SelectContentInline
- [x] `app/globals.css` — agregadas variables CSS de shadcn faltantes (`--popover`, `--muted`, etc.)
- [x] `components/ui/dialog.tsx` — `bg-white` explícito + overlay `bg-black/60` sólido

**B. Menu Navigation Fix completo:**
- [x] `components/operador/operador-nav.tsx` — reemplazado `<details>` HTML por `useState` controlado
- [x] Abrir un dropdown cierra los demás automáticamente
- [x] Click fuera cierra el dropdown abierto
- [x] Navegar a otra página cierra el dropdown
- [x] Nuevo orden: Inicio → Solicitudes → Disponibilidad → Toneladas → Reportes → Configuración → Documentación

**C. UX Minor Fixes:**
- [x] Eliminado estado duplicado en `DriverSelectList` y `TruckSelectList` (ya aparece badge en trigger)

**D. Email SMTP — Completamente funcional:**
- [x] `lib/server/notifications/send-email.ts` — reemplazado SendGrid por nodemailer SMTP Google
- [x] Variables requeridas: `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM_EMAIL`, `SMTP_FROM_NAME`
- [x] `lib/server/assignments/actions.ts` — `notifyAssignment()` es await (no fire-and-forget)
- [x] `lib/server/trips/actions.ts` — `notifyRepartoCreated/ContenedorCreated()` es await
- [x] `lib/server/notifications/templates.ts` — texto de email solicitud actualizado
- [x] `app/api/admin/notifications-diagnostics/route.ts` — muestra estado SMTP en diagnóstico
- [x] **Probado en producción: emails llegan correctamente**

---

## Trabajo Completado en Sesion 10 (2026-04-22)
🐛 **Critical Bug Fixes — Basado en feedback de usuario**:

**Completado:**

**A. Menu Navigation Fix (Critical #1):**
- [x] Fix menu dropdown logic en `operador-nav.tsx`
- [x] "Camiones" y "General" ya no se marcan activos simultáneamente
- [x] Implementado `isConfiguracionItemActive()` helper con lógica exacta para "General"
- Commit: `cbaed7b`

**B. Chofer Asignado Interface (Critical #3):**
- [x] Nuevo componente `assigned-trip-actions.tsx`
- [x] Añadido "Modificar" button que togglea el formulario de edición
- [x] Matches pattern de `preassigned-trip-actions.tsx` para UX consistente
- [x] Actualizado `asignado-view.tsx` para usar nuevo componente
- Commit: `af711a0`

**C. Driver Password Management (Critical #7, #8):**
- [x] `resetDriverPasswordAction()` en `lib/server/drivers/actions.ts` — permite a operadores resetear contraseñas
- [x] `changePasswordAction()` en `lib/server/auth/change-password.ts` — permite a drivers cambiar su propia contraseña (futuro)
- [x] `PasswordResetSection` component en `driver-form.tsx` para edit mode
- [x] Muestra nuevas credenciales después de reset (una sola vez, no envía email)
- Commit: `7c3f72d`

**D. Email Notification Diagnostics:**
- [x] `/api/admin/notifications-diagnostics` endpoint — inspecciona configuración de sendgrid y tablas de preferencias
- [x] Ayuda a debuggear why emails no se envían (falta de SENDGRID_API_KEY, o tablas vacías)
- Commit: `a502cae`

**E. Dialog Z-Index & Overlay Fixes (Critical #2):**
- [x] SelectContent z-index: z-50 → z-[10000] en `components/ui/select.tsx`
  - Asegura que dropdowns (TruckSelectList, DriverSelectList) aparezcan siempre arriba de dialogs
  - Evita que Select menus queden escondidos detrás de dialog overlays
- [x] DialogOverlay opacity: bg-black/10 → bg-black/40 en `components/ui/dialog.tsx`
  - Oscurece más el fondo para mejor contraste visual
  - Reduce confusión cuando hay elementos superpuestos
- Commits: `372ce92`, `dae457a`

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

**Status actual:** 10 módulos completos. Sistema estable. PR #36 en revisión (Llegada/Salida Depósito Contenedor + email notificación).

### Pendiente 0 — Timezone en display (baja prioridad)
**Descripción:** Los `toLocaleTimeString` / `toLocaleDateString` en componentes no especifican `timeZone` explícito. Si el browser no está en Argentina, muestra la hora local del usuario en lugar de la hora argentina.
**Acción:** Agregar `timeZone: "America/Argentina/Buenos_Aires"` en todos los displays de hora/fecha. Hacer cuando haya otros cambios en esos componentes.

### Pendiente 1 — Real-Time Updates
**Descripción:** Datos no se actualizan automáticamente cuando cambia el estado del viaje.
- `components/operador/asignado-view.tsx` — no refresca cuando el chofer inicia viaje
- `app/chofer/turno/page.tsx` — no refresca cuando el operador reasigna
**Arquitectura para implementar:**
- En `asignado-view.tsx`: agregar `useEffect` con cliente Supabase browser:
  `supabase.channel('trips').on('postgres_changes', { event: '*', schema: 'public', table: 'trips' }, () => router.refresh()).subscribe()`
- Mismo patrón en `app/chofer/turno/page.tsx`
- Cliente browser: `createBrowserClient` de `@supabase/ssr`
**Alternativa rápida:** Botón "Actualizar" manual (30 minutos de trabajo)

### Pendiente 2 — Cambiar contraseña en panel chofer
**Descripción:** `changePasswordAction` existe en `lib/server/auth/change-password.ts` pero no hay UI.
**Acción:** Agregar sección en `app/chofer/turno/page.tsx` o crear `app/chofer/perfil/page.tsx`.

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
- **Notificaciones await (no fire-and-forget)**: en Vercel serverless, fire-and-forget cancela la conexión SMTP antes de completar. Se cambió a await en todas las acciones. Agrega ~1-2s de latencia en confirmación pero garantiza entrega.
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
- **Ninguno**

---

## Deuda Tecnica Anotada
- **Lockout per-usuario despues de 5 intentos fallidos** (HU-AUTH-001): no implementado en v1. Dependemos del rate limiting nativo de Supabase Auth (por IP).
- **Cache de rol en middleware**: `lib/supabase/middleware.ts` consulta `user_profiles` en cada request. En producción con mucho tráfico, considerar cache en cookie.
- **`listUsers()` en updateClientAction**: trae TODOS los usuarios. Con muchos usuarios, paginar o buscar por email.
- **PDF de inspección fire-and-forget**: si falla upload a Drive, no hay retry.
- **Remito upload sin validación de tamaño**: considerar validar max ~10MB server-side.
- **Service Worker para PWA offline**: manifest.json configurado pero sin service worker real.
- **Module 9 testing antes de merge**: migration 0009 debe ejecutarse en Supabase. Selectlists deben validar carga de status correctamente. Tablero de disponibilidad debe ser actualizado en tiempo real si se asigna un viaje.
- **Real-time updates missing (#9, #10):** Chofer Asignado y panel chofer no auto-refrescan cuando cambia estado. Requiere Supabase Realtime subscriptions en `asignado-view.tsx` y `app/chofer/turno`.
- **Timezone en display:** `toLocaleTimeString` sin `timeZone` explícito en componentes cliente. Usuarios fuera de Argentina ven hora local. Fix: agregar `timeZone: "America/Argentina/Buenos_Aires"` en todos los displays de hora/fecha.
- **Cambiar contraseña chofer:** `changePasswordAction` existe en `lib/server/auth/change-password.ts` pero no hay UI en el panel chofer para usarla.

---

## Entorno y Configuracion

**Variables de entorno necesarias (.env.local):**

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# SMTP (Ferozo)
SMTP_HOST=fe000466.ferozo.com
SMTP_PORT=587
SMTP_USER=administracion@tfaster.com.ar
SMTP_PASS=...
SMTP_FROM_EMAIL=administracion@tfaster.com.ar
SMTP_FROM_NAME=Transportes ReySil

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
