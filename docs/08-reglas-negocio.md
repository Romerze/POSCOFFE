# 8. Reglas de negocio

## 8.1 Precios

- El precio base vive en la **Variante** (no en el Producto): cada tamaño/presentación tiene su precio.
- **Modificadores** suman `precio_extra` al ítem.
- El precio final del ítem = `precio_variante + Σ(modificadores)`; el del pedido = `Σ(ítems) − descuentos + propina`.
- Los precios pueden diferir **por local** (un mismo producto, distinto precio por sede).
- Cambios de precio quedan versionados; los pedidos guardan el precio aplicado (no se recalculan retroactivamente).

## 8.2 Promociones

- Una promo se aplica solo si está **activa** y dentro de **vigencia**.
- Cada promo tiene **prioridad**; ante varias aplicables, gana la de mayor prioridad.
- **Combinabilidad** explícita: una promo declara si es acumulable o exclusiva. Por defecto, **no acumulable**.
- Tipos: descuento %/monto, combo (precio especial del conjunto), NxM (3x2), hora valle (por franja), por segmento de cliente, por exceso/caducidad de stock.
- Una promo de **hora valle** solo aplica en la franja configurada y se desactiva sola fuera de ella.
- El descuento total no puede dejar el ítem en precio negativo.

## 8.3 Stock

- El stock es **por insumo y por local**.
- Se descuenta al **confirmar** el pedido (no al abrirlo), incluyendo insumos de modificadores.
- Si un insumo llega a 0, las variantes cuya receta lo requiere se marcan **no disponibles** automáticamente (configurable: bloquear venta o permitir con alerta).
- Movimientos de stock son **append-only** (deltas); el stock actual es su suma. Esto permite varias cajas offline sin pisarse.
- Transferencias entre locales generan dos movimientos (salida en origen, entrada en destino).

## 8.4 Inventario por receta

- Cada **Variante** tiene una **Receta** (insumo + cantidad).
- Vender 1 unidad descuenta `cantidad × n` de cada insumo.
- El **costo** de la variante se recalcula al cambiar la receta o el costo de un insumo → alimenta el margen.
- Combos descuentan la receta de **todos** sus componentes y validan stock de cada uno.

## 8.5 Puntos de fidelización

- Se otorgan puntos por monto gastado (ratio configurable, ej. 1 punto por S/1).
- Los puntos se acreditan al **pagar** el pedido; se revierten si el pedido se anula/devuelve.
- **Niveles (tiers)** según puntos/gasto acumulado; cada nivel define beneficios.
- Recompensas tienen costo en puntos y stock/limite opcional; el canje genera `MovimientoPuntos` tipo `canjea`.
- Puntos con **caducidad** configurable (ej. 12 meses sin actividad).

## 8.6 Suscripciones

- Una suscripción activa permite consumos según su plan (ilimitado o `limite_consumos`).
- Cada consumo válido registra `ConsumoSuscripcion` y descuenta del límite.
- Restricciones por plan: productos elegibles, máximo por día, franjas.
- Renovación automática al vencer (si el pago recurrente está activo) o expira.
- Un consumo cubierto por suscripción **no** genera cobro pero **sí** descuenta inventario por receta.

## 8.7 Descuentos

- Descuentos automáticos (promos) vs **manuales** (cajero).
- El descuento manual requiere **rol/PIN autorizado** y motivo; queda en auditoría.
- Límite máximo de descuento manual configurable por rol.

## 8.8 Cancelaciones

- Un pedido **no pagado** puede cancelarse libremente antes de confirmarse.
- Cancelar un pedido ya confirmado **revierte** los movimientos de stock (movimiento de ajuste positivo).
- Cancelaciones tras pago se tratan como **devolución** (8.9).
- Toda cancelación registra usuario, motivo y hora.

## 8.9 Devoluciones

- Devolución total o parcial de ítems pagados.
- Genera movimiento de caja negativo (o nota de crédito) y revierte puntos otorgados.
- El stock se reincorpora **solo** si el producto no fue consumido/preparado (decisión del operador, registrada).
- Requiere autorización y motivo.

## 8.10 Cierre de caja

- El cierre compara **ventas esperadas por método** vs **efectivo contado**.
- Registra sobrante/faltante y bloquea nuevas ventas en esa caja hasta reapertura.
- Genera reporte Z (totales del turno) inmutable.
- No se puede cerrar caja con pedidos abiertos/sin pagar (deben resolverse antes).

## 8.11 Turnos

- Un turno se abre con monto inicial (fondo de caja) y un empleado responsable.
- Cambios de operador en el turno usan **PIN** (quedan registrados por venta).
- El cierre de turno exige cierre de caja; las métricas del turno alimentan el ranking de baristas.

## 8.12 Alertas automáticas

- **Stock crítico**: al cruzar `stock_minimo` o `punto_reorden`.
- **Quiebre proyectado**: consumo medio indica agotamiento próximo.
- **Merma alta**: merma de un insumo supera umbral en un periodo.
- **Anomalía de venta**: caída/pico atípico vs media de la franja.
- **Demora en KDS**: pedido supera el tiempo objetivo.
- **Caja**: faltante/sobrante sobre umbral en el cierre.
- Las alertas se evalúan en workers async y se entregan por dashboard/notificación según severidad.

---

➡️ Siguiente: [MVP y roadmap](09-mvp-roadmap.md)
