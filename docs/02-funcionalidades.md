# 2. Funcionalidades innovadoras

Cada módulo lleva una etiqueta de fase coherente con el [roadmap](09-mvp-roadmap.md):

- 🟢 **MVP** — indispensable para lanzar.
- 🔵 **Fase 2** — diferenciador temprano, post-lanzamiento.
- 🟣 **Visión** — requiere datos/madurez (típicamente algoritmos).

---

## 2.1 Toma de pedidos rápida e inteligente 🟢

- Catálogo en grilla por categorías con búsqueda y favoritos.
- **Atajos**: productos más vendidos por franja horaria al frente.
- Ticket en construcción siempre visible, edición inline de cantidades y modificadores.
- **Modo *rush hour*** (ver [diferenciales](03-diferenciales.md)) que simplifica la pantalla a los 12-20 productos top.
- Teclas rápidas / lector de código y, más adelante, **pedido por voz** para el cajero (🟣).

## 2.2 Personalización avanzada de bebidas 🟢

- Sistema de **modificadores** estructurado: tamaño, tipo de leche, temperatura, nivel de azúcar, shots extra, siropes, toppings.
- Modificadores con **impacto en precio** y **en receta/inventario** (un shot extra descuenta gramos de café).
- Grupos de modificadores con reglas: obligatorio/opcional, selección única/múltiple, mín/máx.
- "Como siempre": recupera la última personalización de un cliente frecuente (🔵).

## 2.3 Sugerencias automáticas según historial del cliente 🔵

- Al identificar al cliente, propone su pedido habitual y complementos frecuentes.
- Arranca con **reglas** (producto más comprado, combos frecuentes); evoluciona a modelo de recomendación (🟣).

## 2.4 Predicción de demanda por hora, día, clima o temporada 🟣

- Estimación de demanda por franja para preparar insumos y personal.
- **Arranque heurístico**: medias móviles por día de semana y franja horaria; factor manual de temporada.
- Evolución: modelo que incorpora clima (API externa) y eventos. Requiere histórico (~2-3 meses).

## 2.5 Control de inventario en tiempo real 🟢

- Stock por **insumo** (no solo por producto) descontado vía **receta** en cada venta.
- Stock por **local**; visibilidad consolidada multi-sede.
- Movimientos: venta, reposición, ajuste, merma, transferencia entre locales.

## 2.6 Alertas inteligentes de insumos críticos 🟢

- Umbrales por insumo y local (mínimo, punto de reorden).
- Alertas en dashboard y notificación; sugerencia de cantidad a reponer según consumo medio.

## 2.7 Programa de fidelización moderno 🟢 (base) / 🔵 (avanzado)

- Puntos por compra, niveles (tiers) y recompensas canjeables.
- Identificación por teléfono/QR/app; sin tarjetas físicas.
- Avanzado: retos, cumpleaños, beneficios por nivel, gamificación (🔵, ver [diferenciales](03-diferenciales.md)).

## 2.8 Pedidos por QR desde mesa o para recoger 🔵

- QR por mesa (consumo en local) y QR genérico (pick-up).
- El cliente arma su pedido desde el móvil; entra directo al KDS y a la cuenta.
- Pago en línea o en caja según configuración.

## 2.9 Pantalla de cocina/barista en tiempo real (KDS) 🟢

- Cola de pedidos en vivo por estación (barra, cocina).
- Estados: pendiente → en preparación → listo → entregado.
- **Cronómetro por pedido** y semáforo de tiempos para reducir esperas.
- Actualización vía WebSockets; funciona en la red local aunque caiga internet.

## 2.10 Integración con pagos digitales 🟢

- Efectivo, tarjeta y **billeteras/QR digitales** (Yape/Plin/Mercado Pago u otros según país).
- Pagos divididos y propinas.
- Arquitectura de **pasarela desacoplada** (adaptador) para añadir proveedores sin tocar el núcleo.

## 2.11 Reportes inteligentes para el dueño 🟢 (base) / 🔵 (avanzado)

- Ventas por periodo, producto, categoría, local, canal, método de pago.
- Márgenes por producto (gracias al costeo por receta).
- Avanzado: comparativas, tendencias, alertas de anomalías.

## 2.12 Dashboard con métricas clave 🟢

- KPIs en vivo: ventas del día, ticket promedio, productos top, tiempo medio de preparación, alertas de stock.
- Vista por local y consolidada.

## 2.13 Promociones dinámicas (stock, horario, comportamiento) 🔵

- Reglas configurables: descuento por **hora valle**, por **exceso de stock** o **próximo a vencer**, por segmento de cliente.
- Motor de promociones evaluado en el carrito; combinación y prioridad de reglas controladas.

## 2.14 Gestión de combos y upselling automático 🔵

- Combos con precio especial y validación de inventario de todos sus componentes.
- Upsell sugerido en el ticket ("¿agregar un pan por S/X?") según producto y franja.

## 2.15 Perfil de clientes frecuentes 🔵

- Ficha con historial, gasto, frecuencia, preferencias y nivel de fidelización.
- Base para segmentación, recomendaciones y campañas.

## 2.16 Modo offline para seguir vendiendo sin internet 🟢

- **Offline-first**: la caja sigue registrando ventas, imprimiendo y alimentando el KDS local sin conexión.
- Cola de operaciones que sincroniza al volver la conexión (ver [arquitectura](06-arquitectura.md)).

## 2.17 Integración con delivery 🔵

- Pedidos de canal delivery (propio o agregadores) unificados en el mismo flujo y KDS.
- Estados de despacho y tiempos diferenciados por canal.

## 2.18 Gestión de turnos y desempeño del personal 🔵

- Apertura/cierre de turno por empleado, asignación a caja.
- Métricas por turno: ventas, ticket medio, tiempos; base del **ranking de baristas** (🔵).

---

➡️ Siguiente: [Funcionalidades diferenciales](03-diferenciales.md)
