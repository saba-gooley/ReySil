# Manual de Usuario — Sistema de Gestión de Viajes ReySil

> Versión 1.0 | Mayo 2026
> Este manual está organizado por rol. Encontrá tu sección y luego buscá la tarea que querés realizar.

---

## Índice

- [Acceso al sistema](#acceso-al-sistema)
- [Clientes](#clientes)
- [Operadores](#operadores)
- [Choferes](#choferes)
- [Administradores](#administradores)
- [Glosario](#glosario)

---

## Acceso al sistema

### Cómo ingresar al sistema

1. Abrí el navegador y entrá a la dirección del sistema que te dio ReySil.
2. Ingresá tu **email** y **contraseña**.
3. Hacé clic en **Ingresar**.
4. El sistema te redirige automáticamente al panel que corresponde a tu rol (cliente, operador, chofer o administrador).

### Cómo recuperar tu contraseña

1. En la pantalla de login, hacé clic en **¿Olvidaste tu contraseña?**
2. Ingresá tu email y hacé clic en **Enviar**.
3. Revisá tu bandeja de entrada: vas a recibir un email con un enlace para restablecer tu contraseña.
4. Hacé clic en el enlace del email (tiene vigencia de 1 hora).
5. Ingresá tu nueva contraseña dos veces y confirmá.

> El enlace de recuperación solo puede usarse una vez. Si expiró, repetí el proceso desde el inicio.

### Cómo cerrar sesión

En el menú superior derecho, hacé clic en tu nombre o en el botón **Salir**.

---

## Clientes

El portal de cliente te permite solicitar viajes, hacer seguimiento de tus envíos y consultar el historial. Accedés desde cualquier navegador de escritorio o celular.

---

### Cómo solicitar un viaje de tipo Reparto

Un **Reparto** es un viaje para transportar mercadería a uno o más destinos.

1. En el menú, hacé clic en **Nuevo Reparto**.
2. La pantalla muestra una **vista en grilla** (tipo planilla) por defecto. También podés cambiar a **vista formulario** con el botón correspondiente.
3. Completá los campos para cada reparto:
   - **Hoja de Ruta / Código**
   - **Fecha de Carga** y **Fecha de Entrega**
   - **Código Postal** y **Destino**
   - **Zona de Tarifa** y **Horario**
   - **Tipo de Camión**, **Toneladas**, **Kg's Netos**
   - **Peón** (Sí / No)
   - **N° Pallet / Peligro**
   - **Depósito / Puerto**: elegí de la lista de depósitos de tu empresa, o seleccioná **Otro** para escribir uno diferente.
   - **Comentarios** (opcional)
4. En vista grilla podés agregar más filas con el botón **+ Agregar fila** para cargar varios repartos a la vez.
5. Cuando terminés, hacé clic en **Guardar**.
6. Los repartos aparecen en el panel del operador en estado **Pendiente**.

> La fecha de entrega no puede ser anterior a la fecha de carga.

---

### Cómo solicitar un viaje de tipo Contenedor

Un **Contenedor** es una reserva que agrupa uno o más contenedores bajo un mismo número de reserva.

1. En el menú, hacé clic en **Nuevo Contenedor**.
2. Completá los datos generales de la reserva:
   - **Fecha del Viaje**
   - **Depósito / Lugar de Carga**
   - **Orden**, **Mercadería**, **Despacho**, **Carga**
   - **Destino** y **Terminal**
   - **Devuelve en** y **Libre hasta**
   - **Comentario** (opcional)
3. En la sección de contenedores, hacé clic en **+ Agregar contenedor** y completá el número de contenedor y los kg para cada uno. Podés agregar tantos como necesites.
4. Hacé clic en **Guardar**. El sistema genera un número de reserva que agrupa todos los contenedores.
5. Cada contenedor queda como una solicitud independiente y el operador puede asignar un chofer y camión diferente a cada uno.

> Se requiere al menos un contenedor para poder guardar la reserva.

---

### Cómo ver el estado de mis viajes activos

1. En el menú, hacé clic en **Mis Viajes** o **Inicio**.
2. Verás la lista de tus viajes en estado **Pendiente**, **Chofer Asignado** o **En Curso**.
3. Para ver el detalle completo de un viaje (incluyendo nombre del chofer y patente del camión cuando estén asignados), hacé clic sobre el viaje.

---

### Cómo consultar el historial de viajes finalizados

1. En el menú, hacé clic en **Historial**.
2. Verás todos tus viajes ya finalizados.
3. Podés filtrar por rango de fechas.
4. Hacé clic en un viaje para ver todos los datos, incluyendo las fotos del remito.

---

### Qué emails voy a recibir automáticamente

El sistema te envía emails en dos momentos:

| Momento | Qué contiene el email |
|---|---|
| Cuando el operador confirma la asignación | Nombre del chofer y patente del camión asignados |
| Cuando el chofer sube el remito firmado | Foto del remito adjunta + datos del viaje |

Los emails llegan a todos los emails habilitados para tu empresa. Si no estás recibiendo notificaciones, consultá con ReySil que tu email esté registrado correctamente.

---

## Operadores

El panel de operadores es el centro de gestión de todas las solicitudes. Desde acá asignás choferes y camiones, supervisás los viajes en curso y accedés a reportes y configuración.

---

### Cómo ver las solicitudes pendientes de asignación

1. En el menú, entrá a **Solicitudes → Pendientes**.
2. Verás todas las solicitudes de clientes que todavía no tienen chofer ni camión asignado.
3. Cada fila muestra el tipo de viaje, cliente, fecha, destino y los campos para asignar.
4. Para contenedores, se muestra un renglón por cada contenedor con el número de reserva del grupo visible.

---

### Cómo asignar chofer y camión a un reparto

1. En la vista **Pendientes**, encontrá el reparto que querés asignar.
2. Hacé clic en el botón de asignación (ícono de lápiz o **Asignar**).
3. En el formulario que aparece:
   - Seleccioná el **chofer** de la lista (el color del ítem indica su disponibilidad: verde = libre, amarillo = preasignado, rojo = asignado ese día).
   - Seleccioná el **camión** de la lista (mismo sistema de colores por disponibilidad).
   - Podés agregar un **comentario** interno para el chofer.
4. Hacé clic en **Guardar**. El viaje queda en estado **Preasignado** (pendiente de confirmar).

> Podés asignar un chofer o camión aunque ya tengan otro viaje ese día — el sistema lo permite con una advertencia visual.

---

### Cómo confirmar una asignación (pasar a "Chofer Asignado")

1. En la vista **Pendientes**, encontrá los viajes que ya tienen chofer y camión asignados (aparecen marcados).
2. Hacé clic en el botón **Confirmar** del viaje.
3. El viaje pasa al estado **Chofer Asignado** y el sistema envía automáticamente un email al cliente con el nombre del chofer y la patente.

> Cada reparto se confirma individualmente. Podés confirmar varios uno por uno.

---

### Cómo reordenar la lista por patente

En la vista **Pendientes**, hacé clic en el botón **Reordenar**. Las filas se ordenan en forma ascendente por número de patente, agrupando visualmente todos los viajes de un mismo camión.

> Este reordenamiento es solo visual — no modifica nada en la base de datos.

---

### Cómo asignar chofer y camión a un contenedor

El proceso es igual al del reparto, pero se hace por cada contenedor individualmente:

1. En la vista **Pendientes**, encontrá el contenedor dentro de su reserva.
2. Hacé clic en **Asignar** en ese renglón.
3. Completá chofer y camión y guardá.
4. Al confirmar, ese contenedor pasa a **Chofer Asignado** y el cliente recibe el email con los datos de ese contenedor específico.

---

### Cómo modificar o reasignar un chofer ya asignado

Si el viaje está en estado **Chofer Asignado** y el chofer todavía no inició el viaje, podés reasignar:

1. Entrá a **Solicitudes → Chofer Asignado**.
2. Encontrá el viaje y hacé clic en **Modificar**.
3. Cambiá el chofer y/o el camión y guardá.
4. El sistema envía automáticamente un nuevo email al cliente con los datos actualizados.

> Una vez que el chofer inicia el viaje desde la app, ya no se puede reasignar.

---

### Cómo ver los viajes en curso

1. Entrá a **Solicitudes → En Curso**.
2. Verás todos los viajes que el chofer ya inició. Podés hacer clic en cualquiera para ver el detalle y el estado reportado por el chofer en tiempo real.

---

### Cómo ver los viajes finalizados

1. Entrá a **Solicitudes → Finalizadas**.
2. Verás todos los viajes completados con todos los datos registrados por el chofer, incluyendo fotos del remito.
3. Hacé clic en un viaje para ver el detalle completo.

---

### Cómo ver el panel de remitos

1. En el menú, hacé clic en **Documentación → Remitos**.
2. Verás todos los remitos subidos por los choferes con el cliente, la fecha y el viaje asociado.
3. Podés filtrar por fecha o por cliente.
4. Hacé clic en un remito para ver la imagen en tamaño completo.

---

### Cómo ver el resumen de toneladas por camión

1. En el menú, hacé clic en **Toneladas**.
2. Seleccioná la fecha que querés consultar.
3. Verás una tabla con cada camión activo ese día, mostrando la suma total de toneladas asignadas. Si un camión tiene varios repartos, se muestra el acumulado.

> Esta vista solo aplica a viajes de tipo Reparto (los de Contenedor no tienen toneladas).

---

### Cómo generar reportes de viajes

1. En el menú, hacé clic en **Reportes**.
2. Seleccioná el rango de fechas.
3. Verás dos reportes disponibles:
   - **Viajes por cliente**: cantidad de viajes realizados para cada cliente en el período.
   - **Viajes por chofer**: cantidad de viajes realizados por cada chofer en el período.
4. Los resultados aparecen ordenados de mayor a menor.

---

### Cómo gestionar clientes

Desde **Configuración → Clientes** podés:

- **Crear un cliente**: completá el código, nombre, uno o más emails de acceso y los depósitos preestablecidos para ese cliente. Hacé clic en **Guardar**.
- **Editar un cliente**: hacé clic sobre el cliente en la lista y modificá los datos.
- **Desactivar un cliente**: hacé clic en el botón **Desactivar**. El cliente pierde acceso pero sus datos históricos se conservan.
- **Reactivar un cliente**: en la lista de clientes inactivos, hacé clic en **Reactivar**.

> Los depósitos preestablecidos de cada cliente son los que aparecen en el selector "Depósito/Puerto" cuando ese cliente carga un viaje.

---

### Cómo gestionar choferes

Desde **Configuración → Choferes** podés:

- **Crear un chofer**: completá el código, DNI, nombre y apellido. El sistema genera automáticamente las credenciales de acceso a la app (email y contraseña). Anotá la contraseña al momento de crearla — no se vuelve a mostrar.
- **Editar un chofer**: hacé clic sobre el chofer y modificá los datos.
- **Resetear la contraseña**: en la ficha del chofer, usá la opción **Resetear contraseña**. El sistema genera una nueva contraseña temporal que se muestra una sola vez.
- **Desactivar / Reactivar un chofer**: igual que con los clientes.

> El chofer accede a la app con el email formato `chofer.DNI@reysil.app` y la contraseña generada.

---

### Cómo gestionar camiones

Desde **Configuración → Camiones** podés:

- **Agregar un camión**: hacé clic en **Nuevo Camión**, completá la marca, el modelo y la patente (formato AAA123BB) y guardá.
- **Editar un camión**: hacé clic sobre el camión en la lista.
- **Desactivar / Reactivar un camión**: con los botones correspondientes en la lista.

---

### Cómo ver el tablero de disponibilidad

1. En el menú, hacé clic en **Disponibilidad**.
2. Elegí la fecha con el selector (podés navegar al día anterior o siguiente, o volver a hoy).
3. Verás una grilla con el estado de cada camión y cada chofer para esa fecha:
   - **Verde** — Libre
   - **Amarillo** — Preasignado (tiene un viaje pendiente de confirmar)
   - **Rojo** — Asignado (tiene un viaje confirmado)
4. En la parte superior aparece un resumen con los conteos por estado.

---

### Cómo cargar una solicitud en nombre de un cliente

Si necesitás crear una solicitud vos mismo en lugar del cliente:

1. En el menú, hacé clic en **Nueva Solicitud**.
2. Seleccioná el tipo de solicitud: **Reparto** o **Contenedor**.
3. En el formulario, elegí el **cliente** al que pertenece la solicitud.
4. Completá todos los datos y guardá. La solicitud aparece en la vista Pendientes igual que si la hubiera cargado el cliente.

---

## Choferes

La app del chofer está diseñada para usarse desde el celular. Al ingresar vas directo a tus viajes del día.

---

### Cómo ver mis viajes del día

Al ingresar a la app verás directamente la lista de viajes asignados para hoy. Cada viaje muestra el cliente, el destino y el tipo de viaje. Solo aparecen los viajes del día en curso.

---

### Cómo registrar los hitos de mi turno

El turno agrupa todos los hitos de tu jornada. Para registrarlos:

1. En la app, entrá a la sección **Mi Turno**.
2. Vas a ver los siguientes botones. Presioná cada uno en el momento en que ocurre:
   - **Llegada al depósito ReySil**
   - **Salida del depósito ReySil**
   - **Llegada al depósito destino**
   - **Fin de turno**
3. Cada botón registra automáticamente la fecha y hora exacta del momento en que lo presionás.

Además, podés registrar en el turno:
- **Tipo de KM**: elegí entre KM 50% o KM 100% con el selector.
- **Cantidad de km** del día.
- **Pernoctada**: si tuviste que quedarte a dormir fuera, marcá la opción e ingresá el lugar.

> Una vez registrado un hito del turno, no puede modificarse desde la app.

---

### Cómo registrar los datos de un viaje

Para cada viaje de tu lista:

1. Hacé clic sobre el viaje.
2. Completá los datos disponibles:
   - **Hora de llegada a destino** y **Hora de salida del cliente**
   - **Carga peligrosa**: Sí / No
   - **Comentarios** (opcional)
3. Al guardar los datos, el viaje pasa automáticamente al estado **En Curso** en el sistema.

---

### Cómo fotografiar y subir el remito

El remito es el documento firmado por el cliente que acredita la entrega.

1. Dentro del viaje, buscá la opción **Subir Remito**.
2. Usá la cámara del celular para fotografiar el remito firmado.
3. Confirmá la foto y subila.
4. En el momento exacto en que subís el remito, el sistema envía automáticamente un email al cliente con la foto adjunta.
5. El archivo queda guardado en Google Drive.

> Si ya existe un remito para ese viaje, el sistema te avisa antes de reemplazarlo.

---

### Cómo completar la inspección del camión

La inspección se hace al inicio del turno y cubre 35 ítems organizados en 5 secciones. Para cada ítem marcás **Cumple** o **No Cumple**.

1. En la app, entrá a la sección **Inspección**.
2. Avanzá por cada sección:
   - **Sección 1 — Documentación**: ART, Seguro y Licencias, Cédula Verde, RUTA y VTV.
   - **Sección 2 — Estado del Vehículo**: Cubiertas, Lonas, Luces, Elementos de sujeción, Combustible/Aceite, Frenos, Limpieza.
   - **Sección 3 — Seguridad del Personal**: Vestimenta, Zapatos, Casco, Guantes de cuero, Guantes de goma, Chaleco, Máscara y antiparras, Botiquín.
   - **Sección 4 — Seguridad del Vehículo**: Balizas, Linternas, Cuarta de remolque, Tacógrafo, Arrestallamas, Calzas de ruedas, Alarma de retroceso.
   - **Sección 5 — Kit Derrames y Otros**: Matafuego, Absorbente, Conos, Bolsas, Cintas, Pala antichispa, Placas, Ausencia de fugas, Hoja de seguridad.
3. Podés navegar entre secciones y volver atrás sin perder los datos ya ingresados.
4. Al terminar todas las secciones, aparece el botón **Generar PDF**.

---

### Cómo generar el PDF de inspección

1. Al finalizar la inspección, hacé clic en **Generar PDF**.
2. El sistema genera un PDF con tu nombre, la patente del camión, la fecha y hora, y el resultado de todos los ítems.
3. El PDF se guarda automáticamente en Google Drive con el nombre `[Patente]-[Fecha]`.

> Una vez generado el PDF, la inspección no puede modificarse.

---

## Administradores

El panel de administración te permite gestionar los operadores del sistema y acceder al panel operativo cuando sea necesario.

---

### Cómo ver la lista de operadores

1. Ingresá al sistema con tu cuenta de administrador.
2. En el menú, hacé clic en **Operadores**.
3. Verás dos listas: operadores activos e inactivos.

---

### Cómo crear un operador

1. En la sección **Operadores**, hacé clic en **Nuevo Operador**.
2. Completá el nombre, apellido y email del operador.
3. Hacé clic en **Guardar**. El sistema crea las credenciales de acceso automáticamente.
4. Comunicale al operador su email y contraseña inicial.

---

### Cómo editar los datos de un operador

1. En la lista de operadores, hacé clic sobre el operador.
2. Modificá los datos que necesités.
3. Guardá los cambios.

---

### Cómo resetear la contraseña de un operador

1. Entrá a la ficha del operador.
2. Buscá la sección **Resetear contraseña** y confirmá la acción.
3. El sistema genera una nueva contraseña que se muestra una sola vez. Anotala y comunicásela al operador.

---

### Cómo desactivar o reactivar un operador

- **Desactivar**: en la ficha del operador, hacé clic en **Desactivar**. El operador pierde acceso al sistema.
- **Reactivar**: en la lista de operadores inactivos, hacé clic en **Reactivar**.

---

### Cómo acceder al panel de operadores

Desde el panel de administración, hacé clic en el link **Panel Operadores** en el menú superior. Entrás directamente al panel de gestión de viajes con las mismas capacidades que un operador.

Para volver al panel de administración desde el panel de operadores, usá el link **← Panel Admin** que aparece en el encabezado.

---

## Glosario

| Término | Significado |
|---|---|
| **Reparto** | Viaje para transportar mercadería. Puede cargarse en grilla (múltiples repartos a la vez) o en formulario individual. |
| **Contenedor** | Reserva que agrupa uno o más contenedores. Cada contenedor recibe su propio chofer y camión. |
| **Reserva** | Número que agrupa varios contenedores bajo una misma solicitud. |
| **Remito** | Documento físico firmado por el cliente en el destino. El chofer lo fotografía y lo sube desde la app. |
| **Depósito / Lugar de Carga** | Punto de origen del viaje. Cada cliente tiene sus propios depósitos preestablecidos. |
| **Patente** | Número de patente del camión asignado al viaje. |
| **Turno** | Jornada de trabajo diaria del chofer, desde que llega al depósito de ReySil hasta el fin de turno. |
| **Hito del turno** | Cada uno de los momentos clave del día que el chofer registra: llegada/salida del depósito ReySil, llegada al destino, fin de turno. |
| **Preasignado** | Estado intermedio de un viaje: ya tiene chofer y camión asignados pero el operador todavía no confirmó. |
| **Chofer Asignado** | El operador confirmó la asignación. El cliente ya recibió el email con los datos del chofer y el camión. |
| **En Curso** | El chofer inició el viaje desde la app. |
| **Finalizado** | El viaje fue completado. |
| **Pernoctada** | Situación en que el chofer duerme fuera de su base durante el viaje. |
| **Carga peligrosa** | Indicador de que el viaje involucra materiales peligrosos (explosivos, inflamables, etc.). |
| **Km 50% / Km 100%** | Registro de kilómetros bajo distintas condiciones tarifarias. Se registra en el turno, no por viaje individual. |
| **Tablero de disponibilidad** | Vista que muestra el estado (libre, preasignado, asignado) de cada camión y chofer para una fecha determinada. |
| **Inspección** | Evaluación del estado del vehículo que el chofer completa al inicio de su turno, organizada en 5 secciones con 35 ítems. |
