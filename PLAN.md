# PLAN.md — Arquitectura y Plan de Construccion

> Este archivo se genera UNA VEZ al inicio del proyecto.
> Para modificarlo usar /nuevo-requerimiento.
> Ultima actualizacion: 2026-04-09 (rev. 2 — simplificacion a Next.js + Supabase)

---

## Resumen del Proyecto

Sistema de gestion de viajes para Transportes ReySil. Permite a los clientes solicitar viajes de transporte (tipo Reparto o Contenedor) desde un portal web, a los operadores de ReySil gestionar y asignar choferes desde un panel de back office, y a los choferes ejecutar los viajes desde una PWA mobile-first registrando hitos, fotos de remitos e inspecciones de vehiculos. El sistema automatiza notificaciones por email al cliente en momentos clave (asignacion de chofer y confirmacion de entrega). Toda la solucion se implementa en un unico proyecto Next.js con Supabase como backend gestionado.

## Arquitectura General

### Stack Tecnologico
- **Aplicacion completa**: Next.js 14 + TypeScript (App Router con Server Actions y Route Handlers)
  - Portal cliente (`/cliente/*`)
  - Panel operador (`/operador/*`)
  - PWA chofer (`/chofer/*`, mobile-first con Service Worker)
- **Backend gestionado**: Supabase
  - PostgreSQL 16 (base de datos)
  - Supabase Auth (login, recuperacion de contrasena, sesiones)
  - Row Level Security (RBAC a nivel de BD)
  - Realtime (subscriptions para panel de operadores)
- **Estado**: Zustand + React Query (TanStack Query)
- **Almacenamiento de archivos**: Google Drive API v3 (Service Account) — solicitado por el cliente
- **Email**: SendGrid (notificaciones automaticas)
- **Generacion de PDF**: @react-pdf/renderer (server-side desde Server Actions o Route Handlers)
- **Deploy**: Vercel (un solo deploy para toda la app)
- **Control de versiones**: GitHub

### Estructura de Carpetas

```
app/
├── (auth)/                   # Login, recuperar contrasena
├── cliente/                  # Portal del cliente
│   ├── solicitudes/
│   └── seguimiento/
├── operador/                 # Panel del operador
│   ├── pendientes/
│   ├── chofer-asignado/
│   ├── en-curso/
│   ├── finalizadas/
│   ├── disponibilidad/       # Nuevo: tablero de disponibilidad diaria
│   ├── configuracion/        # Nuevo: agrupa Clientes, Choferes, Camiones
│   │   ├── clientes/
│   │   ├── choferes/
│   │   └── camiones/
│   ├── remitos/
│   ├── toneladas/
│   └── reportes/
├── chofer/                   # PWA mobile-first para choferes
│   ├── inicio/               # Viajes del dia
│   ├── turno/                # Registro del turno
│   ├── viaje/                # Registro por viaje + remito
│   └── inspeccion/           # Inspeccion del camion (6 secciones)
└── api/                      # Route handlers (webhooks, integraciones externas)

components/                   # Componentes reutilizables (shadcn/ui base)
├── ui/                       # Atomos compartidos
├── cliente/
├── operador/
└── chofer/

lib/
├── supabase/                 # Clientes Supabase (server, client, middleware)
├── server/                   # Logica de negocio server-side organizada por dominio
│   ├── clients/              # ABM de clientes
│   ├── drivers/              # ABM de choferes
│   ├── trucks/               # ABM de camiones y disponibilidad diaria
│   ├── trips/                # Viajes (Reparto + Contenedor)
│   ├── reservations/         # Reservas de Contenedor
│   ├── assignments/          # Asignacion de chofer/patente
│   ├── remitos/              # Upload y notificacion de remitos
│   ├── inspections/          # Inspeccion del camion
│   ├── reports/              # Modulo de reportes
│   ├── notifications/        # Servicio de email (SendGrid)
│   ├── drive/                # Integracion Google Drive
│   └── pdf/                  # Generacion de PDFs con @react-pdf/renderer
├── validators/               # Schemas Zod compartidos client/server
└── utils/

store/                        # Zustand stores por dominio

supabase/
├── migrations/               # Migraciones SQL versionadas
└── seed.sql                  # Datos iniciales (roles, lugares de carga, etc.)

middleware.ts                 # Validacion de sesion y rol por ruta

public/
├── manifest.json             # PWA manifest (iconos, theme, display: standalone)
└── sw.js                     # Service Worker (cache + offline parcial)

.env.local
```

### Base de Datos

| Tabla | Descripcion |
|-------|-------------|
| `clients` | Empresas clientes (codigo, nombre) |
| `client_emails` | Emails de acceso por cliente (multiples por cliente) |
| `client_deposits` | Depositos/puertos preestablecidos por cliente |
| `drivers` | Choferes (codigo, DNI, nombre) |
| `operators` | Operadores y administradores de ReySil |
| `user_profiles` | Perfil extendido vinculado a `auth.users` de Supabase con `role` (CLIENTE, OPERADOR, CHOFER, ADMIN) y FK a `clients` o `drivers` segun corresponda |
| `trips` | Viajes individuales (REPARTO o CONTENEDOR) con estado |
| `trip_reparto_fields` | Campos especificos de viajes tipo Reparto |
| `reservations` | Reservas de contenedores (padre de containers) |
| `containers` | Contenedores individuales dentro de una reserva |
| `trip_assignments` | Asignacion de chofer y patente a un viaje |
| `trip_events` | Hitos registrados por el chofer durante el viaje |
| `trip_driver_data` | Datos adicionales por viaje (km, pernoctada, etc.) |
| `remitos` | Fotos de remitos firmados con URL de Google Drive |
| `inspections` | Inspecciones de camion por turno |
| `inspection_items` | Items individuales de cada inspeccion (cumple/no cumple) |
| `shift_logs` | Registro de turno diario del chofer |
| `trucks` | Camiones (marca, modelo, patente, estado activo/inactivo) |
| `truck_daily_status` | Vista SQL que calcula el estado diario de cada camion (LIBRE/PREASIGNADO/ASIGNADO) cruzando trips + trip_assignments |

Todas las tablas tienen Row Level Security activado. Las policies aseguran que cada rol solo ve/modifica los datos que le corresponden:
- **CLIENTE**: solo sus propios viajes y reservas (filtrado por `client_id` derivado del user_profile)
- **CHOFER**: solo viajes asignados a el e inspecciones propias
- **OPERADOR / ADMIN**: acceso completo

### Autenticacion
**Supabase Auth** maneja login, registro, recuperacion de contrasena, sesiones y refresh tokens. Hash de contrasenas, rate limiting y rotacion de tokens estan incluidos out of the box. La sesion vive en cookies httpOnly gestionadas por `@supabase/ssr`.

El rol del usuario vive en la tabla `user_profiles` (vinculada a `auth.users` por `user_id`) y se valida tanto en:
- **Middleware de Next.js**: redirige al area correcta segun rol y bloquea accesos cruzados (un cliente no puede entrar a `/operador/*`)
- **Row Level Security en Supabase**: garantiza la seguridad real de los datos a nivel de BD, no solo en la UI

### Integraciones Externas

| Servicio | Proposito | Tipo |
|----------|-----------|------|
| Supabase | Backend gestionado (DB + Auth + Realtime) | SDK oficial |
| SendGrid | Emails automaticos a clientes | API REST |
| Google Drive API v3 | Almacenamiento de remitos e inspecciones | Service Account |
| WhatsApp | Acceso rapido desde PWA del chofer | Deep link (wa.me) |
| OCR / IA (FASE 2) | Validacion automatica de remitos | Pendiente confirmar |

### Almacenamiento de Archivos
Google Drive con Service Account (solicitado explicitamente por el cliente). El upload se hace desde Server Actions o Route Handlers de Next.js. Estructura:
- `ReySil/remitos/[NombreCliente]-[YYYY-MM-DD]-[seq].jpg`
- `ReySil/inspecciones/[Patente]-[YYYY-MM-DD].pdf`

> Nota: NO se usa Supabase Storage. La unica fuente de archivos es Google Drive porque el cliente lo requirio explicitamente para tener acceso directo desde su cuenta.

### Generacion de PDFs
**@react-pdf/renderer** desde el server (Server Actions o Route Handlers). Permite definir el layout del PDF con componentes React/JSX, sin necesidad de Chromium ni binarios pesados. Compatible con funciones serverless de Vercel sin configuracion especial.

Usado para:
- **PDF de inspeccion del camion** (HU-CHO-006): chofer completa la inspeccion en la PWA → server action genera el PDF con `@react-pdf/renderer` desde un componente JSX → sube el buffer a Google Drive → guarda URL en `inspections.pdf_url` → chofer previsualiza desde la URL.

Templates JSX viven en `lib/server/pdf/templates/`. Se renderizan en memoria con `renderToBuffer` y luego se suben a Drive.

### Realtime
Supabase Realtime para suscripciones a cambios en `trips` y `trip_events`. Usado en:
- **Panel de operadores** (HU-OPE-001, HU-OPE-005): las vistas Pendientes y En Curso se actualizan en vivo cuando los choferes registran eventos o cuando otros operadores asignan viajes
- **Seguimiento de viajes del cliente** (HU-CLI-004): el cliente ve el cambio de estado de su viaje sin recargar

---

## Modulos a Construir

> Orden definido por dependencias entre modulos y las historias de usuario.
> No construir un modulo si depende de otro incompleto.

| # | Modulo | Descripcion | Historias | Puntos | Depende de | Estado |
|---|--------|-------------|-----------|--------|------------|--------|
| 1 | Setup e Infraestructura | Scaffolding Next.js, proyecto Supabase, schema SQL inicial, RLS policies base, PWA manifest, configuracion de Vercel y .env | — | — | — | ✅ Completo |
| 2 | Autenticacion | Login con Supabase Auth, middleware de roles, recuperacion de contrasena, alta de user_profile | HU-AUTH-001, HU-AUTH-002 | 5 | Modulo 1 | ✅ Completo |
| 3 | Administracion | ABM de clientes (con emails y depositos) y ABM de choferes con creacion automatica de usuario en Supabase Auth | HU-ADMIN-001, HU-ADMIN-002 | 8 | Modulo 2 | ✅ Completo |
| 4 | Portal Cliente | Solicitud Reparto (form + grilla), Solicitud Contenedor, seguimiento (con realtime) y historial | HU-CLI-001 a HU-CLI-005 | 23 | Modulos 2, 3 | ✅ Completo |
| 5 | Panel Operadores | Vistas (Pendientes, Chofer Asignado, En Curso, Finalizadas) con realtime, asignacion, remitos, toneladas, reportes | HU-OPE-001 a HU-OPE-008 | 25 | Modulos 3, 4 | ✅ Completo |
| 6 | PWA Chofer | Viajes del dia, registro de turno, datos por viaje, foto remito, inspeccion, PDF inspeccion (rutas /chofer/* mobile-first con Service Worker) | HU-CHO-001 a HU-CHO-006 | 28 | Modulos 2, 5 | ✅ Completo |
| 7 | Notificaciones | Email automatico al asignar chofer, email automatico al subir remito (SendGrid) | HU-NOT-001, HU-NOT-002 | 5 | Modulos 5, 6 | ✅ Completo |
| 8 | Integraciones | Google Drive (upload remitos + PDF inspecciones), generacion PDF con @react-pdf/renderer | — | — | Modulo 7 | ✅ Completo |
| 9 | Gestion de Camiones y Disponibilidad | ABM de camiones (marca, modelo, patente), tablero de disponibilidad diaria (tipo ajedrez), flujo mejorado de asignacion con selectlists de choferes/patentes indicando estado | — | 13 | Modulos 3, 5 | 🔄 En progreso |

**Total: 25 historias + nuevas | 94 puntos + 13 puntos | Módulos 1-8 Completos, Módulo 9 En Progreso**

**Referencias:** ⬜ Pendiente · 🔄 En progreso · ✅ Completo · 🚫 Bloqueado

---

## Decisiones de Arquitectura

> No contradecirlas en sesiones futuras sin pasar por /nuevo-requerimiento.

- **Stack monolitico (Next.js + Supabase)**: Se descarto la separacion frontend/backend con NestJS + Railway + Prisma. Para un cliente unico con este volumen, esa arquitectura agrega complejidad de deployment innecesaria. Next.js sobre Vercel + Supabase reduce el proyecto a un solo deploy, elimina ~80% del modulo de autenticacion (Supabase Auth lo cubre out of the box) y permite real-time gratis para el panel de operadores.
- **Auth con Supabase Auth**: Reemplaza JWT + Passport.js + bcrypt + rate limiting manual. Incluye login, registro, recuperacion de contrasena, sesiones, refresh tokens, hash de contrasenas y rate limiting. Las cookies httpOnly se gestionan con `@supabase/ssr`.
- **RBAC con Row Level Security**: La seguridad vive en la BD via policies RLS, no solo en guards de aplicacion. Los 4 roles (CLIENTE, OPERADOR, CHOFER, ADMIN) se modelan en `user_profiles.role`. Cada query se filtra automaticamente segun el usuario autenticado. El middleware de Next.js valida el rol para evitar accesos UI cruzados.
- **App chofer como PWA**: Se evaluo React Native + Expo vs PWA. El requerimiento del cliente es que funcione en telefonos iOS y Android, no publicacion en stores. PWA cumple con todos los requerimientos (camara via web APIs, offline via Service Workers, deep link WhatsApp). Ventajas: un solo codebase, un solo deploy, updates instantaneos, zero costo de cuentas de stores. La PWA usa layout mobile-first con manifest.json para instalacion en pantalla de inicio.
- **Generacion de PDFs con @react-pdf/renderer**: Se descarto Puppeteer por su tamano (~170MB de Chromium) y complejidad de deploy en serverless de Vercel. @react-pdf/renderer permite definir el PDF como componentes JSX, funciona en serverless sin configuracion especial y comparte el modelo mental de React con el resto del frontend. Los templates viven en `lib/server/pdf/templates/`.
- **Estructura de codigo server-side por dominio**: La logica de negocio vive en `lib/server/{dominio}/` (clients, trips, drivers, etc.). Cada dominio expone funciones puras invocables desde Server Actions y Route Handlers. Esta disciplina compensa la falta de estructura impuesta de NestJS y evita que en 3 meses el codigo sea un monolito desordenado.
- **Validacion con Zod**: Schemas compartidos client/server en `lib/validators/`. Garantizan tipo y validacion en una sola fuente de verdad.
- **Estructura de rutas**: Frontend separado por rol (`/cliente/*`, `/operador/*`, `/chofer/*`). Middleware de Next.js valida el rol antes de servir cualquier pagina protegida.
- **Manejo de estado**: Zustand para estado global liviano (UI, filtros) + React Query para cache, sincronizacion de datos del servidor y mutaciones optimistas. Supabase Realtime para suscripciones a cambios en tablas criticas.
- **Almacenamiento de imagenes**: Google Drive API v3 con Service Account. Solicitado explicitamente por el cliente para acceso directo desde su cuenta de Drive. NO se usa Supabase Storage para mantener los archivos en un solo lugar.
- **Notificaciones**: SendGrid como servicio principal. Solo email en v1.
- **Realtime para paneles**: Supabase Realtime se activa en `trips` y `trip_events` para que el panel de operadores y el seguimiento del cliente se actualicen en vivo sin polling.
- **Modelo de datos contenedores**: Reserva (padre) → Contenedor (hijo) → Trip (viaje individual). Permite gestion independiente de cada contenedor.
- **Deploy**: Vercel (toda la app, incluyendo la PWA del chofer) + Supabase (gestionado). Costo estimado: ~$25/mes en produccion inicial (Supabase Pro $25 + Vercel Hobby/Pro segun trafico).

---

## Items Pendientes de Confirmacion con Cliente

| # | Item | Impacto |
|---|------|---------|
| 1 | Obligatoriedad de campos del formulario de Reparto (configurable por cliente) | Modulo 4 |
| 2 | Obligatoriedad de campos del formulario de Contenedor | Modulo 4 |
| 3 | Viabilidad y costo-beneficio de validacion automatica OCR del remito | Fase 2 |
| 4 | Que pasa si el operador rechaza el remito (flujo de re-envio) | Modulo 5 |
| 5 | Puede un mismo chofer llevar mas de un contenedor de la misma reserva | Modulo 5 |
| 6 | Definicion exacta de NDV, PAL, CAT, Nro UN, Km 50%, Km 100% | Modulo 4/6 |
| 7 | Reportes adicionales requeridos | Modulo 5 |
| 8 | Confirmacion del rol Administrador y sus permisos exactos | Modulo 2 |
| 9 | Formato de exportacion de reportes (Excel, PDF, CSV) | Modulo 5 |

**Estrategia**: Construir con defaults razonables (campos como opcionales, sin OCR en v1, validacion manual de remitos). Ajustar cuando el cliente confirme.

---

## Convenciones Especificas de este Proyecto

- Los viajes de Reparto se llaman `REPARTO` en el sistema (no "Mercaderia")
- Los campos de formulario configurables por cliente se modelan como metadata, no como columnas fijas
- Las fotos de remito se nombran con el patron `[NombreCliente]-[YYYY-MM-DD]-[seq].jpg`
- Los PDFs de inspeccion se nombran `[Patente]-[YYYY-MM-DD].pdf`
- El email del cliente se usa para asociar automaticamente las solicitudes — no se selecciona manualmente
- Los depositos preestablecidos son gestionables por cliente desde el ABM
- La grilla de carga masiva de repartos (HU-CLI-002) debe evaluarse con un componente tipo AG Grid o TanStack Table
- La inspeccion tiene 6 secciones con ~35 items totales — usar paginacion por seccion
- Toda la logica de negocio server-side vive en `lib/server/{dominio}/` — nunca poner queries SQL directas en componentes
- Toda mutacion al estado del servidor pasa por una Server Action o Route Handler — nunca llamar al cliente Supabase directamente desde un componente client
- Las RLS policies son la fuente de verdad de seguridad — no confiar solo en validaciones en codigo
- Schemas de validacion en `lib/validators/` con Zod, compartidos entre cliente y servidor
