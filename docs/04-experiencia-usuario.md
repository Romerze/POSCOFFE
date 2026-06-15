# 4. Experiencia de usuario

## 4.1 Roles y su experiencia

### 👤 Cajero
**Objetivo:** atender rápido y sin errores.
- Pantalla principal = toma de pedidos. Todo a ≤2 toques de los productos top.
- Identifica al cliente en 1 toque (teléfono/QR) y ve su "como siempre" + sugerencias.
- Cobro integrado (efectivo/tarjeta/QR digital), división de cuenta y propina.
- Modo *rush hour* para pico. No necesita capacitación larga: la curva objetivo es <30 min.

### ☕ Barista
**Objetivo:** preparar en orden y a tiempo.
- KDS a pantalla completa, sin teclado: toca para avanzar estado.
- Ve modificadores destacados (leche de avena, descafeinado) para no equivocarse.
- Cronómetro y semáforo por pedido; los atrasados saltan al frente.
- Marca "listo" → dispara llamado en pantalla de cliente.

### 🛠️ Administrador (de local)
**Objetivo:** mantener catálogo, inventario y personal.
- Gestiona productos, recetas, modificadores, precios y promociones.
- Controla inventario, reposiciones, merma y alertas.
- Abre/cierra turnos, gestiona empleados y cajas.
- Ve reportes operativos de su local.

### 🙋 Cliente final
**Objetivo:** pedir fácil y ser reconocido.
- Pide por **QR en mesa** o **pick-up** desde su móvil, sin instalar nada (web).
- Ve su historial, puntos, retos y recompensas en **POSCOFFE Club**.
- Recibe "tu café ideal" y promos personalizadas; paga en línea o en caja.
- Responde encuesta de 1 toque tras la compra.

### 💼 Dueño del negocio
**Objetivo:** decidir con datos, desde cualquier lugar.
- **POSCOFFE Insights**: dashboard consolidado multi-local en móvil/desktop.
- KPIs en vivo, márgenes por producto, mapa de calor, ranking de baristas.
- Alertas de stock crítico, anomalías de venta y merma.
- Define estrategia de promociones, fidelización y suscripciones.

---

## 4.2 Flujos principales

### Flujo 1 — Venta rápida en mostrador 🟢
1. Cajero abre POSCOFFE (turno/caja ya abiertos).
2. Toca productos del catálogo → se arman en el ticket.
3. (Opcional) Identifica cliente → suma puntos.
4. Toca **Cobrar** → elige método → confirma.
5. Imprime ticket / envía comanda al KDS. Total: pocos segundos.

### Flujo 2 — Pedido personalizado de bebida 🟢
1. Cajero toca la bebida → se abre el panel de modificadores.
2. Selecciona tamaño, leche, temperatura, extras (precio y receta se ajustan).
3. Confirma ítem → vuelve al catálogo o cobra.
4. El KDS muestra el detalle de personalización al barista.

### Flujo 3 — Pedido por QR (mesa) 🔵
1. Cliente escanea el QR de la mesa → abre el menú web.
2. Arma su pedido con modificadores y lo envía.
3. Entra a la cuenta de la mesa y al KDS automáticamente.
4. Paga en línea o pide la cuenta a caja.

### Flujo 4 — Pedido para recoger (pick-up) 🔵
1. Cliente pide desde QR genérico/app y paga en línea.
2. El pedido entra al KDS con etiqueta "pick-up" y hora estimada.
3. Al estar listo, la pantalla de cliente / notificación avisa.
4. Cliente recoge mostrando su código.

### Flujo 5 — Cliente frecuente con recompensas 🔵
1. Cajero identifica al cliente (teléfono/QR).
2. POSCOFFE muestra puntos, nivel, "como siempre" y recompensas disponibles.
3. Cliente canjea o acumula; se aplica promo personalizada si corresponde.
4. Tras la compra: encuesta y actualización de puntos/retos.

### Flujo 6 — Cierre de caja 🟢
1. Cajero/admin selecciona **Cerrar caja**.
2. Sistema muestra ventas por método de pago vs efectivo contado.
3. Se registra diferencia (sobrante/faltante) y se cierra el turno.
4. Reporte de cierre (Z) disponible para el dueño.

### Flujo 7 — Reposición de inventario 🟢
1. Admin recibe alerta de insumo crítico.
2. Abre el insumo → ve consumo medio y cantidad sugerida.
3. Registra reposición (cantidad, costo, proveedor) → stock actualizado.
4. Se recalcula el costeo y el punto de reorden.

### Flujo 8 — Creación de promociones 🔵
1. Admin/dueño crea una promo: tipo (descuento, combo, hora valle), condición y vigencia.
2. Define alcance (producto, categoría, segmento, local) y prioridad.
3. Activa → el motor de promociones la evalúa en cada carrito.
4. Mide resultados en el dashboard.

---

➡️ Siguiente: [Diseño visual](05-diseno-visual.md)
