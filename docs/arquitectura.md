**ARQUITECTURA TÉCNICA**

Sistema de Gestión de Viajes -- Transportes ReySil

Versión 1.2 \| Basado en Funcional v1.2 \| Abril 2026 (rev. 2026-04-09)

**CONFIDENCIAL -- Solo uso interno**

**1. Resumen de la Arquitectura**

El sistema se construye sobre una arquitectura monolítica simplificada
optimizada para un cliente único: un proyecto Next.js 14 que sirve el
portal del cliente, el panel del operador y la PWA mobile-first del
chofer desde un solo deploy en Vercel, con Supabase como backend
gestionado (PostgreSQL + Auth + Realtime + Row Level Security). El
almacenamiento de archivos (remitos e inspecciones) se realiza en
Google Drive mediante Service Account, las notificaciones a clientes
se despachan via SendGrid, y los PDFs de inspección se generan con
@react-pdf/renderer en server-side.

*La decisión de eliminar la separación frontend/backend (NestJS +
Railway + Prisma) se fundamenta en que para un cliente único el
overhead de mantener dos proyectos, dos deploys y dos pipelines no se
justifica. Supabase reemplaza el backend completo: PostgreSQL
gestionado, autenticación (Supabase Auth) que cubre ~80% del módulo de
auth, Row Level Security que mueve la seguridad RBAC a la base de
datos, y Realtime para suscripciones en vivo en el panel de operadores.
La lógica de negocio vive en Server Actions y Route Handlers de
Next.js, organizada por dominio en `lib/server/{dominio}/` para
mantener la disciplina sin necesidad de un framework como NestJS.*

*La decisión de usar una PWA en lugar de React Native se fundamenta en
que el funcional sólo requiere que la app funcione en teléfonos iOS y
Android (no exige publicación en App Store ni Google Play). La PWA
cumple con todos los requisitos técnicos (cámara via Web APIs, offline
parcial via Service Workers, deep link a WhatsApp) y simplifica
drásticamente la arquitectura: un solo codebase Next.js, un solo
deploy en Vercel, updates instantáneos sin pasar por stores, y cero
costo de cuentas de developer.*

**2. Stack Tecnológico**

  ---------------- ---------------- ------------- -------------------------
  **Capa**         **Tecnología**   **Versión**   **Razón de la elección**

  Aplicación       Next.js 14 +     14.x          Framework React con App
  completa         TypeScript                     Router, Server Actions y
  (Cliente +                                      Route Handlers. Sirve
  Operador + PWA                                  portal cliente, panel
  Chofer)                                         operador y PWA chofer
                                                  desde un único proyecto
                                                  separados por rutas
                                                  (/cliente/*, /operador/*,
                                                  /chofer/*). Un solo
                                                  deploy.

  PWA Chofer       Service Workers  ---           Layout mobile-first con
                   + Web App                      manifest.json para
                   Manifest                       instalación en pantalla
                                                  de inicio. Service
                                                  Workers para cache y
                                                  offline parcial. Acceso
                                                  a cámara via
                                                  navigator.mediaDevices y
                                                  <input capture>.

  Backend          Supabase         Plataforma    Backend gestionado que
  gestionado                        gestionada    incluye PostgreSQL 16,
                                                  Auth, Realtime, Row Level
                                                  Security y Storage (no
                                                  usado). Reemplaza
                                                  NestJS, Railway y
                                                  Prisma. Reduce
                                                  dramáticamente la
                                                  complejidad para un
                                                  cliente único.

  Base de Datos    PostgreSQL       16.x          Incluida en Supabase.
                                                  Base de datos relacional
                                                  con soporte nativo de
                                                  JSON. Ideal para el
                                                  modelo de datos con
                                                  relaciones complejas
                                                  (Reserva → Contenedor →
                                                  Viaje). RLS para RBAC.

  Cliente DB       @supabase/ssr +  ---           Cliente oficial con
                   @supabase/                     soporte SSR para Next.js
                   supabase-js                    14. Cookies httpOnly
                                                  gestionadas
                                                  automáticamente.

  Autenticación    Supabase Auth    ---           Login, registro,
                                                  recuperación de
                                                  contraseña, sesiones,
                                                  refresh tokens, hash de
                                                  contraseñas y rate
                                                  limiting incluidos out
                                                  of the box. Reemplaza
                                                  JWT + Passport + bcrypt
                                                  + rate limiting manual.

  Validación       Zod              3.x           Schemas tipados y
                                                  compartidos client/server
                                                  en lib/validators/.

  Realtime         Supabase         ---           Suscripciones a cambios
                   Realtime                       en tablas para
                                                  actualizaciones en vivo
                                                  del panel de operadores
                                                  y seguimiento del
                                                  cliente.

  Almacenamiento   Google Drive API v3            Almacenamiento de remitos
  de archivos                                     e inspecciones en Google
                                                  Drive, según lo
                                                  solicitado por el
                                                  cliente. Naming
                                                  convention definida en el
                                                  funcional. NO se usa
                                                  Supabase Storage.

  Generación de    @react-pdf/      3.x           Genera PDFs definidos
  PDF              renderer                       como componentes JSX en
                                                  server-side. Funciona en
                                                  funciones serverless de
                                                  Vercel sin configuración
                                                  especial. Comparte el
                                                  modelo mental de React
                                                  con el resto del frontend.

  Servicio de      SendGrid         ---           Envío de notificaciones
  Email                                           automáticas. Confiabilidad
                                                  y tracking incluidos.

  Hosting          Vercel           ---           Hosting optimizado para
                                                  Next.js. Deploy automático
                                                  por rama. CDN global. Un
                                                  solo deploy para toda la
                                                  app (cliente + operador +
                                                  PWA chofer).

  Gestión de       Zustand + React  ---           Zustand para estado
  estado           Query (TanStack  ---           global liviano (UI,
                   Query)                         filtros). React Query
                                                  para cache, mutaciones
                                                  optimistas y
                                                  sincronización con
                                                  servidor. Supabase
                                                  Realtime para
                                                  suscripciones en vivo.
  ---------------- ---------------- ------------- -------------------------

**3. Diagrama de Arquitectura**

El siguiente diagrama muestra la arquitectura de alto nivel del sistema
y cómo se conectan sus componentes:

> ┌─────────────────────────────────────────────────────────────────┐
>
> │ CLIENTES / DISPOSITIVOS │
>
> ├────────────────────┬───────────────────┬────────────────────────┤
>
> │ Portal Cliente │ Panel Operador │ PWA Chofer │
>
> │ /cliente/* │ /operador/* │ /chofer/* (mobile) │
>
> │ │ │ Service Workers + │
>
> │ │ │ Web App Manifest │
>
> └────────┬───────────┴────────┬──────────┴──────────┬─────────────┘
>
> │ │ │
>
> └───────────────────┴────────────────────┘
>
> │ Next.js 14 (Vercel)
>
> │ Server Actions / Route Handlers
>
> │ middleware.ts (validación de rol)
>
> │
>
> ┌────────────────┴────────────────────┐
>
> │ SUPABASE (gestionado) │
>
> │ PostgreSQL │ Auth │ Realtime │ RLS │
>
> └────────┬──────────────────────┬─────┘
>
> │ │
>
> ┌────────┘ ┌──────────────┴──────────────┐
>
> │ │ │
>
> ┌────┴──────┐ ┌────────┴────┐ ┌─────────┴────┐
>
> │Google Drive│ │ SendGrid │ │ WhatsApp │
>
> │  (remitos │ │ (emails) │ │ (deep link) │
>
> │ + PDFs)  │ │           │ │              │
>
> └───────────┘ └─────────────┘ └──────────────┘

**4. Estructura de la Base de Datos**

El modelo de datos sigue un esquema relacional en PostgreSQL gestionado
por Supabase. El diseño central es la separación entre Reserva (para
Contenedores) y Trip (viaje individual), con una relación padre-hijo
para el caso de contenedores múltiples. Todas las tablas tienen Row
Level Security activado.

**4.1 Tablas principales**

  --------------------- -----------------------------------------------------------------------------
  **Tabla**             **Campos principales**

  user_profiles         id, user_id (FK → auth.users), role
                        (CLIENTE\|OPERADOR\|CHOFER\|ADMIN), client_id (FK → clients, nullable),
                        driver_id (FK → drivers, nullable), nombre, created_at

  clients               id, codigo (unique), nombre, activo, created_at, updated_at

  client_emails         id, client_id (FK → clients), email (unique), created_at

  client_deposits       id, client_id (FK → clients), nombre, direccion, created_at

  drivers               id, codigo (unique), dni (unique), nombre, apellido, activo, created_at,
                        updated_at

  operators             id, nombre, rol (OPERADOR\|ADMIN), activo, created_at

  trips                 id, tipo (REPARTO\|CONTENEDOR), client_id (FK), estado
                        (PENDIENTE\|CHOFER_ASIGNADO\|EN_CURSO\|FINALIZADO), fecha_carga,
                        fecha_entrega, destino, deposito, comentarios, created_at, updated_at

  trip_reparto_fields   id, trip_id (FK → trips, unique), hoja_ruta, cod_postal, zona_tarifa,
                        horario, tipo_camion, toneladas, kgs_netos, peon (bool), nro_pallet_peligro

  reservations          id, client_id (FK), fecha_viaje, deposito, orden, mercaderia, despacho,
                        carga, destino, terminal, devuelve_en, libre_hasta, comentarios, created_at

  containers            id, reservation_id (FK → reservations), nro_contenedor, peso_kg, trip_id (FK
                        → trips, unique), created_at

  trip_assignments      id, trip_id (FK → trips), driver_id (FK → drivers), patente, asignado_por (FK
                        → operators), confirmed_at, created_at

  trip_events           id, trip_id (FK → trips), driver_id (FK), tipo_evento
                        (LLEGADA_DEPOSITO_REYSIL \| SALIDA_DEPOSITO_REYSIL \| LLEGADA_DESTINO_CLIENTE
                        \| SALIDA_CLIENTE \| FIN_TURNO), fecha_hora, created_at

  trip_driver_data      id, trip_id (FK → trips, unique), carga_peligrosa (bool), pernoctada (bool),
                        lugar_pernoctada, km_50, km_100, comentarios

  remitos               id, trip_id (FK → trips), driver_id, url_drive, nombre_archivo,
                        enviado_cliente_at, created_at

  inspections           id, driver_id (FK → drivers), patente, fecha_turno (date), pdf_url,
                        created_at

  inspection_items      id, inspection_id (FK), seccion
                        (DOCUMENTACION\|ESTADO_VEHICULO\|SEG_PERSONAL\|SEG_VEHICULO\|KIT_DERRAMES),
                        nombre_item, cumple (bool), created_at

  shift_logs            id, driver_id (FK), fecha (date), llegada_deposito_reysil,
                        salida_deposito_reysil, llegada_deposito_destino, fin_turno, cantidad_viajes,
                        created_at
  --------------------- -----------------------------------------------------------------------------

> Nota: Las contraseñas y emails de login viven en `auth.users` (gestionado
> por Supabase Auth). La tabla `user_profiles` extiende ese registro con
> el rol y la relación con `clients` o `drivers` según corresponda.

**4.2 Diagrama de relaciones (simplificado)**

> auth.users \|\|\--\|\| user_profiles : \'extiende\'
>
> user_profiles \}o\--o\| clients : \'pertenece (si CLIENTE)\'
>
> user_profiles \}o\--o\| drivers : \'pertenece (si CHOFER)\'
>
> clients \|\|\--o{ client_emails : \'tiene\'
>
> clients \|\|\--o{ client_deposits : \'tiene\'
>
> clients \|\|\--o{ trips : \'solicita\'
>
> clients \|\|\--o{ reservations : \'solicita\'
>
> reservations \|\|\--\|{ containers : \'contiene\'
>
> containers \|\|\--\|\| trips : \'genera\'
>
> trips \|\|\--o\| trip_assignments : \'tiene\'
>
> trips \|\|\--o\| trip_reparto_fields : \'tiene (si REPARTO)\'
>
> trips \|\|\--o{ trip_events : \'registra\'
>
> trips \|\|\--o\| trip_driver_data : \'tiene\'
>
> trips \|\|\--o\| remitos : \'tiene\'
>
> drivers \|\|\--o{ inspections : \'realiza\'
>
> inspections \|\|\--\|{ inspection_items : \'contiene\'
>
> drivers \|\|\--o{ shift_logs : \'registra\'

**5. Seguridad y Autenticación**

**5.1 Estrategia de Autenticación**

- **Supabase Auth** maneja login, registro, recuperación de contraseña,
  sesiones, refresh tokens, hash de contraseñas y rate limiting out of
  the box.

- Cookies httpOnly gestionadas por `@supabase/ssr` (paquete oficial
  para Next.js 14 con App Router).

- Sesión por defecto de Supabase (JWT con refresh token automático).

- HTTPS obligatorio en todos los ambientes de producción (forzado por
  Vercel).

**5.2 Control de Acceso (RBAC con Row Level Security)**

El RBAC se implementa a dos niveles:

1. **Middleware de Next.js (`middleware.ts`)**: valida la sesión y el
   rol antes de servir cualquier página protegida. Redirige a un
   cliente si intenta acceder a `/operador/*`, etc.

2. **Row Level Security (RLS) en Supabase**: la verdadera seguridad
   vive en la base de datos. Cada tabla tiene policies que aseguran que
   un usuario solo puede leer/escribir los datos que le corresponden,
   sin importar lo que haga el frontend.

  -------------- ---------------------------------------------------
  **Rol**        **Permisos**

  CLIENTE        Crear solicitudes de viaje (Reparto / Contenedor).
                 Ver sus propios viajes activos e historial (RLS
                 filtra automáticamente por client_id). Recibir
                 notificaciones por email.

  OPERADOR       Ver todas las solicitudes. Asignar chofer y
                 patente. Confirmar asignaciones. Ver panel de
                 remitos. Acceder a reportes y al resumen de
                 toneladas. Gestionar clientes y choferes.

  CHOFER         Ver sus viajes asignados del día (RLS filtra por
                 driver_id). Registrar hitos del turno. Registrar
                 datos por viaje. Subir foto del remito. Completar
                 inspección del camión. Generar PDF de inspección.

  ADMIN          Acceso completo a todas las funcionalidades.
                 Gestión de parámetros del sistema. Acceso a todos
                 los datos de todos los clientes.
  -------------- ---------------------------------------------------

**5.3 Otras consideraciones de seguridad**

- Variables de entorno para todos los secrets (Supabase keys, SendGrid
  API key, Google Drive Service Account JSON).

- Rate limiting de Supabase Auth en endpoints de login (incluido out of
  the box).

- Validación de todos los inputs con schemas Zod en Server Actions y
  Route Handlers (mismo schema que valida en cliente).

- RLS policies como fuente de verdad de seguridad — no confiar
  exclusivamente en validaciones en código de aplicación.

- Las fotos de remitos e inspecciones se almacenan en Google Drive con
  acceso restringido (no público).

- El `SUPABASE_SERVICE_ROLE_KEY` solo se usa en Server Actions / Route
  Handlers para operaciones administrativas (ej: creación de usuarios
  desde el ABM de choferes). Nunca se expone al cliente.

**6. Integraciones Externas**

  --------------- ---------------- ---------------- -------------------
  **Servicio**    **Propósito**    **Tipo de        **Credenciales
                                   integración**    necesarias**

  Supabase        Backend          SDK oficial       SUPABASE_URL,
                  gestionado (DB + (@supabase/ssr,  ANON_KEY,
                  Auth + Realtime) supabase-js)     SERVICE_ROLE_KEY

  SendGrid        Notificaciones   API REST         API Key de SendGrid
                  automáticas a
                  clientes

  Google Drive    Almacenamiento   OAuth2 / Service Service Account de
  API             de remitos e     Account          Google con permisos
                  inspecciones                      de escritura en
                                                    carpetas
                                                    específicas

  WhatsApp (Deep  Acceso rápido    URL scheme       Número de WhatsApp
  Link)           desde PWA del    (wa.me)          de ReySil
                  chofer                            hardcodeado o
                                                    configurable

  OCR / IA (FASE  Validación       API REST         A confirmar en fase
  2)              automática de    (pendiente       posterior.
                  remitos          definir)         \[PENDIENTE
                                                    CONFIRMAR
                                                    VIABILIDAD\]
  --------------- ---------------- ---------------- -------------------

**Google Drive -- Estructura de carpetas**

> ReySil/
>
> ├── remitos/
>
> │ └── \[NombreCliente\]-\[YYYY-MM-DD\]-\[seq\].jpg
>
> └── inspecciones/
>
> └── \[Patente\]-\[YYYY-MM-DD\].pdf

**7. Estructura de Carpetas del Proyecto**

Toda la aplicación vive en un único proyecto Next.js. No hay separación
backend/frontend. La lógica de negocio server-side está organizada por
dominio en `lib/server/{dominio}/` para mantener la disciplina sin
necesidad de un framework como NestJS.

> app/
>
> ├── (auth)/                   \# Login, recuperar contraseña
>
> ├── cliente/                  \# Portal del cliente
>
> │   ├── solicitudes/
>
> │   └── seguimiento/
>
> ├── operador/                 \# Panel del operador
>
> │   ├── pendientes/
>
> │   ├── chofer-asignado/
>
> │   ├── en-curso/
>
> │   ├── finalizadas/
>
> │   ├── remitos/
>
> │   ├── toneladas/
>
> │   └── reportes/
>
> ├── chofer/                   \# PWA mobile-first para choferes
>
> │   ├── inicio/               \# Viajes del día
>
> │   ├── turno/                \# Registro del turno
>
> │   ├── viaje/                \# Registro por viaje + remito
>
> │   └── inspeccion/           \# Inspección del camión (6 secciones)
>
> └── api/                      \# Route handlers (webhooks, etc.)
>
> components/                   \# Componentes React reutilizables
>
> ├── ui/                       \# Átomos compartidos (shadcn/ui base)
>
> ├── cliente/
>
> ├── operador/
>
> └── chofer/
>
> lib/
>
> ├── supabase/                 \# Clientes Supabase (server, client, middleware)
>
> ├── server/                   \# Lógica de negocio server-side por dominio
>
> │   ├── clients/              \# ABM de clientes
>
> │   ├── drivers/              \# ABM de choferes
>
> │   ├── trips/                \# Viajes (Reparto + Contenedor)
>
> │   ├── reservations/         \# Reservas de Contenedor
>
> │   ├── assignments/          \# Asignación de chofer/patente
>
> │   ├── remitos/              \# Upload y notificación de remitos
>
> │   ├── inspections/          \# Inspección del camión
>
> │   ├── reports/              \# Módulo de reportes
>
> │   ├── notifications/        \# Servicio de email (SendGrid)
>
> │   ├── drive/                \# Integración Google Drive
>
> │   └── pdf/                  \# Generación de PDFs (@react-pdf/renderer)
>
> ├── validators/               \# Schemas Zod compartidos client/server
>
> └── utils/
>
> store/                        \# Zustand stores por dominio
>
> supabase/
>
> ├── migrations/               \# Migraciones SQL versionadas
>
> └── seed.sql                  \# Datos iniciales
>
> middleware.ts                 \# Validación de sesión y rol por ruta
>
> public/
>
> ├── manifest.json             \# PWA manifest
>
> └── sw.js                     \# Service Worker (cache + offline)
>
> .env.local

**8. Decisiones Técnicas y Justificaciones**

**Decisión 1: Stack monolítico Next.js + Supabase vs. separación
frontend/backend con NestJS + Railway**

- Decisión tomada: Next.js + Supabase + Vercel (un solo proyecto, un
  solo deploy).

- Alternativa considerada: Next.js + NestJS (Railway) + PostgreSQL +
  Prisma.

- Razón: Para un cliente único con este volumen, la separación
  frontend/backend agrega complejidad de deployment y mantenimiento
  innecesaria. Supabase reemplaza casi todo el backend: PostgreSQL
  gestionado, Auth (que cubre ~80% del módulo de autenticación),
  Realtime para suscripciones en vivo y Row Level Security para mover
  el RBAC a la base de datos. La lógica de negocio vive en Server
  Actions y Route Handlers de Next.js, organizada por dominio en
  `lib/server/{dominio}/` para mantener disciplina. Resultado: un solo
  codebase, un solo deploy, ~50% menos código boilerplate, costos
  reducidos a la mitad. Si en el futuro se agregan más clientes y la
  complejidad crece significativamente, migrar de Server Actions a un
  backend separado es factible.

**Decisión 2: PWA (Next.js) vs. React Native + Expo para la app del
chofer**

- Decisión tomada: PWA mobile-first dentro del mismo proyecto Next.js.

- Alternativa considerada: React Native + Expo como app móvil nativa.

- Razón: El funcional requiere que la app funcione en teléfonos iOS y
  Android, pero NO exige publicación en App Store ni Google Play. Una
  PWA cumple con todos los requerimientos técnicos: acceso a cámara via
  navigator.mediaDevices y `<input capture>` (suficiente para foto del
  remito), funcionamiento offline parcial via Service Workers,
  instalación en pantalla de inicio via Web App Manifest, y deep link
  a WhatsApp via wa.me. Ventajas concretas frente a React Native:
  un único codebase Next.js (en vez de dos proyectos paralelos), un
  único deploy en Vercel (en vez de Vercel + EAS), updates instantáneos
  sin pasar por stores, componentes y lógica reutilizables entre
  portal cliente, panel operador y PWA chofer, y cero costo de cuentas
  de developer (Apple $99/año + Google $25 únicos eliminados).

**Decisión 3: Supabase Auth vs. JWT + Passport.js manual**

- Decisión tomada: Supabase Auth.

- Alternativa considerada: JWT propio + Passport.js + bcrypt + rate
  limiting manual.

- Razón: Supabase Auth incluye out of the box todo lo que se
  necesitaría implementar manualmente: login, registro, recuperación de
  contraseña, sesiones con refresh token automático, hash de
  contraseñas, rate limiting, cookies httpOnly y rotación. Esto
  elimina ~80% del código del módulo de autenticación. El paquete
  oficial `@supabase/ssr` integra perfectamente con Next.js 14 App
  Router. La gestión de los 4 roles (CLIENTE, OPERADOR, CHOFER, ADMIN)
  vive en la tabla `user_profiles` extendiendo `auth.users`.

**Decisión 4: RBAC con Row Level Security vs. guards de aplicación**

- Decisión tomada: RBAC implementado en dos niveles: middleware de
  Next.js (UX) + Row Level Security en Supabase (seguridad real).

- Alternativa considerada: Guards de aplicación únicamente.

- Razón: Las RLS policies en PostgreSQL garantizan que la seguridad
  vive en la capa de datos, no en la capa de aplicación. Aún si un bug
  en el frontend o en una Server Action permitiera una query indebida,
  PostgreSQL la rechazaría automáticamente. El middleware de Next.js
  complementa esto evitando que un cliente vea siquiera la UI del
  panel de operadores. Resultado: defensa en profundidad con menos
  código que escribir guards en cada endpoint.

**Decisión 5: Google Drive vs. Supabase Storage**

- Decisión tomada: Google Drive (solicitado por el cliente).

- Alternativa considerada: Supabase Storage o AWS S3.

- Razón: El cliente explícitamente solicitó Google Drive para tener
  acceso directo a los archivos desde su cuenta de Drive. Implica usar
  Google Drive API v3 con Service Account. Los archivos no son
  públicos; el acceso es restringido. Aunque Supabase Storage estaría
  disponible "gratis" en el mismo backend, mantener los archivos en un
  solo lugar (Drive) cumple el requerimiento del cliente sin
  complejidad adicional.

**Decisión 6: Modelo Reserva → Contenedor (padre-hijo) para viajes de
contenedores**

- Decisión tomada: Tabla reservations (padre) + tabla containers como
  sub-entidades que generan trips individuales.

- Razón: El funcional establece que los datos comunes se ingresan una
  vez pero cada contenedor tiene su propio chofer, patente y ciclo de
  vida independiente. Este modelo permite mantener la trazabilidad de
  la reserva original y gestionar cada contenedor de forma autónoma.

**Decisión 7: @react-pdf/renderer vs. Puppeteer para generación de
PDFs**

- Decisión tomada: @react-pdf/renderer en server-side desde Server
  Actions o Route Handlers.

- Alternativas consideradas: Puppeteer (Chromium headless), jsPDF
  (client-side), PDFKit programático.

- Razón: Puppeteer fue descartado por el tamaño del binario de
  Chromium (~170MB), que excede el límite de funciones serverless de
  Vercel y requiere configuración especial con `@sparticuz/chromium`.
  jsPDF en cliente duplica lógica y depende del rendimiento del
  teléfono del chofer. PDFKit programático es difícil de mantener para
  layouts complejos. @react-pdf/renderer permite definir el PDF como
  componentes JSX (modelo mental compartido con el resto del frontend),
  funciona en serverless de Vercel sin configuración especial, y tiene
  el tamaño justo para el caso de uso. Los templates viven en
  `lib/server/pdf/templates/`. El PDF se genera con `renderToBuffer`,
  se sube a Google Drive y se guarda la URL en `inspections.pdf_url`.

**Decisión 8: Realtime con Supabase para paneles en vivo**

- Decisión tomada: Supabase Realtime para suscripciones a cambios en
  `trips` y `trip_events`.

- Alternativa considerada: Polling cada N segundos desde React Query.

- Razón: Supabase Realtime está incluido sin costo adicional y permite
  que el panel de operadores y el seguimiento del cliente se actualicen
  en vivo sin polling. Especialmente valioso para HU-OPE-001 (panel de
  pendientes que se actualiza cuando el cliente carga un viaje nuevo) y
  HU-OPE-005 (vista En Curso que muestra los hitos del chofer en
  tiempo real). Implementación trivial con
  `supabase.channel().on('postgres_changes', ...)`.

**Decisión 9: Validación con Zod compartida client/server**

- Decisión tomada: Schemas Zod en `lib/validators/` compartidos entre
  componentes cliente y Server Actions.

- Alternativa considerada: Validación duplicada en cliente y servidor.

- Razón: Zod permite definir el schema una sola vez y reusarlo en el
  formulario (con react-hook-form) y en la Server Action que recibe los
  datos. Garantiza una sola fuente de verdad para validación y tipos
  TypeScript inferidos automáticamente.

**9. Consideraciones de Escalabilidad**

- Vercel escala automáticamente el frontend (serverless functions). Sin
  límite práctico para el volumen de usuarios de ReySil.

- Supabase plan Pro soporta el volumen esperado (Pooler de conexiones
  para PostgreSQL incluido). Si el volumen crece, hay planes superiores
  sin necesidad de migrar de stack.

- Las Server Actions y Route Handlers se ejecutan como funciones
  serverless en Vercel. Stateless por diseño.

- Google Drive tiene un límite de 15 GB por cuenta gratuita. Se
  recomienda una cuenta de workspace de Google para mayor capacidad.

- Si el volumen de emails supera 100/día, activar plan de pago en
  SendGrid (\~\$20/mes para 50.000 emails).

- La grilla de carga masiva de repartos puede generar carga alta si un
  cliente sube cientos de filas. Implementar inserción en batch desde
  la Server Action correspondiente.

- Si en el futuro se incorporan más clientes y la complejidad de la
  lógica de negocio crece significativamente, migrar las Server Actions
  a un backend NestJS separado es factible sin romper el esquema de
  base de datos (Supabase puede seguir siendo solo la DB + Auth).

**10. Estimación de Costos de Infraestructura**

  --------------------- -------------- -------------- -----------------
  **Servicio**          **Ambiente     **Producción   **Producción
                        Dev**          inicial**      10x**

  Vercel (App           Free tier      \~\$0--20/mes  \~\$20/mes (Pro)
  completa: Cliente +                  (Hobby/Pro     
  Operador + PWA                       según tráfico) 
  Chofer)                                             

  Supabase              Free tier      \~\$25/mes     \~\$25--50/mes
  (PostgreSQL + Auth +  (limitado)     (Pro: 8GB DB,  (según volumen)
  Realtime + RLS)                      100GB
                                       bandwidth)

  Google Drive          15 GB gratis   \~\$3/mes (100 \~\$10/mes (1 TB)
  (almacenamiento)                     GB)            

  SendGrid (email)      100 emails/día \~\$20/mes     \~\$20/mes
                        gratis         (50k emails)   

  TOTAL ESTIMADO        \$0 (dev)      \~\$25--50/mes \~\$75--100/mes
  MENSUAL                                             
  --------------------- -------------- -------------- -----------------

*Nota: La simplificación del stack a Next.js + Supabase elimina los
costos de Railway (\$25/mes) y reduce el costo total mensual. Al usar
PWA en lugar de una app móvil nativa, también se eliminaron los costos
de Apple Developer Account (\$99/año), Google Play Developer Account
(\$25 único) y la suscripción a EAS (Expo Application Services). La
PWA se distribuye desde el mismo deploy de Vercel y los choferes la
instalan en su pantalla de inicio desde el navegador.*

*--- Fin del Documento de Arquitectura Técnica ---*
