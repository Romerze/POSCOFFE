# 7. Modelo de datos

## 7.1 Diagrama de entidades (relaciones)

```
Local ──< Usuario >── Rol
  │         │
  │         └──< Turno >── Caja ──< MovimientoCaja
  │
  ├──< Categoria ──< Producto ──< Variante
  │                     │           │
  │                     │           └──< Receta >── Insumo ──< Inventario(Local)
  │                     │
  │                     └──< ProductoModificadorGrupo ──< Modificador
  │
  ├──< Pedido ──< DetallePedido ──< DetalleModificador
  │      │            └── (Producto/Variante)
  │      ├──< Pago
  │      └── Cliente
  │
  ├──< Promocion ──< PromocionRegla
  ├──< Proveedor ──< Reposicion >── Insumo
  ├──< Merma >── Insumo
  └──< AlertaStock

Cliente ──< Fidelizacion(cuenta de puntos)
   │            └──< MovimientoPuntos
   └──< Suscripcion ──< ConsumoSuscripcion
```

Leyenda: `──<` = uno a muchos; `>──` = muchos a uno; las entidades transaccionales y de catálogo llevan `local_id`.

## 7.2 Entidades principales

### Identidad y acceso
- **Local**: `id, nombre, direccion, timezone, moneda, activo, config(json)`.
- **Usuario**: `id, local_id?, nombre, email, password_hash, pin_hash, rol_id, activo`. (`local_id` null = acceso multi-local, p.ej. dueño).
- **Rol**: `id, nombre, permisos(json)`. Roles base: Dueño, Administrador, Cajero, Barista, Cliente.

### Catálogo
- **Categoria**: `id, local_id, nombre, orden, icono`.
- **Producto**: `id, local_id, categoria_id, nombre, descripcion, imagen, activo, es_combo`.
- **Variante**: `id, producto_id, nombre (ej. "Grande"), sku, precio, costo_calculado`.
- **Modificador**: `id, nombre (ej. "Leche de avena"), precio_extra, insumo_id?, cantidad_insumo`.
- **ModificadorGrupo**: `id, nombre, seleccion (unica|multiple), min, max, obligatorio`.
- **ProductoModificadorGrupo**: relación producto ↔ grupos de modificadores aplicables.

### Inventario y recetas
- **Insumo**: `id, nombre, unidad (g, ml, u), costo_unitario, perecedero, vida_util_dias`.
- **Receta**: `id, variante_id, insumo_id, cantidad`. (Define el descuento de stock por venta.)
- **Inventario**: `id, local_id, insumo_id, stock_actual, stock_minimo, punto_reorden`.
- **Proveedor**: `id, nombre, contacto, condiciones`.
- **Reposicion**: `id, local_id, insumo_id, proveedor_id, cantidad, costo, fecha, usuario_id`.
- **Merma**: `id, local_id, insumo_id, cantidad, motivo, costo, fecha, usuario_id`.
- **AlertaStock**: `id, local_id, insumo_id, tipo, estado, creada_en`.

### Ventas
- **Pedido**: `id(uuid), local_id, cliente_id?, usuario_id, canal (mostrador|qr|pickup|delivery), mesa?, estado, subtotal, descuento, total, creado_en, operation_id`.
- **DetallePedido**: `id, pedido_id, variante_id, cantidad, precio_unit, subtotal, notas`.
- **DetalleModificador**: `id, detalle_pedido_id, modificador_id, precio_extra`.
- **Pago**: `id, pedido_id, metodo, monto, propina, referencia, estado, proveedor`.

### Clientes y fidelización
- **Cliente**: `id, nombre, telefono, email, fecha_registro, segmento, es_vip, preferencias(json)`.
- **Fidelizacion**: `id, cliente_id, puntos, nivel, actualizado_en`.
- **MovimientoPuntos**: `id, cliente_id, pedido_id?, tipo (gana|canjea|ajuste), puntos, fecha`.
- **Suscripcion**: `id, cliente_id, plan, estado, inicio, fin, limite_consumos, precio`.
- **ConsumoSuscripcion**: `id, suscripcion_id, pedido_id, fecha`.

### Promociones
- **Promocion**: `id, local_id?, nombre, tipo (descuento|combo|hora_valle|nxm), vigencia_desde, vigencia_hasta, prioridad, activa`.
- **PromocionRegla**: `id, promocion_id, condicion(json) (franja, stock, segmento, producto), efecto(json)`.

### Operación de caja
- **Turno**: `id, local_id, usuario_id, apertura, cierre, estado`.
- **Caja**: `id, local_id, nombre, estado`.
- **MovimientoCaja**: `id, caja_id, turno_id, tipo (apertura|venta|retiro|cierre), monto, fecha`.

## 7.3 Relaciones clave (reglas de integridad)

- Un **Pedido** pertenece a un **Local**, opcionalmente a un **Cliente**, y a un **Usuario** (cajero).
- Cada **DetallePedido** referencia una **Variante**; sus **DetalleModificador** referencian **Modificadores**.
- La **Variante** tiene una **Receta** (1..n insumos) → al confirmarse el pedido, se descuenta **Inventario** del **Local** por cada insumo (incluyendo los de modificadores).
- El **costo_calculado** de la variante = Σ(cantidad receta × costo_unitario insumo); permite margen por producto.
- **Fidelizacion** es 1:1 con **Cliente**; los puntos se mueven vía **MovimientoPuntos** ligados a un **Pedido**.
- **Suscripcion** valida cada **ConsumoSuscripcion** contra `limite_consumos` y vigencia.
- **Promocion**/**PromocionRegla** se evalúan sobre el carrito; el descuento se refleja en `Pedido.descuento`.
- Todo movimiento de stock (venta, reposición, merma, ajuste, transferencia) es **append-only** para auditoría y sincronización por deltas.

## 7.4 Esquema SQL (extracto representativo)

> Esquema completo y migraciones se generarán con Prisma. Extracto del núcleo de venta + inventario:

```sql
CREATE TABLE local (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre        TEXT NOT NULL,
  timezone      TEXT NOT NULL DEFAULT 'America/Lima',
  moneda        TEXT NOT NULL DEFAULT 'PEN',
  config        JSONB NOT NULL DEFAULT '{}',
  activo        BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE producto (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  local_id      UUID NOT NULL REFERENCES local(id),
  categoria_id  UUID NOT NULL REFERENCES categoria(id),
  nombre        TEXT NOT NULL,
  es_combo      BOOLEAN NOT NULL DEFAULT FALSE,
  activo        BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE variante (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id   UUID NOT NULL REFERENCES producto(id) ON DELETE CASCADE,
  nombre        TEXT NOT NULL,
  sku           TEXT,
  precio        NUMERIC(10,2) NOT NULL,
  costo_calculado NUMERIC(10,2) NOT NULL DEFAULT 0
);

CREATE TABLE insumo (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre        TEXT NOT NULL,
  unidad        TEXT NOT NULL,
  costo_unitario NUMERIC(10,4) NOT NULL,
  perecedero    BOOLEAN NOT NULL DEFAULT FALSE,
  vida_util_dias INT
);

CREATE TABLE receta (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variante_id   UUID NOT NULL REFERENCES variante(id) ON DELETE CASCADE,
  insumo_id     UUID NOT NULL REFERENCES insumo(id),
  cantidad      NUMERIC(10,4) NOT NULL,
  UNIQUE (variante_id, insumo_id)
);

CREATE TABLE inventario (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  local_id      UUID NOT NULL REFERENCES local(id),
  insumo_id     UUID NOT NULL REFERENCES insumo(id),
  stock_actual  NUMERIC(12,4) NOT NULL DEFAULT 0,
  stock_minimo  NUMERIC(12,4) NOT NULL DEFAULT 0,
  punto_reorden NUMERIC(12,4) NOT NULL DEFAULT 0,
  UNIQUE (local_id, insumo_id)
);

CREATE TABLE pedido (
  id            UUID PRIMARY KEY,              -- UUID v7 generado en cliente
  operation_id  UUID NOT NULL UNIQUE,          -- idempotencia de sync
  local_id      UUID NOT NULL REFERENCES local(id),
  cliente_id    UUID REFERENCES cliente(id),
  usuario_id    UUID NOT NULL REFERENCES usuario(id),
  canal         TEXT NOT NULL CHECK (canal IN ('mostrador','qr','pickup','delivery')),
  estado        TEXT NOT NULL DEFAULT 'pendiente',
  subtotal      NUMERIC(10,2) NOT NULL,
  descuento     NUMERIC(10,2) NOT NULL DEFAULT 0,
  total         NUMERIC(10,2) NOT NULL,
  creado_en     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE detalle_pedido (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id     UUID NOT NULL REFERENCES pedido(id) ON DELETE CASCADE,
  variante_id   UUID NOT NULL REFERENCES variante(id),
  cantidad      INT NOT NULL CHECK (cantidad > 0),
  precio_unit   NUMERIC(10,2) NOT NULL,
  subtotal      NUMERIC(10,2) NOT NULL,
  notas         TEXT
);

CREATE TABLE movimiento_stock (        -- append-only, sync por deltas
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  local_id      UUID NOT NULL REFERENCES local(id),
  insumo_id     UUID NOT NULL REFERENCES insumo(id),
  tipo          TEXT NOT NULL CHECK (tipo IN ('venta','reposicion','merma','ajuste','transferencia')),
  delta         NUMERIC(12,4) NOT NULL,        -- negativo descuenta
  ref_id        UUID,                          -- pedido/reposicion/merma
  creado_en     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pedido_local_fecha ON pedido(local_id, creado_en);
CREATE INDEX idx_movstock_local_insumo ON movimiento_stock(local_id, insumo_id);
```

> Nota: `inventario.stock_actual` se mantiene como agregado de `movimiento_stock` (deltas), lo que hace la sincronización conmutativa y resistente a múltiples cajas offline.

---

➡️ Siguiente: [Reglas de negocio](08-reglas-negocio.md)
