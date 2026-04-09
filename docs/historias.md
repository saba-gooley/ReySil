**HISTORIAS DE USUARIO**

Sistema de Gestión de Viajes -- Transportes ReySil

Versión 1.0 \| Basado en Funcional v1.2 \| Abril 2026

  -------------- ---------------------
  Total de       25
  historias:     

  Total de       94 puntos de historia
  puntos:        

  Sprints        4.7 sprints
  estimados:     (velocidad 20
                 pts/sprint)

  Fecha:         8 de Abril 2026
  -------------- ---------------------

**Índice de Historias**

  -------------- --------------------- ---------------- --------------- ------------ ------------
  **ID**         **Título**            **Módulo**       **Prioridad**   **Puntos**   **Estado**

  HU-AUTH-001    Login de usuario      Autenticación    Alta            3            Pendiente

  HU-AUTH-002    Recuperación de       Autenticación    Alta            2            Pendiente
                 contraseña                                                          

  HU-ADMIN-001   ABM de Clientes       Administración   Alta            5            Pendiente

  HU-ADMIN-002   ABM de Choferes       Administración   Alta            3            Pendiente

  HU-CLI-001     Solicitud de viaje    Portal Cliente   Alta            5            Pendiente
                 tipo Reparto (vista                                                 
                 formulario)                                                         

  HU-CLI-002     Solicitud de viaje    Portal Cliente   Alta            8            Pendiente
                 tipo Reparto (vista                                                 
                 grilla)                                                             

  HU-CLI-003     Solicitud de viaje    Portal Cliente   Alta            5            Pendiente
                 tipo Contenedor                                                     

  HU-CLI-004     Seguimiento de viajes Portal Cliente   Alta            3            Pendiente
                 activos                                                             

  HU-CLI-005     Historial de viajes   Portal Cliente   Media           2            Pendiente
                 finalizados                                                         

  HU-OPE-001     Panel de viajes --    Panel Operadores Alta            3            Pendiente
                 Vista Pendientes                                                    

  HU-OPE-002     Asignación de chofer  Panel Operadores Alta            5            Pendiente
                 y patente para                                                      
                 Reparto                                                             

  HU-OPE-003     Asignación de chofer  Panel Operadores Alta            3            Pendiente
                 y patente para                                                      
                 Contenedores                                                        

  HU-OPE-004     Reasignación de       Panel Operadores Alta            3            Pendiente
                 chofer -- Estado                                                    
                 Chofer Asignado                                                     

  HU-OPE-005     Vista En Curso y      Panel Operadores Alta            2            Pendiente
                 Finalizadas                                                         

  HU-OPE-006     Panel de Remitos      Panel Operadores Alta            3            Pendiente

  HU-OPE-007     Panel Resumen de      Panel Operadores Media           3            Pendiente
                 Toneladas por Camión                                                

  HU-OPE-008     Módulo de Reportes    Panel Operadores Media           3            Pendiente

  HU-CHO-001     Ver viajes asignados  App Chofer       Alta            2            Pendiente
                 del día                                                             

  HU-CHO-002     Registro del turno    App Chofer       Alta            3            Pendiente
                 diario                                                              

  HU-CHO-003     Registro de datos por App Chofer       Alta            5            Pendiente
                 viaje                                                               

  HU-CHO-004     Fotografiar y subir   App Chofer       Alta            5            Pendiente
                 remito                                                              

  HU-CHO-005     Inspección del camión App Chofer       Alta            8            Pendiente
                 al inicio del turno                                                 

  HU-CHO-006     Generar PDF de        App Chofer       Alta            5            Pendiente
                 inspección del camión                                               

  HU-NOT-001     Notificación email:   Notificaciones   Alta            2            Pendiente
                 Chofer y patente                                                    
                 asignados                                                           

  HU-NOT-002     Notificación email:   Notificaciones   Alta            3            Pendiente
                 Remito subido                                                       
  -------------- --------------------- ---------------- --------------- ------------ ------------

**Módulo: Autenticación**

Total: 2 historias \| 5 puntos

+------------------+------------------+------------------+------------------+
| **HU-AUTH-001 -- Login de usuario**                                       |
+---------------------------------------------------------------------------+
| **Como** usuario del sistema (cliente, operador, chofer o administrador), |
|                                                                           |
| **quiero** ingresar con mi email y contraseña,                            |
|                                                                           |
| **para** acceder al sistema con mis permisos correspondientes.            |
+---------------------------------------------------------------------------+
| **Criterios de Aceptación:**                                              |
|                                                                           |
| - [ ] El sistema acepta email y contraseña válidos y redirige al panel    |
|   correspondiente según el rol                                            |
|                                                                           |
| - [ ] Si las credenciales son inválidas, muestra un mensaje de error      |
|   claro sin revelar cuál campo es incorrecto                              |
|                                                                           |
| - [ ] Después de 5 intentos fallidos consecutivos, el acceso queda        |
|   bloqueado por 15 minutos                                                |
|                                                                           |
| - [ ] La sesión expira automáticamente después de 8 horas de inactividad  |
|                                                                           |
| **Definición de Listo:**                                                  |
|                                                                           |
| - [ ] Código desarrollado y revisado                                      |
|                                                                           |
| - [ ] Tests unitarios escritos y pasando                                  |
|                                                                           |
| - [ ] Pruebas de integración documentadas                                 |
|                                                                           |
| - [ ] Aprobado por el product owner                                       |
+------------------+------------------+------------------+------------------+
| Estimación: 3    | Prioridad: Alta  | Módulo:          | Deps: Ninguna    |
| pts              |                  | Autenticación    |                  |
+------------------+------------------+------------------+------------------+
| *📝 Nota técnica: JWT para web y app móvil. Roles: CLIENTE, OPERADOR,     |
| CHOFER, ADMIN.*                                                           |
+---------------------------------------------------------------------------+

+------------------+------------------+------------------+------------------+
| **HU-AUTH-002 -- Recuperación de contraseña**                             |
+---------------------------------------------------------------------------+
| **Como** usuario del sistema,                                             |
|                                                                           |
| **quiero** recuperar mi contraseña olvidada via email,                    |
|                                                                           |
| **para** poder volver a acceder a mi cuenta.                              |
+---------------------------------------------------------------------------+
| **Criterios de Aceptación:**                                              |
|                                                                           |
| - [ ] El sistema envía un email con un link de reset válido por 1 hora    |
|                                                                           |
| - [ ] El link expira y muestra mensaje apropiado si se usa después de 1   |
|   hora                                                                    |
|                                                                           |
| - [ ] Al usar el link, el usuario puede definir una nueva contraseña con  |
|   confirmación                                                            |
|                                                                           |
| - [ ] El link solo puede usarse una vez                                   |
|                                                                           |
| **Definición de Listo:**                                                  |
|                                                                           |
| - [ ] Código desarrollado y revisado                                      |
|                                                                           |
| - [ ] Tests unitarios escritos y pasando                                  |
|                                                                           |
| - [ ] Pruebas de integración documentadas                                 |
|                                                                           |
| - [ ] Aprobado por el product owner                                       |
+------------------+------------------+------------------+------------------+
| Estimación: 2    | Prioridad: Alta  | Módulo:          | Deps:            |
| pts              |                  | Autenticación    | HU-AUTH-001      |
+------------------+------------------+------------------+------------------+

**Subtotal del módulo: 5 puntos**

**Módulo: Administración**

Total: 2 historias \| 8 puntos

+------------------+------------------+------------------+------------------+
| **HU-ADMIN-001 -- ABM de Clientes**                                       |
+---------------------------------------------------------------------------+
| **Como** operador de ReySil,                                              |
|                                                                           |
| **quiero** dar de alta, modificar y dar de baja clientes en el sistema,   |
|                                                                           |
| **para** gestionar la base de datos de clientes activos.                  |
+---------------------------------------------------------------------------+
| **Criterios de Aceptación:**                                              |
|                                                                           |
| - [ ] Puedo crear un cliente con: código, nombre, uno o más emails de     |
|   acceso y depósitos preestablecidos                                      |
|                                                                           |
| - [ ] Puedo editar todos los datos de un cliente existente                |
|                                                                           |
| - [ ] Puedo dar de baja un cliente (baja lógica, no elimina datos         |
|   históricos)                                                             |
|                                                                           |
| - [ ] Un cliente puede tener múltiples emails de acceso; todos quedan     |
|   asociados al mismo cliente                                              |
|                                                                           |
| - [ ] Los depósitos preestablecidos del cliente son gestionables          |
|   (agregar, editar, eliminar) desde la misma pantalla                     |
|                                                                           |
| - [ ] Al guardar, el sistema valida que el código y los emails sean       |
|   únicos en el sistema                                                    |
|                                                                           |
| **Definición de Listo:**                                                  |
|                                                                           |
| - [ ] Código desarrollado y revisado                                      |
|                                                                           |
| - [ ] Tests unitarios escritos y pasando                                  |
|                                                                           |
| - [ ] Pruebas de integración documentadas                                 |
|                                                                           |
| - [ ] Aprobado por el product owner                                       |
+------------------+------------------+------------------+------------------+
| Estimación: 5    | Prioridad: Alta  | Módulo:          | Deps:            |
| pts              |                  | Administración   | HU-AUTH-001      |
+------------------+------------------+------------------+------------------+
| *📝 Nota técnica: Depósitos preestablecidos: estos valores son los que    |
| aparecen en el selector \'Depósito/Puerto\' cuando el cliente carga un    |
| viaje.*                                                                   |
+---------------------------------------------------------------------------+

+------------------+------------------+------------------+------------------+
| **HU-ADMIN-002 -- ABM de Choferes**                                       |
+---------------------------------------------------------------------------+
| **Como** operador de ReySil,                                              |
|                                                                           |
| **quiero** dar de alta, modificar y dar de baja choferes en el sistema,   |
|                                                                           |
| **para** mantener actualizada la nómina de choferes disponibles para      |
| asignar viajes.                                                           |
+---------------------------------------------------------------------------+
| **Criterios de Aceptación:**                                              |
|                                                                           |
| - [ ] Puedo crear un chofer con: código, DNI, nombre y apellido           |
|                                                                           |
| - [ ] Puedo editar todos los datos de un chofer existente                 |
|                                                                           |
| - [ ] Puedo dar de baja un chofer (baja lógica)                           |
|                                                                           |
| - [ ] El sistema genera automáticamente las credenciales de acceso a la   |
|   app móvil para el chofer                                                |
|                                                                           |
| - [ ] El DNI y el código deben ser únicos en el sistema                   |
|                                                                           |
| **Definición de Listo:**                                                  |
|                                                                           |
| - [ ] Código desarrollado y revisado                                      |
|                                                                           |
| - [ ] Tests unitarios escritos y pasando                                  |
|                                                                           |
| - [ ] Pruebas de integración documentadas                                 |
|                                                                           |
| - [ ] Aprobado por el product owner                                       |
+------------------+------------------+------------------+------------------+
| Estimación: 3    | Prioridad: Alta  | Módulo:          | Deps:            |
| pts              |                  | Administración   | HU-AUTH-001      |
+------------------+------------------+------------------+------------------+
| *📝 Nota técnica: El chofer accede a la app móvil con email/contraseña    |
| generados en el alta.*                                                    |
+---------------------------------------------------------------------------+

**Subtotal del módulo: 8 puntos**

**Módulo: Portal Cliente**

Total: 5 historias \| 23 puntos

+------------------+------------------+------------------+--------------------------+
| **HU-CLI-001 -- Solicitud de viaje tipo Reparto (vista formulario)**              |
+-----------------------------------------------------------------------------------+
| **Como** cliente de ReySil,                                                       |
|                                                                                   |
| **quiero** solicitar un viaje de tipo Reparto completando un formulario,          |
|                                                                                   |
| **para** registrar mis necesidades de transporte de mercadería sin llamar a       |
| ReySil.                                                                           |
+-----------------------------------------------------------------------------------+
| **Criterios de Aceptación:**                                                      |
|                                                                                   |
| - [ ] El formulario incluye los campos: Hoja de Ruta/Código, Fecha de Carga,      |
|   Fecha de Entrega, Cód. Postal, Destino, Zona de Tarifa, Horario, Tipo de        |
|   Camión, Toneladas, Kg\'s Netos, Peón, N° Pallet/Peligro, Depósito/Puerto,       |
|   Comentarios                                                                     |
|                                                                                   |
| - [ ] El campo Depósito/Puerto muestra la lista de depósitos preestablecidos para |
|   mi empresa, más la opción \'Otro\' con texto libre                              |
|                                                                                   |
| - [ ] El cliente (empresa) se asocia automáticamente al email de login, sin       |
|   necesidad de seleccionarlo                                                      |
|                                                                                   |
| - [ ] Al guardar, el viaje aparece en estado \'Pendiente\' en el panel del        |
|   operador                                                                        |
|                                                                                   |
| - [ ] La fecha de entrega no puede ser anterior a la fecha de carga               |
|                                                                                   |
| **Definición de Listo:**                                                          |
|                                                                                   |
| - [ ] Código desarrollado y revisado                                              |
|                                                                                   |
| - [ ] Tests unitarios escritos y pasando                                          |
|                                                                                   |
| - [ ] Pruebas de integración documentadas                                         |
|                                                                                   |
| - [ ] Aprobado por el product owner                                               |
+------------------+------------------+------------------+--------------------------+
| Estimación: 5    | Prioridad: Alta  | Módulo: Portal   | Deps:                    |
| pts              |                  | Cliente          | HU-AUTH-001,HU-ADMIN-001 |
+------------------+------------------+------------------+--------------------------+
| *📝 Nota técnica: La obligatoriedad de cada campo por cliente es configurable     |
| desde la administración.*                                                         |
+-----------------------------------------------------------------------------------+

+------------------+------------------+------------------+------------------+
| **HU-CLI-002 -- Solicitud de viaje tipo Reparto (vista grilla)**          |
+---------------------------------------------------------------------------+
| **Como** cliente de ReySil,                                               |
|                                                                           |
| **quiero** cargar múltiples repartos a la vez en una vista de grilla tipo |
| Excel,                                                                    |
|                                                                           |
| **para** agilizar la carga cuando tengo muchos pedidos de transporte.     |
+---------------------------------------------------------------------------+
| **Criterios de Aceptación:**                                              |
|                                                                           |
| - [ ] La vista por defecto de la pantalla de Reparto es una grilla con    |
|   todas las columnas de los campos del formulario                         |
|                                                                           |
| - [ ] Puedo agregar filas a la grilla para cargar múltiples repartos en   |
|   una sola sesión                                                         |
|                                                                           |
| - [ ] Existe un botón visible para alternar entre vista grilla y vista    |
|   formulario                                                              |
|                                                                           |
| - [ ] Puedo editar directamente cada celda de la grilla                   |
|                                                                           |
| - [ ] La validación de campos se realiza al intentar guardar; se muestran |
|   los errores en las celdas correspondientes                              |
|                                                                           |
| - [ ] Al guardar, todos los repartos de la grilla se crean como           |
|   solicitudes independientes en estado Pendiente                          |
|                                                                           |
| **Definición de Listo:**                                                  |
|                                                                           |
| - [ ] Código desarrollado y revisado                                      |
|                                                                           |
| - [ ] Tests unitarios escritos y pasando                                  |
|                                                                           |
| - [ ] Pruebas de integración documentadas                                 |
|                                                                           |
| - [ ] Aprobado por el product owner                                       |
+------------------+------------------+------------------+------------------+
| Estimación: 8    | Prioridad: Alta  | Módulo: Portal   | Deps: HU-CLI-001 |
| pts              |                  | Cliente          |                  |
+------------------+------------------+------------------+------------------+
| *📝 Nota técnica: Componente de grilla editable (similar a AG Grid o      |
| React Spreadsheet). Considerar rendimiento con muchas filas.*             |
+---------------------------------------------------------------------------+

+------------------+------------------+------------------+--------------------------+
| **HU-CLI-003 -- Solicitud de viaje tipo Contenedor**                              |
+-----------------------------------------------------------------------------------+
| **Como** cliente de ReySil,                                                       |
|                                                                                   |
| **quiero** solicitar un viaje de tipo Contenedor con múltiples contenedores en    |
| una sola reserva,                                                                 |
|                                                                                   |
| **para** organizar el transporte de mis contenedores de forma centralizada.       |
+-----------------------------------------------------------------------------------+
| **Criterios de Aceptación:**                                                      |
|                                                                                   |
| - [ ] El formulario incluye datos comunes de la reserva: Fecha del Viaje,         |
|   Depósito, Orden, Mercadería, Despacho, Carga, Destino, Terminal, Devuelve en,   |
|   Libre hasta, Comentario                                                         |
|                                                                                   |
| - [ ] Puedo agregar uno o más contenedores a la reserva, cada uno con número de   |
|   contenedor y peso en kg                                                         |
|                                                                                   |
| - [ ] Al guardar, se genera un número de reserva único que agrupa todos los       |
|   contenedores                                                                    |
|                                                                                   |
| - [ ] Cada contenedor queda registrado como una sub-reserva independiente         |
|                                                                                   |
| - [ ] No existe límite máximo de contenedores por reserva                         |
|                                                                                   |
| - [ ] Al menos un contenedor es obligatorio para guardar la reserva               |
|                                                                                   |
| **Definición de Listo:**                                                          |
|                                                                                   |
| - [ ] Código desarrollado y revisado                                              |
|                                                                                   |
| - [ ] Tests unitarios escritos y pasando                                          |
|                                                                                   |
| - [ ] Pruebas de integración documentadas                                         |
|                                                                                   |
| - [ ] Aprobado por el product owner                                               |
+------------------+------------------+------------------+--------------------------+
| Estimación: 5    | Prioridad: Alta  | Módulo: Portal   | Deps:                    |
| pts              |                  | Cliente          | HU-AUTH-001,HU-ADMIN-001 |
+------------------+------------------+------------------+--------------------------+
| *📝 Nota técnica: Modelo de datos: Reserva (padre) → Contenedor/Viaje (hijo). El  |
| número de reserva debe ser visible en todo el sistema.*                           |
+-----------------------------------------------------------------------------------+

+------------------+------------------+------------------+-----------------------+
| **HU-CLI-004 -- Seguimiento de viajes activos**                                |
+--------------------------------------------------------------------------------+
| **Como** cliente de ReySil,                                                    |
|                                                                                |
| **quiero** ver el estado actualizado de todos mis viajes activos,              |
|                                                                                |
| **para** saber en qué etapa está cada envío sin tener que llamar a ReySil.     |
+--------------------------------------------------------------------------------+
| **Criterios de Aceptación:**                                                   |
|                                                                                |
| - [ ] Veo un listado con todos mis viajes en estado Pendiente, Chofer Asignado |
|   y En Curso                                                                   |
|                                                                                |
| - [ ] Para los viajes con chofer asignado, veo el nombre del chofer y la       |
|   patente del camión                                                           |
|                                                                                |
| - [ ] Al hacer clic en un viaje, se despliega el detalle completo del mismo    |
|                                                                                |
| - [ ] Los datos mostrados en el detalle incluyen toda la información de la     |
|   solicitud más los datos reportados por el chofer                             |
|                                                                                |
| - [ ] El listado está ordenado por fecha descendente por defecto               |
|                                                                                |
| **Definición de Listo:**                                                       |
|                                                                                |
| - [ ] Código desarrollado y revisado                                           |
|                                                                                |
| - [ ] Tests unitarios escritos y pasando                                       |
|                                                                                |
| - [ ] Pruebas de integración documentadas                                      |
|                                                                                |
| - [ ] Aprobado por el product owner                                            |
+------------------+------------------+------------------+-----------------------+
| Estimación: 3    | Prioridad: Alta  | Módulo: Portal   | Deps:                 |
| pts              |                  | Cliente          | HU-CLI-001,HU-CLI-003 |
+------------------+------------------+------------------+-----------------------+

+------------------+------------------+------------------+------------------+
| **HU-CLI-005 -- Historial de viajes finalizados**                         |
+---------------------------------------------------------------------------+
| **Como** cliente de ReySil,                                               |
|                                                                           |
| **quiero** acceder al historial completo de mis viajes finalizados,       |
|                                                                           |
| **para** consultar los datos de entregas anteriores cuando los necesite.  |
+---------------------------------------------------------------------------+
| **Criterios de Aceptación:**                                              |
|                                                                           |
| - [ ] Veo un listado paginado de todos mis viajes finalizados             |
|                                                                           |
| - [ ] Puedo filtrar por rango de fechas                                   |
|                                                                           |
| - [ ] Al seleccionar un viaje, veo todos los datos incluyendo las fotos   |
|   del remito                                                              |
|                                                                           |
| - [ ] El historial muestra al menos los últimos 12 meses de datos         |
|                                                                           |
| **Definición de Listo:**                                                  |
|                                                                           |
| - [ ] Código desarrollado y revisado                                      |
|                                                                           |
| - [ ] Tests unitarios escritos y pasando                                  |
|                                                                           |
| - [ ] Pruebas de integración documentadas                                 |
|                                                                           |
| - [ ] Aprobado por el product owner                                       |
+------------------+------------------+------------------+------------------+
| Estimación: 2    | Prioridad: Media | Módulo: Portal   | Deps: HU-CLI-004 |
| pts              |                  | Cliente          |                  |
+------------------+------------------+------------------+------------------+

**Subtotal del módulo: 23 puntos**

**Módulo: Panel Operadores**

Total: 8 historias \| 25 puntos

+------------------+------------------+------------------+-----------------------+
| **HU-OPE-001 -- Panel de viajes -- Vista Pendientes**                          |
+--------------------------------------------------------------------------------+
| **Como** operador de ReySil,                                                   |
|                                                                                |
| **quiero** ver todos los viajes pendientes de asignación en un panel           |
| centralizado,                                                                  |
|                                                                                |
| **para** gestionar las solicitudes recibidas y asignarles chofer y patente.    |
+--------------------------------------------------------------------------------+
| **Criterios de Aceptación:**                                                   |
|                                                                                |
| - [ ] Veo todas las solicitudes sin chofer ni patente asignados, de todos los  |
|   clientes                                                                     |
|                                                                                |
| - [ ] Cada fila muestra: tipo de viaje, cliente, fecha, destino, y campos de   |
|   asignación                                                                   |
|                                                                                |
| - [ ] Para viajes de Contenedor, se muestra un renglón por cada contenedor con |
|   el número de reserva padre visible                                           |
|                                                                                |
| - [ ] Puedo ordenar la tabla por patente                                       |
|                                                                                |
| - [ ] Puedo filtrar la tabla por chofer o por patente                          |
|                                                                                |
| - [ ] El panel se actualiza automáticamente o tiene un botón de refresco       |
|                                                                                |
| **Definición de Listo:**                                                       |
|                                                                                |
| - [ ] Código desarrollado y revisado                                           |
|                                                                                |
| - [ ] Tests unitarios escritos y pasando                                       |
|                                                                                |
| - [ ] Pruebas de integración documentadas                                      |
|                                                                                |
| - [ ] Aprobado por el product owner                                            |
+------------------+------------------+------------------+-----------------------+
| Estimación: 3    | Prioridad: Alta  | Módulo: Panel    | Deps:                 |
| pts              |                  | Operadores       | HU-CLI-001,HU-CLI-003 |
+------------------+------------------+------------------+-----------------------+

+------------------+------------------+------------------+------------------+
| **HU-OPE-002 -- Asignación de chofer y patente para Reparto**             |
+---------------------------------------------------------------------------+
| **Como** operador de ReySil,                                              |
|                                                                           |
| **quiero** asignar un chofer y una patente a cada reparto y luego         |
| confirmar la asignación,                                                  |
|                                                                           |
| **para** notificar al cliente y pasar el viaje al estado Chofer Asignado. |
+---------------------------------------------------------------------------+
| **Criterios de Aceptación:**                                              |
|                                                                           |
| - [ ] Puedo seleccionar un chofer de la base de datos y escribir la       |
|   patente para cada reparto en la pestaña Pendientes                      |
|                                                                           |
| - [ ] Los repartos quedan en estado \'pendiente de confirmar\' hasta que  |
|   los confirmo individualmente                                            |
|                                                                           |
| - [ ] Existe un botón \'Reordenar\' que ordena todas las filas de la      |
|   pestaña por patente en forma ascendente                                 |
|                                                                           |
| - [ ] Existe un botón \'Confirmar\' por cada reparto; al confirmar, el    |
|   viaje pasa a estado \'Chofer Asignado\'                                 |
|                                                                           |
| - [ ] Al confirmar, el sistema envía automáticamente un email al cliente  |
|   con nombre del chofer y patente                                         |
|                                                                           |
| - [ ] Si confirmo varios repartos del mismo camión, cada uno genera su    |
|   propio email al cliente                                                 |
|                                                                           |
| **Definición de Listo:**                                                  |
|                                                                           |
| - [ ] Código desarrollado y revisado                                      |
|                                                                           |
| - [ ] Tests unitarios escritos y pasando                                  |
|                                                                           |
| - [ ] Pruebas de integración documentadas                                 |
|                                                                           |
| - [ ] Aprobado por el product owner                                       |
+------------------+------------------+------------------+------------------+
| Estimación: 5    | Prioridad: Alta  | Módulo: Panel    | Deps: HU-OPE-001 |
| pts              |                  | Operadores       |                  |
+------------------+------------------+------------------+------------------+
| *📝 Nota técnica: El botón Reordenar no guarda el orden; es solo una      |
| vista temporal para facilitar la asignación masiva.*                      |
+---------------------------------------------------------------------------+

+------------------+------------------+------------------+------------------+
| **HU-OPE-003 -- Asignación de chofer y patente para Contenedores**        |
+---------------------------------------------------------------------------+
| **Como** operador de ReySil,                                              |
|                                                                           |
| **quiero** asignar chofer y patente a cada contenedor individual de una   |
| reserva,                                                                  |
|                                                                           |
| **para** gestionar de forma independiente el transporte de cada           |
| contenedor.                                                               |
+---------------------------------------------------------------------------+
| **Criterios de Aceptación:**                                              |
|                                                                           |
| - [ ] En la pestaña Pendientes veo un renglón por cada contenedor con el  |
|   número de reserva padre visible                                         |
|                                                                           |
| - [ ] Puedo asignar un chofer y una patente distinta a cada contenedor de |
|   una misma reserva                                                       |
|                                                                           |
| - [ ] Al asignar, el sistema envía email al cliente con los datos del     |
|   contenedor específico                                                   |
|                                                                           |
| - [ ] Cada contenedor asignado pasa individualmente al estado \'Chofer    |
|   Asignado\'                                                              |
|                                                                           |
| **Definición de Listo:**                                                  |
|                                                                           |
| - [ ] Código desarrollado y revisado                                      |
|                                                                           |
| - [ ] Tests unitarios escritos y pasando                                  |
|                                                                           |
| - [ ] Pruebas de integración documentadas                                 |
|                                                                           |
| - [ ] Aprobado por el product owner                                       |
+------------------+------------------+------------------+------------------+
| Estimación: 3    | Prioridad: Alta  | Módulo: Panel    | Deps: HU-OPE-001 |
| pts              |                  | Operadores       |                  |
+------------------+------------------+------------------+------------------+

+------------------+------------------+------------------+-----------------------+
| **HU-OPE-004 -- Reasignación de chofer -- Estado Chofer Asignado**             |
+--------------------------------------------------------------------------------+
| **Como** operador de ReySil,                                                   |
|                                                                                |
| **quiero** reasignar el chofer o la patente de un viaje que está en estado     |
| Chofer Asignado,                                                               |
|                                                                                |
| **para** corregir asignaciones antes de que el viaje sea iniciado por el       |
| chofer.                                                                        |
+--------------------------------------------------------------------------------+
| **Criterios de Aceptación:**                                                   |
|                                                                                |
| - [ ] Puedo reasignar chofer y/o patente en la pestaña \'Chofer Asignado\'     |
|   mientras el viaje no fue iniciado por el chofer                              |
|                                                                                |
| - [ ] Al reasignar, el sistema envía automáticamente un nuevo email al cliente |
|   con los datos actualizados                                                   |
|                                                                                |
| - [ ] Una vez que el chofer inicia el viaje desde la app, no es posible        |
|   reasignar                                                                    |
|                                                                                |
| - [ ] La pestaña Chofer Asignado también permite ordenar por patente y filtrar |
|   por chofer/patente                                                           |
|                                                                                |
| **Definición de Listo:**                                                       |
|                                                                                |
| - [ ] Código desarrollado y revisado                                           |
|                                                                                |
| - [ ] Tests unitarios escritos y pasando                                       |
|                                                                                |
| - [ ] Pruebas de integración documentadas                                      |
|                                                                                |
| - [ ] Aprobado por el product owner                                            |
+------------------+------------------+------------------+-----------------------+
| Estimación: 3    | Prioridad: Alta  | Módulo: Panel    | Deps:                 |
| pts              |                  | Operadores       | HU-OPE-002,HU-OPE-003 |
+------------------+------------------+------------------+-----------------------+

+------------------+------------------+------------------+------------------+
| **HU-OPE-005 -- Vista En Curso y Finalizadas**                            |
+---------------------------------------------------------------------------+
| **Como** operador de ReySil,                                              |
|                                                                           |
| **quiero** ver los viajes en curso y los ya finalizados con toda su       |
| información,                                                              |
|                                                                           |
| **para** supervisar la operación en tiempo real y acceder a los datos     |
| históricos.                                                               |
+---------------------------------------------------------------------------+
| **Criterios de Aceptación:**                                              |
|                                                                           |
| - [ ] La pestaña \'En Curso\' muestra todos los viajes iniciados por los  |
|   choferes con su último estado reportado                                 |
|                                                                           |
| - [ ] La pestaña \'Finalizadas\' muestra todos los viajes completados con |
|   todos los datos del chofer e imágenes de remito                         |
|                                                                           |
| - [ ] Puedo hacer clic en cualquier viaje para ver su detalle completo    |
|                                                                           |
| - [ ] El panel muestra al menos los datos: cliente, chofer, patente,      |
|   destino, estado, fecha                                                  |
|                                                                           |
| **Definición de Listo:**                                                  |
|                                                                           |
| - [ ] Código desarrollado y revisado                                      |
|                                                                           |
| - [ ] Tests unitarios escritos y pasando                                  |
|                                                                           |
| - [ ] Pruebas de integración documentadas                                 |
|                                                                           |
| - [ ] Aprobado por el product owner                                       |
+------------------+------------------+------------------+------------------+
| Estimación: 2    | Prioridad: Alta  | Módulo: Panel    | Deps: HU-OPE-002 |
| pts              |                  | Operadores       |                  |
+------------------+------------------+------------------+------------------+

+------------------+------------------+------------------+------------------+
| **HU-OPE-006 -- Panel de Remitos**                                        |
+---------------------------------------------------------------------------+
| **Como** operador de ReySil,                                              |
|                                                                           |
| **quiero** ver un panel con todos los remitos subidos por los choferes,   |
|                                                                           |
| **para** tener visibilidad de las entregas realizadas y controlar los     |
| remitos cuando sea necesario.                                             |
+---------------------------------------------------------------------------+
| **Criterios de Aceptación:**                                              |
|                                                                           |
| - [ ] Veo un listado de todos los remitos subidos con: nombre del         |
|   cliente, fecha, viaje asociado e imagen del remito                      |
|                                                                           |
| - [ ] Puedo filtrar remitos por fecha y por cliente                       |
|                                                                           |
| - [ ] Al seleccionar un remito puedo ver la imagen en tamaño completo     |
|                                                                           |
| - [ ] El remito incluye un indicador (en fases posteriores) de si pasó la |
|   validación automática OK/No-OK                                          |
|                                                                           |
| **Definición de Listo:**                                                  |
|                                                                           |
| - [ ] Código desarrollado y revisado                                      |
|                                                                           |
| - [ ] Tests unitarios escritos y pasando                                  |
|                                                                           |
| - [ ] Pruebas de integración documentadas                                 |
|                                                                           |
| - [ ] Aprobado por el product owner                                       |
+------------------+------------------+------------------+------------------+
| Estimación: 3    | Prioridad: Alta  | Módulo: Panel    | Deps: HU-OPE-005 |
| pts              |                  | Operadores       |                  |
+------------------+------------------+------------------+------------------+
| *📝 Nota técnica: En la fase inicial NO hay validación automática. El     |
| indicador se implementa en fase posterior.*                               |
+---------------------------------------------------------------------------+

+------------------+------------------+------------------+------------------+
| **HU-OPE-007 -- Panel Resumen de Toneladas por Camión**                   |
+---------------------------------------------------------------------------+
| **Como** operador de ReySil,                                              |
|                                                                           |
| **quiero** ver un resumen de toneladas por camión para una fecha          |
| específica,                                                               |
|                                                                           |
| **para** planificar la logística del día y verificar la carga de cada     |
| vehículo.                                                                 |
+---------------------------------------------------------------------------+
| **Criterios de Aceptación:**                                              |
|                                                                           |
| - [ ] Puedo seleccionar una fecha en un selector de fecha                 |
|                                                                           |
| - [ ] El sistema muestra una tabla con: Patente \| Chofer \| Total        |
|   Toneladas del día                                                       |
|                                                                           |
| - [ ] Si un mismo camión tiene múltiples repartos, la tabla muestra la    |
|   suma acumulada de toneladas                                             |
|                                                                           |
| - [ ] La tabla solo incluye camiones con repartos asignados para la fecha |
|   seleccionada                                                            |
|                                                                           |
| - [ ] Puedo exportar o imprimir la vista                                  |
|                                                                           |
| **Definición de Listo:**                                                  |
|                                                                           |
| - [ ] Código desarrollado y revisado                                      |
|                                                                           |
| - [ ] Tests unitarios escritos y pasando                                  |
|                                                                           |
| - [ ] Pruebas de integración documentadas                                 |
|                                                                           |
| - [ ] Aprobado por el product owner                                       |
+------------------+------------------+------------------+------------------+
| Estimación: 3    | Prioridad: Media | Módulo: Panel    | Deps: HU-OPE-002 |
| pts              |                  | Operadores       |                  |
+------------------+------------------+------------------+------------------+
| *📝 Nota técnica: Solo aplica para viajes de tipo Reparto (los de         |
| Contenedor no tienen toneladas).*                                         |
+---------------------------------------------------------------------------+

+------------------+------------------+------------------+------------------+
| **HU-OPE-008 -- Módulo de Reportes**                                      |
+---------------------------------------------------------------------------+
| **Como** operador de ReySil,                                              |
|                                                                           |
| **quiero** generar reportes de viajes por cliente y por chofer en un      |
| rango de fechas,                                                          |
|                                                                           |
| **para** analizar la actividad y el desempeño de la operación.            |
+---------------------------------------------------------------------------+
| **Criterios de Aceptación:**                                              |
|                                                                           |
| - [ ] Puedo seleccionar un rango de fechas para el reporte                |
|                                                                           |
| - [ ] Puedo ver la cantidad de viajes por cliente en el rango             |
|   seleccionado                                                            |
|                                                                           |
| - [ ] Puedo ver la cantidad de viajes por chofer en el rango seleccionado |
|                                                                           |
| - [ ] Los reportes pueden exportarse \[PENDIENTE CONFIRMAR FORMATO con    |
|   cliente\]                                                               |
|                                                                           |
| - [ ] Los datos están ordenados de mayor a menor cantidad de viajes       |
|                                                                           |
| **Definición de Listo:**                                                  |
|                                                                           |
| - [ ] Código desarrollado y revisado                                      |
|                                                                           |
| - [ ] Tests unitarios escritos y pasando                                  |
|                                                                           |
| - [ ] Pruebas de integración documentadas                                 |
|                                                                           |
| - [ ] Aprobado por el product owner                                       |
+------------------+------------------+------------------+------------------+
| Estimación: 3    | Prioridad: Media | Módulo: Panel    | Deps: HU-OPE-005 |
| pts              |                  | Operadores       |                  |
+------------------+------------------+------------------+------------------+
| *📝 Nota técnica: Confirmar con cliente los formatos de exportación       |
| (Excel, PDF, CSV).*                                                       |
+---------------------------------------------------------------------------+

**Subtotal del módulo: 25 puntos**

**Módulo: App Chofer**

Total: 6 historias \| 28 puntos

+------------------+------------------+------------------+------------------+
| **HU-CHO-001 -- Ver viajes asignados del día**                            |
+---------------------------------------------------------------------------+
| **Como** chofer de ReySil,                                                |
|                                                                           |
| **quiero** ver en la app todos los viajes que tengo asignados para hoy,   |
|                                                                           |
| **para** organizar mi jornada y saber qué entregas debo realizar.         |
+---------------------------------------------------------------------------+
| **Criterios de Aceptación:**                                              |
|                                                                           |
| - [ ] Al ingresar a la app veo inmediatamente la lista de viajes del día  |
|   ordenados por horario                                                   |
|                                                                           |
| - [ ] Cada viaje muestra: cliente, destino, tipo de viaje y estado actual |
|                                                                           |
| - [ ] Los viajes de días anteriores no aparecen en la vista principal     |
|   (solo los del día en curso)                                             |
|                                                                           |
| - [ ] Hay un ícono visible de acceso rápido a WhatsApp de los             |
|   administrativos de ReySil                                               |
|                                                                           |
| **Definición de Listo:**                                                  |
|                                                                           |
| - [ ] Código desarrollado y revisado                                      |
|                                                                           |
| - [ ] Tests unitarios escritos y pasando                                  |
|                                                                           |
| - [ ] Pruebas de integración documentadas                                 |
|                                                                           |
| - [ ] Aprobado por el product owner                                       |
+------------------+------------------+------------------+------------------+
| Estimación: 2    | Prioridad: Alta  | Módulo: App      | Deps: HU-OPE-002 |
| pts              |                  | Chofer           |                  |
+------------------+------------------+------------------+------------------+
| *📝 Nota técnica: Deep link a WhatsApp con número preconfigurado de       |
| ReySil.*                                                                  |
+---------------------------------------------------------------------------+

+------------------+------------------+------------------+------------------+
| **HU-CHO-002 -- Registro del turno diario**                               |
+---------------------------------------------------------------------------+
| **Como** chofer de ReySil,                                                |
|                                                                           |
| **quiero** registrar los hitos de mi turno diario,                        |
|                                                                           |
| **para** que ReySil tenga registro de mis horarios de inicio y fin de     |
| jornada.                                                                  |
+---------------------------------------------------------------------------+
| **Criterios de Aceptación:**                                              |
|                                                                           |
| - [ ] Puedo registrar: llegada al depósito ReySil, salida del depósito    |
|   ReySil, llegada al depósito destino, y fin de turno                     |
|                                                                           |
| - [ ] Cada registro captura automáticamente la fecha y hora del momento   |
|   en que presiono el botón                                                |
|                                                                           |
| - [ ] Los datos del turno quedan asociados a mi usuario y a la fecha del  |
|   día                                                                     |
|                                                                           |
| - [ ] La cantidad de viajes realizados en el día se registra              |
|   automáticamente                                                         |
|                                                                           |
| - [ ] Una vez registrado un hito, no puede modificarse desde la app       |
|                                                                           |
| **Definición de Listo:**                                                  |
|                                                                           |
| - [ ] Código desarrollado y revisado                                      |
|                                                                           |
| - [ ] Tests unitarios escritos y pasando                                  |
|                                                                           |
| - [ ] Pruebas de integración documentadas                                 |
|                                                                           |
| - [ ] Aprobado por el product owner                                       |
+------------------+------------------+------------------+------------------+
| Estimación: 3    | Prioridad: Alta  | Módulo: App      | Deps: HU-CHO-001 |
| pts              |                  | Chofer           |                  |
+------------------+------------------+------------------+------------------+

+------------------+------------------+------------------+------------------+
| **HU-CHO-003 -- Registro de datos por viaje**                             |
+---------------------------------------------------------------------------+
| **Como** chofer de ReySil,                                                |
|                                                                           |
| **quiero** registrar todos los datos de cada viaje que realizo,           |
|                                                                           |
| **para** que el cliente y los operadores tengan trazabilidad completa del |
| estado de su entrega.                                                     |
+---------------------------------------------------------------------------+
| **Criterios de Aceptación:**                                              |
|                                                                           |
| - [ ] Puedo registrar: hora de llegada a destino, hora de salida del      |
|   cliente, carga peligrosa (Sí/No), pernoctada (Sí/No), Km 50%, Km 100% y |
|   comentarios                                                             |
|                                                                           |
| - [ ] Si indico que hubo pernoctada, se habilita un campo de texto libre  |
|   para indicar el lugar                                                   |
|                                                                           |
| - [ ] Los datos quedan asociados al viaje seleccionado                    |
|                                                                           |
| - [ ] Al registrar datos, el estado del viaje cambia a \'En Curso\' en el |
|   sistema                                                                 |
|                                                                           |
| **Definición de Listo:**                                                  |
|                                                                           |
| - [ ] Código desarrollado y revisado                                      |
|                                                                           |
| - [ ] Tests unitarios escritos y pasando                                  |
|                                                                           |
| - [ ] Pruebas de integración documentadas                                 |
|                                                                           |
| - [ ] Aprobado por el product owner                                       |
+------------------+------------------+------------------+------------------+
| Estimación: 5    | Prioridad: Alta  | Módulo: App      | Deps: HU-CHO-001 |
| pts              |                  | Chofer           |                  |
+------------------+------------------+------------------+------------------+

+------------------+------------------+------------------+------------------+
| **HU-CHO-004 -- Fotografiar y subir remito**                              |
+---------------------------------------------------------------------------+
| **Como** chofer de ReySil,                                                |
|                                                                           |
| **quiero** fotografiar el remito firmado y subirlo desde la app,          |
|                                                                           |
| **para** dejar constancia digital de la entrega y notificar               |
| automáticamente al cliente.                                               |
+---------------------------------------------------------------------------+
| **Criterios de Aceptación:**                                              |
|                                                                           |
| - [ ] Puedo tomar una foto del remito firmado usando la cámara del        |
|   dispositivo                                                             |
|                                                                           |
| - [ ] En el momento de subir la foto, el sistema envía automáticamente un |
|   email al cliente con la imagen adjunta                                  |
|                                                                           |
| - [ ] El archivo se almacena en Google Drive con el nombre:               |
|   \[Cliente\]-\[Fecha\]-\[Código Secuencial\]                             |
|                                                                           |
| - [ ] La foto queda visible en el panel del operador                      |
|                                                                           |
| - [ ] Puedo subir una foto por viaje; si ya hay una, se me advierte antes |
|   de reemplazarla                                                         |
|                                                                           |
| **Definición de Listo:**                                                  |
|                                                                           |
| - [ ] Código desarrollado y revisado                                      |
|                                                                           |
| - [ ] Tests unitarios escritos y pasando                                  |
|                                                                           |
| - [ ] Pruebas de integración documentadas                                 |
|                                                                           |
| - [ ] Aprobado por el product owner                                       |
+------------------+------------------+------------------+------------------+
| Estimación: 5    | Prioridad: Alta  | Módulo: App      | Deps: HU-CHO-003 |
| pts              |                  | Chofer           |                  |
+------------------+------------------+------------------+------------------+
| *📝 Nota técnica: El trigger del email es el upload del chofer, NO la     |
| aprobación del operador.*                                                 |
+---------------------------------------------------------------------------+

+------------------+------------------+------------------+------------------+
| **HU-CHO-005 -- Inspección del camión al inicio del turno**               |
+---------------------------------------------------------------------------+
| **Como** chofer de ReySil,                                                |
|                                                                           |
| **quiero** completar la inspección del camión al inicio de mi turno,      |
|                                                                           |
| **para** registrar el estado del vehículo y cumplir con los requisitos de |
| seguridad.                                                                |
+---------------------------------------------------------------------------+
| **Criterios de Aceptación:**                                              |
|                                                                           |
| - [ ] La inspección presenta 5 secciones: Documentación, Estado del       |
|   Vehículo, Seguridad del Personal, Seguridad del Vehículo, Kit Derrames  |
|   y Otros                                                                 |
|                                                                           |
| - [ ] Cada ítem de cada sección se clasifica como Cumple o No Cumple      |
|                                                                           |
| - [ ] Puedo navegar entre secciones y volver atrás sin perder datos ya    |
|   ingresados                                                              |
|                                                                           |
| - [ ] Sección 1 (Documentación): ART, Seguro y Licencias, Cédula Verde,   |
|   RUTA y VTV                                                              |
|                                                                           |
| - [ ] Sección 2 (Estado del Vehículo): Cubiertas, Lonas, Luces, Elementos |
|   de Sujeción, Combustible/Aceite, Frenos, Limpieza                       |
|                                                                           |
| - [ ] Sección 3 (Seguridad del Personal): Vestimenta, Zapatos, Casco,     |
|   Guantes cuero, Guantes goma, Chaleco, Máscara, Botiquín                 |
|                                                                           |
| - [ ] Sección 4 (Seguridad del Vehículo): Balizas, Linternas, Cuarta de   |
|   remolque, Tacógrafo, Arrestallamas, Calzas, Alarma de retroceso         |
|                                                                           |
| - [ ] Sección 5 (Kit Derrames y Otros): Matafuego, Absorbente, Conos,     |
|   Bolsas, Cintas, Pala antichispa, Placas, Ausencia de fugas, Hoja de     |
|   seguridad                                                               |
|                                                                           |
| **Definición de Listo:**                                                  |
|                                                                           |
| - [ ] Código desarrollado y revisado                                      |
|                                                                           |
| - [ ] Tests unitarios escritos y pasando                                  |
|                                                                           |
| - [ ] Pruebas de integración documentadas                                 |
|                                                                           |
| - [ ] Aprobado por el product owner                                       |
+------------------+------------------+------------------+------------------+
| Estimación: 8    | Prioridad: Alta  | Módulo: App      | Deps: HU-CHO-001 |
| pts              |                  | Chofer           |                  |
+------------------+------------------+------------------+------------------+
| *📝 Nota técnica: Total: 4+7+8+7+9 = 35 ítems. Considerar scroll largo;   |
| evaluar paginación por sección.*                                          |
+---------------------------------------------------------------------------+

+------------------+------------------+------------------+------------------+
| **HU-CHO-006 -- Generar PDF de inspección del camión**                    |
+---------------------------------------------------------------------------+
| **Como** chofer de ReySil,                                                |
|                                                                           |
| **quiero** generar un PDF con el resultado de la inspección del camión,   |
|                                                                           |
| **para** tener un documento formal que acredite el estado del vehículo al |
| inicio del turno.                                                         |
+---------------------------------------------------------------------------+
| **Criterios de Aceptación:**                                              |
|                                                                           |
| - [ ] Al finalizar la inspección, existe un botón \'Generar PDF\'         |
|                                                                           |
| - [ ] El PDF incluye: nombre del chofer, patente del camión, fecha/hora,  |
|   y el resultado de todos los ítems de la inspección                      |
|                                                                           |
| - [ ] El PDF se almacena automáticamente en Google Drive con nombre:      |
|   \[Patente\]-\[Fecha\]                                                   |
|                                                                           |
| - [ ] El PDF se puede visualizar desde la app antes de subir              |
|                                                                           |
| - [ ] Una vez generado, la inspección no puede modificarse                |
|                                                                           |
| **Definición de Listo:**                                                  |
|                                                                           |
| - [ ] Código desarrollado y revisado                                      |
|                                                                           |
| - [ ] Tests unitarios escritos y pasando                                  |
|                                                                           |
| - [ ] Pruebas de integración documentadas                                 |
|                                                                           |
| - [ ] Aprobado por el product owner                                       |
+------------------+------------------+------------------+------------------+
| Estimación: 5    | Prioridad: Alta  | Módulo: App      | Deps: HU-CHO-005 |
| pts              |                  | Chofer           |                  |
+------------------+------------------+------------------+------------------+
| *📝 Nota técnica: Generación del PDF en el dispositivo o en el servidor.  |
| Evaluar según capacidad del dispositivo.*                                 |
+---------------------------------------------------------------------------+

**Subtotal del módulo: 28 puntos**

**Módulo: Notificaciones**

Total: 2 historias \| 5 puntos

+------------------+------------------+------------------+------------------+
| **HU-NOT-001 -- Notificación email: Chofer y patente asignados**          |
+---------------------------------------------------------------------------+
| **Como** sistema,                                                         |
|                                                                           |
| **quiero** enviar un email automático al cliente cuando se confirma un    |
| chofer y patente para su viaje,                                           |
|                                                                           |
| **para** que el cliente sepa quién y con qué camión se realizará su       |
| entrega.                                                                  |
+---------------------------------------------------------------------------+
| **Criterios de Aceptación:**                                              |
|                                                                           |
| - [ ] El email se envía automáticamente cuando el operador confirma la    |
|   asignación                                                              |
|                                                                           |
| - [ ] El email incluye: nombre del chofer, patente del camión, tipo de    |
|   viaje, destino y fecha estimada                                         |
|                                                                           |
| - [ ] El email llega a todos los emails registrados para ese cliente      |
|                                                                           |
| - [ ] El subject del email es descriptivo: ej. \'ReySil -- Chofer         |
|   asignado para tu envío \[Destino\] -- \[Fecha\]\'                       |
|                                                                           |
| - [ ] Si el chofer es reasignado, se envía un nuevo email con los datos   |
|   actualizados                                                            |
|                                                                           |
| **Definición de Listo:**                                                  |
|                                                                           |
| - [ ] Código desarrollado y revisado                                      |
|                                                                           |
| - [ ] Tests unitarios escritos y pasando                                  |
|                                                                           |
| - [ ] Pruebas de integración documentadas                                 |
|                                                                           |
| - [ ] Aprobado por el product owner                                       |
+------------------+------------------+------------------+------------------+
| Estimación: 2    | Prioridad: Alta  | Módulo:          | Deps: HU-OPE-002 |
| pts              |                  | Notificaciones   |                  |
+------------------+------------------+------------------+------------------+
| *📝 Nota técnica: Servicio de email: SMTP / SendGrid (a confirmar con     |
| cliente).*                                                                |
+---------------------------------------------------------------------------+

+------------------+------------------+------------------+------------------+
| **HU-NOT-002 -- Notificación email: Remito subido**                       |
+---------------------------------------------------------------------------+
| **Como** sistema,                                                         |
|                                                                           |
| **quiero** enviar un email automático al cliente en el momento en que el  |
| chofer sube el remito firmado,                                            |
|                                                                           |
| **para** notificar la confirmación de entrega inmediatamente con el       |
| comprobante adjunto.                                                      |
+---------------------------------------------------------------------------+
| **Criterios de Aceptación:**                                              |
|                                                                           |
| - [ ] El email se envía en el momento exacto en que el chofer sube la     |
|   foto del remito                                                         |
|                                                                           |
| - [ ] El email incluye la imagen del remito como archivo adjunto          |
|                                                                           |
| - [ ] El email incluye: datos del viaje (cliente, destino, fecha, chofer, |
|   patente)                                                                |
|                                                                           |
| - [ ] El email llega a todos los emails registrados para ese cliente      |
|                                                                           |
| - [ ] El subject: ej. \'ReySil -- Confirmación de entrega \[Destino\] --  |
|   \[Fecha\]\'                                                             |
|                                                                           |
| **Definición de Listo:**                                                  |
|                                                                           |
| - [ ] Código desarrollado y revisado                                      |
|                                                                           |
| - [ ] Tests unitarios escritos y pasando                                  |
|                                                                           |
| - [ ] Pruebas de integración documentadas                                 |
|                                                                           |
| - [ ] Aprobado por el product owner                                       |
+------------------+------------------+------------------+------------------+
| Estimación: 3    | Prioridad: Alta  | Módulo:          | Deps: HU-CHO-004 |
| pts              |                  | Notificaciones   |                  |
+------------------+------------------+------------------+------------------+
| *📝 Nota técnica: Este email NO espera validación del operador; se        |
| dispara directamente desde el upload del chofer.*                         |
+---------------------------------------------------------------------------+

**Subtotal del módulo: 5 puntos**

**Resumen Final por Módulo**

  ------------------- --------------- ------------ ------------------
  **Módulo**          **Cant.         **Total      **Sprints
                      Historias**     Puntos**     Estimados**

  Autenticación       2               5            0.3

  Administración      2               8            0.4

  Portal Cliente      5               23           1.1

  Panel Operadores    8               25           1.3

  App Chofer          6               28           1.4

  Notificaciones      2               5            0.3

  TOTAL               25              94           4.7 sprints
  ------------------- --------------- ------------ ------------------

*--- Fin del Documento de Historias de Usuario ---*
