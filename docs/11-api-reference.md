# 11. Referencia de API (estado real implementado)

> Fuente de verdad de los endpoints expuestos por el backend (NestJS).
> Generada a partir del código en `server/src/**/*.controller.ts`.
> Base URL: **`/api/v1`** · Tiempo real: **WebSocket (Socket.IO)** en la raíz del server.

## Convenciones

- **Auth**: salvo que se marque 🌐 **Público**, todos los endpoints requieren `Authorization: Bearer <accessToken>`.
- **Permiso**: si se indica, además del JWT se exige ese permiso (RBAC). Roles → permisos por defecto en [`@poscoffe/types`](../packages/types/src/roles.ts).
- **`?local=<id>`**: muchas consultas se filtran por local (multi-local).
- Montos: `Decimal` serializado como string (p. ej. `"12.00"`).

---

## Auth — `/auth`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/auth/login` | 🌐 Público | Login por email+password → `{accessToken, refreshToken, user}` |
| POST | `/auth/pin` | 🌐 Público | Login rápido por `{userId, pin}` |
| POST | `/auth/refresh` | 🌐 Público | Renueva tokens con `{refreshToken}` |
| GET | `/auth/me` | JWT | Devuelve el payload del usuario autenticado |

## Locales — `/locals`

| Método | Ruta | Permiso | Descripción |
|--------|------|---------|-------------|
| GET | `/locals` | — | Lista locales |
| GET | `/locals/:id` | — | Detalle de un local |
| POST | `/locals` | `locals:manage` | Crea local |
| PATCH | `/locals/:id` | `locals:manage` | Actualiza local |

## Catálogo

| Método | Ruta | Permiso | Descripción |
|--------|------|---------|-------------|
| GET | `/categorias?local=` | — | Categorías del local |
| POST | `/categorias` | `catalog:manage` | Crea categoría |
| PATCH | `/categorias/:id` | `catalog:manage` | Actualiza categoría |
| GET | `/productos?local=` | — | Productos del local (con variantes y categoría) |
| GET | `/productos/:id` | — | Producto con variantes y grupos de modificadores |
| POST | `/productos` | `catalog:manage` | Crea producto (`esCombo` opcional) |
| PATCH | `/productos/:id` | `catalog:manage` | Actualiza producto |
| POST | `/variantes` | `catalog:manage` | Crea variante (precio) |
| PATCH | `/variantes/:id` | `catalog:manage` | Actualiza variante |
| GET | `/variantes/:id/receta` | — | Receta de la variante |
| PUT | `/variantes/:id/receta` | `catalog:manage` | Reemplaza receta y recostea |
| GET | `/variantes/:id/combo` | — | Componentes de un combo |
| PUT | `/variantes/:id/combo` | `catalog:manage` | Define componentes del combo y recostea |
| GET | `/variantes/:id/upsell?local=` | — | Sugerencias "comprado junto con" |
| POST | `/modificador-grupos` | `catalog:manage` | Crea grupo de modificadores |
| POST | `/modificadores` | `catalog:manage` | Crea modificador |
| POST | `/producto-modificador-grupos` | `catalog:manage` | Enlaza grupo de modificadores a producto |

## Inventario

| Método | Ruta | Permiso | Descripción |
|--------|------|---------|-------------|
| GET | `/insumos` | — | Lista insumos |
| POST | `/insumos` | `inventory:manage` | Crea insumo |
| PATCH | `/insumos/:id` | `inventory:manage` | Actualiza insumo (recostea variantes si cambia costo) |
| GET | `/inventario?local=` | — | Stock por insumo del local |
| PUT | `/inventario/:local/:insumo/umbrales` | `inventory:manage` | Define mínimo / punto de reorden |
| POST | `/inventario/reposiciones` | `inventory:manage` | Registra reposición (suma stock) |
| POST | `/inventario/mermas` | `inventory:manage` | Registra merma (resta stock, costeada) |
| POST | `/inventario/ajustes` | `inventory:manage` | Ajuste manual de stock (delta ±) |
| GET | `/inventario/alertas?local=` | — | Alertas de stock crítico abiertas |

## Ventas — `/pedidos`

| Método | Ruta | Permiso | Descripción |
|--------|------|---------|-------------|
| GET | `/pedidos?local=&estado=` | — | Lista pedidos (máx. 100) |
| GET | `/pedidos/:id` | — | Detalle del pedido |
| POST | `/pedidos` | `sales:create` | Crea pedido (idempotente por `operationId`); descuenta stock por receta y aplica promociones |
| PATCH | `/pedidos/:id/estado` | — | Cambia estado (KDS) |
| POST | `/pedidos/:id/pagos` | `sales:create` | Registra pago (atribuido al turno abierto) |
| POST | `/pedidos/:id/cancelar` | `sales:refund` | Cancela y revierte stock |

### Devoluciones — `/pedidos/:id/devoluciones`

| Método | Ruta | Permiso | Descripción |
|--------|------|---------|-------------|
| GET | `/pedidos/:id/devoluciones` | — | Devoluciones del pedido |
| POST | `/pedidos/:id/devoluciones` | `sales:refund` | Devolución total/parcial (monto prorrateado, reversión de puntos y stock opcional) |

## KDS — `/kds`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/kds/cola?local=` | Pedidos activos (no entregados ni cancelados) |

**WebSocket** (Socket.IO, raíz del server):
- Cliente emite `kds:join` con `{ localId }` para unirse a la sala del local.
- Servidor emite `kds:order_created` y `kds:order_updated` con el pedido.

## Caja y turnos

| Método | Ruta | Permiso | Descripción |
|--------|------|---------|-------------|
| GET | `/cajas?local=` | — | Cajas del local |
| POST | `/cajas` | `cash:manage` | Crea caja |
| GET | `/turnos/abierto?local=` | — | Turno abierto del local (si hay) |
| POST | `/turnos/abrir` | `cash:manage` | Abre turno con fondo inicial |
| POST | `/caja/retiro` | `cash:manage` | Registra retiro de efectivo |
| POST | `/caja/cerrar` | `cash:manage` | Cierra caja → **reporte Z** (cuadre por turno) |

## Clientes y fidelización — `/clientes`

| Método | Ruta | Permiso | Descripción |
|--------|------|---------|-------------|
| GET | `/clientes/identificar?telefono=` | — | Busca cliente por teléfono |
| GET | `/clientes/:id` | — | Cliente con fidelización |
| POST | `/clientes` | — | Crea cliente (+ cuenta de puntos) |
| POST | `/clientes/fidelizacion/canjear` | — | Canjea puntos |
| GET | `/clientes/:id/recomendaciones` | — | "Tu café ideal" (habitual, frecuentes, sugerencia) |
| POST | `/clientes/:id/segmentar` | — | Recalcula segmento RFM + VIP de un cliente |
| POST | `/clientes/recomputar-segmentos` | `reports:view` | Recalcula segmentación de todos |
| GET | `/clientes/:id/gamificacion` | — | Retos con progreso, insignias y racha |

## Promociones

| Método | Ruta | Permiso | Descripción |
|--------|------|---------|-------------|
| GET | `/promociones?local=` | — | Lista promociones (globales + del local) |
| POST | `/promociones` | `catalog:manage` | Crea promoción (condición + efecto) |
| PATCH | `/promociones/:id` | `catalog:manage` | Activa/prioriza |
| POST | `/carrito/evaluar-promos` | — | Previsualiza descuento de un carrito |

## Suscripciones — `/suscripciones`

| Método | Ruta | Permiso | Descripción |
|--------|------|---------|-------------|
| GET | `/suscripciones?cliente=` | — | Suscripciones de un cliente |
| GET | `/suscripciones/activa?cliente=` | — | Suscripción activa vigente |
| POST | `/suscripciones` | `cash:manage` | Crea suscripción |
| POST | `/suscripciones/:id/consumir` | `sales:create` | Consume un pedido (valida vigencia/límite; método de pago `suscripcion`) |
| POST | `/suscripciones/:id/cancelar` | `cash:manage` | Cancela suscripción |

## Gamificación

| Método | Ruta | Permiso | Descripción |
|--------|------|---------|-------------|
| GET | `/retos?local=` | — | Lista retos |
| POST | `/retos` | `catalog:manage` | Crea reto (visitas/gasto → puntos + insignia) |

> El progreso de retos avanza automáticamente al pagar un pedido con cliente (evento `order.paid`).

## Reportes e inteligencia (permiso `reports:view`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/dashboard/kpis?local=` | Ventas del día, nº pedidos, ticket promedio, productos top |
| GET | `/reportes/mapa-calor?local=&dias=` | Ventas por hora del día |
| GET | `/reportes/quiebres?local=&dias=` | Predicción de quiebres (días restantes) |
| GET | `/reportes/ranking?local=&dias=` | Ranking de personal por ventas |
| GET | `/reportes/margenes?local=` | Margen por producto (precio − costo) |
| GET | `/reportes/experiencia?local=&dias=` | NPS, promedio, distribución y comentarios |

## Superficie pública para clientes — `/qr` y encuestas

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/qr/:localId/menu` | 🌐 Público | Menú del local (categorías + productos) |
| GET | `/qr/:localId/producto/:id` | 🌐 Público | Producto con modificadores |
| POST | `/qr/:localId/pedido` | 🌐 Público | Crea pedido `qr`/`pickup` (sin operador) |
| POST | `/encuestas` | 🌐 Público | Respuesta de encuesta post-compra (1 por pedido) |

## Salud

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/health` | 🌐 Público | Estado del servicio y conexión a BD |

---

## Contratos compartidos (`@poscoffe/types`)

Tipos y constantes consumibles por el frontend:
- **Roles/permisos**: `ROLES`, `PERMISSIONS`, `DEFAULT_ROLE_PERMISSIONS`, `Role`, `Permission`.
- **Enums**: `ORDER_CHANNELS` (`mostrador|qr|pickup|delivery`), `ORDER_STATUSES` (`pendiente|en_preparacion|listo|entregado|cancelado`), `PAYMENT_METHODS` (`efectivo|tarjeta|digital|suscripcion`), `STOCK_MOVEMENT_TYPES`.
- **Auth**: `JwtPayload`, `LoginRequest`, `LoginResponse`, `AuthUser`, `AuthTokens`.

---

⬅️ Volver al [README](../README.md) · plan original de endpoints en [docs/10](10-entregables.md).
