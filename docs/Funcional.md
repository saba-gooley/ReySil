# DOCUMENTO FUNCIONAL
## Sistema de Gestión de Viajes — Transportes ReySil

| Campo | Valor |
|---|---|
| **Cliente** | Transportes ReySil |
| **Fecha** | 8 de Abril 2026 |
| **Versión** | 1.2 |
| **Estado** | Versión Final |
| **Revisión** | Incorpora correcciones del cliente (08/04/2026) |

---

## Tabla de Contenidos

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Objetivos del Proyecto](#2-objetivos-del-proyecto)
3. [Alcance del Proyecto](#3-alcance-del-proyecto)
4. [Usuarios del Sistema](#4-usuarios-del-sistema)
5. [Descripción de Funcionalidades](#5-descripción-de-funcionalidades)
6. [Integraciones con Sistemas Externos](#6-integraciones-con-sistemas-externos)
7. [Supuestos y Restricciones](#7-supuestos-y-restricciones)
8. [Glosario de Términos](#8-glosario-de-términos)
9. [Próximos Pasos](#9-próximos-pasos)

---

## 1. Resumen Ejecutivo

Transportes ReySil requiere el desarrollo de un sistema digital integral para optimizar y modernizar la gestión de sus servicios de transporte. El sistema consistirá en dos componentes principales: un portal web de autogestión para clientes y una aplicación móvil para los choferes, ambos conectados a un back office centralizado para los operadores internos de la empresa.

El portal web permitirá a los clientes de ReySil solicitar viajes de forma autónoma, hacer seguimiento del estado de sus envíos y acceder al historial de servicios. La aplicación móvil para choferes les permitirá registrar los eventos clave de cada viaje (horarios, fotos de remitos, kilómetros, incidentes e inspección del estado del camión) de manera simple e intuitiva. Los operadores de ReySil contarán con un panel centralizado para gestionar, asignar y supervisar todas las operaciones.

Este sistema eliminará la dependencia de procesos manuales, mejorará la comunicación entre todos los actores involucrados y brindará trazabilidad completa sobre cada servicio prestado.

---

## 2. Objetivos del Proyecto

- Permitir a los clientes solicitar y hacer seguimiento de sus viajes de manera autónoma, sin depender de llamadas o correos electrónicos.
- Automatizar las notificaciones a clientes en los momentos clave del proceso: asignación de chofer y patente del camión, y confirmación de entrega con remito adjunto.
- Digitalizar el registro de actividad de los choferes, reemplazando reportes manuales por datos capturados en tiempo real desde la app móvil.
- Centralizar la gestión operativa en un panel único para los operadores de ReySil, con estados claros: **Pendiente, Chofer Asignado, En Curso y Finalizado**.
- Mejorar la trazabilidad de cada viaje mediante el registro de tiempos, fotografías de remitos, datos de entrega e inspección del estado del vehículo.
- Generar reportes de gestión que permitan analizar la actividad por cliente y por chofer en rangos de fechas.

---

## 3. Alcance del Proyecto

### 3.1 Incluido en el Alcance

- Portal web de autogestión para clientes con login por usuario.
- Módulo de solicitud de viajes para dos tipos: **Reparto** y **Contenedores**.
- Campo Depósito / Lugar de Carga en ambos tipos de viaje, con selección de lugares preestablecidos por cliente y opción 'Otro' con texto libre.
- Panel de operadores de ReySil con cuatro vistas: **Pendientes, Chofer Asignado, En Curso y Finalizadas**.
- Asignación de chofer y patente del camión por parte de los operadores (a nivel reserva para Reparto; a nivel contenedor individual para Contenedores).
- Flujo de confirmación en pestaña Pendientes: el operador asigna chofer y patente, luego confirma individualmente cada reparto. Botón 'Reordenar' por patente disponible.
- Ordenamiento y filtros por chofer/patente en pestañas Pendientes y Chofer Asignado.
- Notificación automática por email al cliente al confirmar chofer y patente.
- Notificación automática por email al cliente al subir el remito (inmediata), con foto adjunta.
- Aplicación móvil para choferes (iOS y Android) para registro de estados del viaje.
- Módulo de Inspección del Camión en la app del chofer, organizado en 5 secciones con clasificación Cumple / No Cumple por ítem.
- Generación de PDF de inspección del camión, almacenado en Google Drive con nombre `[Patente]-[Fecha]`.
- Registro de hitos del turno del chofer: llegada/salida del depósito ReySil, llegada al destino, fin de turno.
- Registro por viaje: llegada a destino, salida del cliente, foto del remito, datos adicionales (carga peligrosa, pernoctada, km, comentarios).
- Almacenamiento de remitos en Google Drive con nombre identificable `[Cliente]-[Fecha]-[Código]`.
- Panel de Resumen de Toneladas por Camión: vista por fecha con suma de toneladas por patente.
- Módulo de reportes: cantidad de viajes por cliente y por chofer en un rango de fechas.
- Gestión de base de datos de clientes (código, nombre, mails de acceso, depósitos preestablecidos) y choferes (código, DNI, nombre y apellido).

### 3.2 Excluido del Alcance

- Integración con sistemas ERP o SAP externos (los campos como RTO SAP se ingresarán manualmente).
- Facturación o cobro a clientes dentro del sistema.
- Rastreo GPS en tiempo real de los vehículos.
- Sistema de gestión de flota o mantenimiento de vehículos.
- App móvil para clientes (solo portal web).
- Integración con plataformas de mensajería distintas a WhatsApp (solo acceso directo vía ícono).
- Módulo de liquidación de sueldos o cálculo de horas de los choferes.

---

## 4. Usuarios del Sistema

| Rol | Descripción | Accesos Principales |
|---|---|---|
| **Cliente** | Empresa o persona que contrata los servicios de transporte de ReySil. Puede tener múltiples usuarios asociados. | Solicitar viajes (reparto/contenedores), ver estado de viajes activos e historial, recibir notificaciones por email. |
| **Operador ReySil** | Personal interno de la empresa encargado de gestionar y asignar los viajes. | Ver todas las solicitudes, asignar chofer y patente, confirmar asignaciones, ver panel de remitos, acceder a reportes, gestionar clientes y choferes. |
| **Chofer** | Conductor de ReySil que ejecuta los viajes asignados. | Ver viajes del día, registrar estados del turno y de cada viaje, completar inspección del camión, fotografiar remito, acceder a WhatsApp directo. |
| **Administrador del Sistema** | Usuario técnico con acceso completo a la configuración del sistema. `[PENDIENTE CONFIRMAR CON CLIENTE]` | Gestión de usuarios, configuración de parámetros, acceso total a datos. |

---

## 5. Descripción de Funcionalidades

### 5.1 Gestión de Usuarios y Accesos

Cada usuario del sistema (cliente, operador, chofer, administrador) tendrá un acceso único con email y contraseña. El email de login de los clientes será la clave para asociar automáticamente las solicitudes al cliente correspondiente.

- Alta, modificación y baja de clientes desde el back office. Datos requeridos: código de cliente, nombre, mails de acceso asociados y depósitos preestablecidos.
- Alta, modificación y baja de choferes desde el back office. Datos requeridos: código, DNI, nombre y apellido.
- Recuperación de contraseña por email.
- Un cliente puede tener más de un email habilitado para ingresar al sistema.

---

### 5.2 Portal Web de Autogestión para Clientes

Interfaz web accesible desde cualquier navegador de escritorio o móvil. Permite al cliente gestionar sus solicitudes de viaje de manera autónoma.

#### Solicitud de Viaje – Tipo Reparto

Los viajes de tipo Mercadería pasan a denominarse **Reparto** en toda la aplicación.

La pantalla de carga presenta **por defecto una vista en grilla** (tipo planilla Excel), con todas las columnas correspondientes a los campos del formulario y la posibilidad de agregar filas adicionales (carga masiva). Existe además un botón para alternar a una **vista de formulario** tradicional más amigable.

| Campo | Tipo | Obligatorio |
|---|---|---|
| Hoja de Ruta / Código | Alfanumérico | A confirmar con ReySil |
| Fecha de Carga | Fecha | A confirmar con ReySil |
| Fecha de Entrega | Fecha | A confirmar con ReySil |
| Código Postal | Alfanumérico | A confirmar con ReySil |
| Destino | Alfanumérico | Sí |
| Zona de Tarifa | Alfanumérico | A confirmar con ReySil |
| Horario | Hora | A confirmar con ReySil |
| Tipo de Camión | Selección | A confirmar con ReySil |
| Toneladas | Numérico | A confirmar con ReySil |
| Kg's Netos | Numérico | A confirmar con ReySil |
| Peón | Sí / No | A confirmar con ReySil |
| N° Pallet / Peligro | Alfanumérico | A confirmar con ReySil |
| Depósito / Puerto | Selección de lista preestablecida por cliente + opción 'Otro' con texto libre | Sí |
| Comentarios | Texto libre | No |

> **Nota:** La configuración de obligatoriedad por cliente (algunos campos son obligatorios para todos los clientes y otros solo para clientes específicos) deberá definirse con ReySil antes del desarrollo. `[PENDIENTE CONFIRMAR CON CLIENTE]`

---

#### Solicitud de Viaje – Tipo Contenedor

Un viaje de tipo Contenedor puede incluir múltiples contenedores dentro de la misma reserva. Al crear una reserva, los datos comunes se ingresan una sola vez y se genera un **número de reserva** que agrupa a todos los contenedores. Luego, cada contenedor funciona como una **sub-reserva independiente** (con su propio chofer y patente). No existe un límite máximo de contenedores por reserva. Por cada contenedor se deben especificar los kilogramos correspondientes.

| Campo | Tipo | Obligatorio |
|---|---|---|
| Fecha del Viaje | Fecha | Sí |
| Cliente | Automático (asociado al email de login) | Sí |
| Depósito / Lugar de Carga | Selección de lista preestablecida por cliente + opción 'Otro' con texto libre | A confirmar con ReySil |
| Orden | Alfanumérico | A confirmar con ReySil |
| Mercadería | Alfanumérico | A confirmar con ReySil |
| Despacho | Alfanumérico | A confirmar con ReySil |
| Carga | Alfanumérico | A confirmar con ReySil |
| Destino | Alfanumérico | Sí |
| Terminal | Alfanumérico | A confirmar con ReySil |
| Contenedor (hasta N, con peso en kg) | Alfanumérico + Numérico (kg por contenedor) | Al menos 1 contenedor |
| Devuelve en | Texto | A confirmar con ReySil |
| Libre hasta | Fecha | A confirmar con ReySil |
| Comentario | Texto libre | No |

---

#### Seguimiento de Viajes para el Cliente

- El cliente visualizará sus viajes activos (pendientes, con chofer asignado y en curso) con el estado reportado por el chofer.
- Verá el nombre del chofer asignado y la **patente del camión**, una vez confirmados por el operador.
- Podrá acceder al historial de viajes finalizados con todos los datos del viaje.
- En todos los casos verá un listado con los datos principales; al seleccionar un viaje se desplegará toda la información detallada.

---

### 5.3 Panel de Operadores de ReySil

Interfaz web de back office accesible solo por usuarios con rol Operador o Administrador.

#### Vistas del Panel

| Vista | Descripción |
|---|---|
| **Pendientes** | Solicitudes recibidas sin chofer ni patente asignados. El operador puede asignar chofer y patente (quedan pendientes de confirmar) y luego confirmar cada una individualmente. Incluye botón 'Reordenar' por patente y filtros por chofer/patente. |
| **Chofer Asignado** | Viajes con chofer y patente confirmados, pero no iniciados aún por el chofer. Se puede reasignar chofer/patente con reenvío automático de email al cliente. Incluye ordenamiento y filtro por chofer/patente. |
| **En Curso** | Viajes iniciados por el chofer desde la app. Se puede consultar el estado actualizado en tiempo real. |
| **Finalizadas** | Viajes ya ejecutados. Se pueden ver todos los datos reportados por el chofer, incluyendo fotos de remito. |

---

#### Asignación de Chofer y Patente – Viajes de Reparto

Para las reservas de tipo Reparto, la asignación se realiza a nivel de reserva completa:

1. El operador selecciona el chofer y registra la patente del camión en la pestaña **Pendientes**. Los repartos quedan en estado "pendiente de confirmar".
2. El operador puede presionar el botón **'Reordenar'** para ordenar todas las filas de forma ascendente por patente, agrupando visualmente los repartos de un mismo camión.
3. El operador confirma cada reparto individualmente mediante un botón **'Confirmar'**. Al confirmar, el viaje pasa automáticamente al estado **Chofer Asignado**.
4. Al confirmar, el sistema envía automáticamente un email al cliente con el nombre del chofer y la patente asignada.
5. El chofer puede ser reasignado mientras el viaje esté en estado Chofer Asignado (antes de que el chofer inicie el viaje desde la app). Al reasignar, se reenvía el email de notificación al cliente.
6. Tanto en la pestaña Pendientes como en Chofer Asignado, se puede **ordenar por patente** y **filtrar por chofer o por patente**.

---

#### Asignación de Chofer y Patente – Viajes de Contenedores

Para las reservas de tipo Contenedor, la asignación se realiza a nivel de cada contenedor individual:

- En las pestañas Pendientes y Chofer Asignado se muestra **un renglón por cada contenedor** (con el número de reserva padre visible).
- Cada contenedor recibe su propio chofer y patente de camión.
- Una reserva con múltiples contenedores genera múltiples viajes independientes, uno por contenedor.
- Al asignar chofer y patente a un contenedor, el sistema envía un email de notificación al cliente con los datos de ese contenedor específico.
- La pantalla de carga de reservas funciona con datos comunes ingresados una vez (encabezado de reserva) y una sección dinámica para agregar contenedores. Al guardar se genera un número de reserva que los agrupa.

---

#### Remitos: Carga y Notificación

El flujo de remitos opera de la siguiente manera:

1. Cuando el chofer sube la foto del remito desde la app, **en ese mismo momento** el sistema envía automáticamente un email al cliente con la foto del remito adjunta.
2. El remito queda visible para el operador en un panel de back office.
3. **Fase inicial:** el remito se almacena sin validación automática. En fases posteriores, el sistema podrá verificar la presencia de fecha, DNI y firma, marcando un indicador **OK / No-OK**. `[PENDIENTE CONFIRMAR VIABILIDAD]`
4. El archivo del remito se almacena en Google Drive con el nombre: `[Nombre del Cliente]-[Fecha]-[Código Secuencial]`.

---

### 5.4 Aplicación Móvil para Choferes

Aplicación móvil nativa (iOS y Android) diseñada para ser lo más simple e intuitiva posible, minimizando la fricción en el uso diario.

#### Pantalla Principal

- Al ingresar a la app, el chofer verá los viajes asignados para el día en curso.
- Acceso rápido para registrar datos del turno y la inspección del camión.
- Ícono visible de acceso directo a WhatsApp para comunicación con los administrativos de ReySil.

---

#### Inspección del Camión

Al inicio del turno, el chofer completa una inspección del estado del vehículo, organizada en **5 secciones**. Cada ítem se clasifica como **Cumple / No Cumple**.

Al finalizar, el chofer puede generar un **PDF** con todos los resultados (nombre del chofer, patente, fecha y detalle de la inspección), que se almacena automáticamente en Google Drive con el formato `[Patente]-[Fecha]`.

##### Sección 1 – Documentación
- ART – Aseguradora de Riesgos de Trabajo
- Seguro y Licencias
- Cédula Verde (Cédula de Identificación Automotor)
- RUTA (Registro Único Transporte Carga) y VTV

##### Sección 2 – Estado del Vehículo
- Cubiertas (estado, tornillos, clavos)
- Lonas
- Luces Delanteras / Traseras / Laterales (estado y funcionamiento)
- Elementos de Sujeción – Aspectos de Seguridad en Cabina / Chasis / Semi
- Control de Consumo de Combustible y Aceite (nivel y presión de aceite)
- Frenos (estado y funcionamiento)
- Limpieza del Vehículo

##### Sección 3 – Seguridad del Personal
- Vestimenta adecuada (pantalón y camisa grafa o similar)
- Zapatos de seguridad
- Casco
- Guantes de cuero
- Guantes de goma
- Chaleco o equipo reflectante de advertencia
- Máscara y antiparras
- Botiquín completo (antisépticos, alcohol 70°, jabón antiséptico, agua oxigenada, gasas, venda elástica, curitas, tijeras, guantes quirúrgicos, algodón, paracetamol, pastillas antidiarreicas, crema antiinflamatoria, crema para quemaduras)

##### Sección 4 – Seguridad del Vehículo
- Balizas refractantes
- Linternas (verificar funcionamiento)
- Cuarta de remolque
- Tacógrafo
- Arrestallamas
- Calzas de ruedas
- Alarma de retroceso

##### Sección 5 – Kit Derrames y Otros
- Matafuego – 1 por semi y 1 por tractor de 10 kg c/u, y 1 de 2,5 kg en cabina (identificados con oblea)
- Absorbente para derrames (baldes de arena)
- Conos de señalización
- Bolsas para residuos
- Cintas para aislar zonas
- Pala antichispa
- Verificación de placas naranjas y carteles reglamentarios obligatorios
- Verificación de ausencia de fugas, grietas, derrames o roturas
- Hoja de seguridad del material transportado (cuadro de incompatibilidades, condiciones de almacenamiento y transporte)

---

#### Registro del Turno (datos diarios del chofer)

El chofer registra los siguientes hitos una vez por día, asociados a su usuario y a la fecha correspondiente:

| # | Dato | Tipo |
|---|---|---|
| 1 | Fecha y hora de llegada al depósito de ReySil | Fecha/Hora |
| 2 | Fecha y hora de salida del depósito de ReySil | Fecha/Hora |
| 3 | Fecha y hora de llegada al depósito (cliente/destino) | Fecha/Hora |
| 4 | Fecha y hora de fin del turno | Fecha/Hora |

Además, el sistema registra automáticamente la cantidad de viajes realizados por el chofer en el día.

---

#### Registro por Viaje

Para cada viaje asignado, el chofer completa los siguientes datos:

| # | Dato | Tipo | Regla |
|---|---|---|---|
| 5 | Fecha y hora de llegada a destino cliente | Fecha/Hora | |
| 6 | Fecha y hora de salida desde el cliente | Fecha/Hora | |
| 7 | Foto del remito firmado por el cliente | Imagen (cámara) | Al subir el remito, se envía email inmediatamente al cliente. El archivo se almacena en Google Drive: `[Cliente]-[Fecha]-[Código Secuencial]`. |
| 8 | Carga peligrosa | Sí / No | |
| 9 | Pernoctada | Sí / No | Si es Sí, se habilita campo 'Lugar' (texto libre) |
| 10 | Km 50% | Numérico | |
| 11 | Km 100% | Numérico | |
| 12 | Comentarios | Texto libre | |

Todos los datos del viaje ingresados por el chofer quedan asociados a la solicitud correspondiente, visible para el cliente y los operadores.

---

#### Panel de Resumen de Toneladas por Camión

El panel de operadores incluye una pantalla adicional que permite seleccionar una fecha y obtener la lista de todos los camiones activos ese día, con la **suma total de toneladas asignadas a cada uno**. Si un mismo camión tiene múltiples repartos en el día, se muestra la suma acumulada de toneladas.

---

### 5.5 Reportes

Módulo de reportes accesible para los operadores de ReySil. Permite filtrar por rango de fechas y generar las siguientes vistas:

- Cantidad de viajes por cliente en un rango de fechas.
- Cantidad de viajes por chofer en un rango de fechas.

> Los reportes deben poder exportarse. `[PENDIENTE CONFIRMAR CON CLIENTE: formatos requeridos, ej. Excel, PDF]`

---

## 6. Integraciones con Sistemas Externos

| Sistema / Servicio | Tipo de Integración | Descripción |
|---|---|---|
| Servicio de Email (SMTP / SendGrid u otro) | Salida | Envío de notificaciones automáticas a clientes: asignación de chofer y patente, y confirmación de entrega con remito adjunto. |
| WhatsApp | Acceso directo (deep link) | La app del chofer incluye un ícono que abre WhatsApp directamente. No implica integración de API; es un enlace de acceso rápido. |
| Google Drive | Integración cloud | Almacenamiento de fotos de remitos (nombre: `[Cliente]-[Fecha]-[Código]`) y PDFs de inspección del camión (nombre: `[Patente]-[Fecha]`). |
| Motor de validación de documentos (OCR / IA) | Servicio externo o módulo propio | Para la validación automática del remito (fecha, DNI, firma). Fase inicial: solo almacenamiento sin validación. `[PENDIENTE CONFIRMAR VIABILIDAD]` |

---

## 7. Supuestos y Restricciones

### 7.1 Supuestos

- Cada cliente tendrá al menos un usuario habilitado en el sistema para realizar solicitudes.
- Los choferes contarán con un smartphone con iOS o Android y conexión a internet para usar la app.
- ReySil proveerá la lista inicial de clientes, choferes y depósitos / lugares de carga preestablecidos por cliente para dar de alta en el sistema.
- El servicio de email para notificaciones será provisto o acordado con ReySil (puede ser SMTP propio, SendGrid u otro).
- La validación automática del remito (fecha, DNI y firma) se realizará mediante análisis de imagen con IA/OCR en una fase posterior. La fase inicial solo almacena el remito sin validación. `[PENDIENTE CONFIRMAR VIABILIDAD]`
- Los campos de obligatoriedad configurable por cliente se acordarán y parametrizarán con ReySil antes del desarrollo.
- Un viaje tipo Contenedor puede tener cualquier cantidad de contenedores; no existe un límite máximo. Cada contenedor requiere especificación de kilogramos.
- Cada contenedor de una reserva puede asignarse a un chofer y patente distinta, generando viajes independientes.

### 7.2 Restricciones

- La aplicación móvil debe ser extremadamente simple e intuitiva para facilitar su adopción por los choferes.
- El sistema no debe requerir capacitación extensa para su uso cotidiano.
- Las notificaciones por email son el único canal de comunicación automática hacia los clientes en esta versión (no se incluyen SMS ni notificaciones push para clientes).
- No se integrará con sistemas externos de gestión (SAP u otros ERP) en esta versión. Los datos de esos sistemas se ingresan manualmente.

---

## 8. Glosario de Términos

| Término | Definición |
|---|---|
| **Viaje** | Servicio de transporte asignado a un chofer para llevar mercadería o contenedores de un origen a un destino. |
| **Solicitud de Viaje** | Pedido ingresado por un cliente a través del portal web para la prestación de un servicio de transporte. |
| **Reparto** | Tipo de viaje que reemplaza al anterior 'Mercadería'. Incluye campos específicos como Hoja de Ruta, Toneladas, Kg's Netos, etc. |
| **Remito** | Documento físico firmado por el cliente en el destino que acredita la recepción de la mercadería. El chofer lo fotografía con la app y se envía inmediatamente al cliente por email. |
| **Depósito / Lugar de Carga** | Punto de origen del viaje. Seleccionable desde una lista de ubicaciones preestablecidas para cada cliente. Incluye opción 'Otro' para texto libre. |
| **Patente** | Número de patente del camión que realizará el traslado. Se registra al momento de la asignación. |
| **Reserva (Contenedores)** | Agrupación de múltiples contenedores bajo un mismo número de reserva. Cada contenedor funciona como una sub-reserva independiente con su propio chofer y patente. |
| **Inspección del Camión** | Evaluación del estado del vehículo realizada por el chofer al inicio del turno, organizada en 5 secciones. Cada ítem: Cumple / No Cumple. |
| **Carga Peligrosa** | Indicador de si el viaje involucra materiales clasificados como peligrosos (explosivos, inflamables, etc.). |
| **Pernoctada** | Situación en que el chofer debe pernoctar durante el viaje, con registro del lugar. |
| **Km 50% / Km 100%** | Registro de kilómetros del viaje bajo distintas condiciones tarifarias. `[PENDIENTE CONFIRMAR DEFINICIÓN CON CLIENTE]` |
| **Terminal** | Terminal portuaria o logística de origen/destino en viajes de tipo Contenedor. |
| **Back Office** | Panel de gestión interno utilizado por los operadores y administradores de ReySil. |
| **Turno** | Jornada laboral diaria de un chofer, desde su llegada al depósito de ReySil hasta el fin de turno. |
| **OCR** | Reconocimiento óptico de caracteres; tecnología que permite leer texto de imágenes, utilizada para validar los remitos fotográficos. |
| **Reorden por Patente** | Funcionalidad del panel de operadores que reordena las filas de repartos pendientes en forma ascendente por número de patente, para agrupar visualmente los viajes de un mismo camión. |
| **Resumen de Toneladas** | Pantalla del panel de operadores que, para una fecha dada, lista cada camión con la suma total de toneladas asignadas ese día. |

---

## 9. Próximos Pasos

1. Revisión del presente documento por parte de Transportes ReySil.
2. Confirmación o corrección de los ítems marcados como `[PENDIENTE CONFIRMAR CON CLIENTE]`.
3. Aprobación formal del alcance del proyecto.
4. Generación del documento de Historias de Usuario (backlog del producto).
5. Definición de la arquitectura técnica del sistema.
6. Estimación de tiempos y cronograma de desarrollo.
7. Kick-off del proyecto con el equipo de desarrollo.

---

*— Fin del Documento —*
