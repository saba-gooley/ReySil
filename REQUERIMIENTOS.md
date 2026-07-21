# Requerimientos — ReySil

<!-- Nuevas entradas se agregan arriba (prepend) -->

## 2026-07-21 — Edicion de solicitudes de Reparto segun estado
**Tipo:** A
**Descripcion:** El sistema debe permitir editar los viajes cuando estan en estado pendiente o chofer asignado. No debe permitirlo cuando esta en Curso o Finalizado.

**Alcance acotado en la aprobacion:** solo viajes tipo REPARTO. La edicion de CONTENEDOR
(que se hace a nivel reserva, no de viaje) queda diferida — el analisis y las decisiones
ya estan cerradas y documentadas.

**Definiciones tomadas:**
- Estados editables: PENDIENTE, PREASIGNADO, ASIGNADO. Bloqueado en EN_CURSO y FINALIZADO.
- Editan operador, admin y el propio cliente desde su portal.
- Se pueden agregar, editar, reordenar y quitar destinos, incluida la conversion de
  destino unico a multi-destino y viceversa.
- Cuando edita el cliente se manda mail a ReySil. Cuando edita el operador, no.
- El viaje no cambia de dueno ni de estado al editarse.

**Criterios de aceptacion:**
- Un Reparto en PENDIENTE, PREASIGNADO o ASIGNADO se puede editar desde el panel de
  operadores y desde el portal del cliente; los cambios quedan guardados y visibles en ambos.
- Un Reparto EN_CURSO o FINALIZADO no ofrece editar, y una llamada directa a la Server
  Action es rechazada — la validacion es server-side, no solo de UI.
- Se pueden agregar destinos a un Reparto de destino unico (queda multi-destino), y
  agregar/editar/reordenar/quitar en uno que ya lo es.
- Cuando el cliente edita se envia mail a ReySil; cuando edita el operador no se envia nada.
- Un cliente no puede editar viajes de otro cliente ni un viaje EN_CURSO, bloqueado por
  RLS ademas de por la action.
