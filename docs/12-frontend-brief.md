# Brief de diseño de frontend — POSCOFFE

> **Documento para Claude Design.** Es autónomo: contiene todo lo necesario para
> diseñar y construir el frontend de POSCOFFE. El backend ya existe y está
> documentado; este frontend solo consume su API.

---

## 1. Qué es POSCOFFE

POSCOFFE es un **POS (punto de venta) inteligente para cafeterías modernas de alto tránsito**. No es un POS común: además de vender, da experiencia al cliente e inteligencia comercial al dueño. Maneja venta en mostrador, **pedidos por QR/pick-up**, personalización de bebidas, fidelización con puntos, promociones dinámicas, suscripciones, y analítica en tiempo real.

**Tono de marca:** cálido (café de especialidad), moderno, limpio y rápido. Inspiración visual: specialty coffee + dashboards modernos tipo Linear/Vercel, pero **legible y táctil** para uso operativo intenso.

## 2. El encargo

Diseñar y construir una **aplicación web multi-rol** (una sola app, vistas según rol) que consuma la API REST + WebSocket existente. Debe ser:
- **PWA offline-first** orientada a **tablet** para caja y cocina; **desktop** para administración/dashboard; **móvil** para superficies de cliente (menú QR).
- **Modo claro y oscuro** de primera clase.
- **Táctil**: botones grandes, mínimo de toques, feedback inmediato.

**Stack objetivo:** React + TypeScript + Vite + TailwindCSS. Estado: Zustand (UI/POS) + TanStack Query (datos). Tiempo real: socket.io-client. (Si Claude Design produce solo diseño, igual seguir estos componentes/criterios.)

## 3. Sistema visual

### Paleta (tokens claro / oscuro)

| Token | Claro | Oscuro | Uso |
|-------|-------|--------|-----|
| `bg` | `#FAF7F2` (crema) | `#1A1614` (espresso) | Fondo |
| `surface` | `#FFFFFF` | `#262019` | Tarjetas/paneles |
| `primary` | `#6F4E37` (café) | `#C8966B` (latte) | Marca, botones principales |
| `accent` | `#E07A3E` (caramelo) | `#F08C4B` | CTAs, upsell, destacados |
| `success` | `#2E9E5B` | `#3FBE72` | Pago OK, stock sano, promo |
| `warning` | `#E0A52E` | `#F2BC4C` | Stock bajo, demora media |
| `danger` | `#D14848` | `#E86464` | Error, quiebre, demora alta |
| `text` | `#2B2420` | `#F2EDE6` | Texto principal |
| `muted` | `#8A7F75` | `#A89A8C` | Texto secundario |

### Estilo
- Tipografía sans moderna (system-ui / Inter). Jerarquía clara por tamaño y peso.
- Bordes redondeados **12–16px**, sombras sutiles.
- **Densidad doble**: zonas táctiles generosas en caja/KDS (botones ≥48px); densidad compacta y rica en datos en dashboards.
- **Microinteracciones**: feedback al agregar producto (escala + “vuela” al ticket), cronómetro KDS que cambia de color, confeti sutil al subir de nivel/canjear, skeletons en carga, toasts de confirmación.
- **Estados siempre cubiertos**: cargando (skeleton), vacío (ilustración + acción), error (mensaje claro), offline (banner persistente con nº de operaciones pendientes).

## 4. Roles y navegación

Una barra superior con navegación filtrada por rol. Tras login se entra a la vista por defecto del rol.

| Rol | Vistas que ve |
|-----|---------------|
| **CASHIER** (cajero) | Caja |
| **BARISTA** | Cocina (KDS) |
| **ADMIN** | Caja, Cocina, Insights, Administración |
| **OWNER** (dueño) | Caja, Cocina, Insights, Administración |
| **CUSTOMER** (cliente) | App pública por QR (separada, sin login de staff) |

La barra superior incluye: marca, navegación, **toggle de tema (claro/oscuro)**, indicador de conexión (en línea/offline), nombre y rol del usuario, botón salir.

## 5. Pantallas (con su fuente de datos)

> Endpoints completos en `docs/11-api-reference.md`. Base URL `/api/v1`. Auth por `Bearer accessToken` (login en `/auth/login`). Montos llegan como string decimal.

### 5.1 Login
- Email + contraseña → `POST /auth/login`. Opción de PIN rápido (`/auth/pin`).
- Logo, fondo cálido, un solo CTA grande. Mostrar errores inline.

### 5.2 Caja / Toma de pedidos (CASHIER) — **pantalla estrella**
Layout 2 zonas (tablet horizontal): **catálogo** (izquierda, 60–70%) + **ticket** (derecha, fijo).
- **Catálogo**: productos en grilla por categoría (`GET /productos?local=`). Tarjetas grandes con nombre y “desde S/X”. Buscador y acceso a top/favoritos.
- **Barra de cliente** (arriba): identificar por teléfono (`GET /clientes/identificar`); al identificar muestra nombre, **puntos/nivel/VIP** y **recomendación** “tu habitual / prueba esto” (`GET /clientes/:id/recomendaciones`).
- **Modal de personalización** al tocar un producto: selector de tamaño/variante + grupos de **modificadores** (chips; único/múltiple) con precio dinámico (`GET /productos/:id`). Botón “Agregar · S/total”.
- **Ticket** (derecha): líneas editables (±cantidad, quitar), **subtotal**, **descuento de promo en vivo** (`POST /carrito/evaluar-promos`, mostrar nombre de la promo aplicada), **total**. Botones de cobro: Efectivo / Tarjeta / Digital.
- **Cobrar**: `POST /pedidos` (operationId = uuid del cliente, idempotente) → `POST /pedidos/:id/pagos` con el total. Toast de éxito.
- **Modo rush hour** (opcional): vista simplificada con solo los productos top.

### 5.3 Cocina / KDS (BARISTA) — **tiempo real, pantalla completa**
- 3 columnas: **Pendientes → En preparación → Listos**.
- Carga inicial `GET /kds/cola?local=`. Tiempo real por WebSocket: emitir `kds:join {localId}`; escuchar `kds:order_created` y `kds:order_updated`.
- Tarjeta de pedido: nº/mesa o canal (QR/pick-up/mostrador), **ítems con modificadores resaltados**, notas, **cronómetro con semáforo** (verde <4’, ámbar 4–8’, rojo >8’). Botón para avanzar estado (`PATCH /pedidos/:id/estado`: pendiente→en_preparacion→listo→entregado).
- Sin teclado: todo a toques grandes.

### 5.4 Insights / Dashboard (OWNER, ADMIN)
Cuadrícula de tarjetas, densidad informativa, ideal desktop:
- **KPIs del día**: ventas, nº pedidos, ticket promedio, producto top (`GET /dashboard/kpis?local=`).
- **Mapa de calor por hora** (gráfico de barras) (`GET /reportes/mapa-calor?local=`).
- **Predicción de quiebres** (lista con días restantes, marca ⚠️ crítico) (`GET /reportes/quiebres?local=`).
- **Márgenes por producto** (tabla con % margen) (`GET /reportes/margenes?local=`).
- **Ranking de personal** (`GET /reportes/ranking?local=`).
- **Experiencia / NPS**: NPS, promedio, distribución de puntajes y últimos comentarios (`GET /reportes/experiencia?local=`).

### 5.5 Administración (OWNER, ADMIN)
Sección con sub-pestañas, formularios claros (densidad compacta):
- **Catálogo**: categorías, productos, variantes, modificadores. Crear/editar (`/categorias`, `/productos`, `/variantes`, `/modificador-grupos`, `/modificadores`).
- **Recetas**: por variante, asignar insumos+cantidad (`PUT /variantes/:id/receta`); ver costo calculado.
- **Combos**: definir componentes de una variante-combo (`PUT /variantes/:id/combo`).
- **Inventario**: stock por insumo (`GET /inventario?local=`), reposiciones, mermas, ajustes, umbrales; **alertas de stock crítico** (`/inventario/alertas`).
- **Promociones**: crear/activar (descuento %/monto, hora valle, NxM; condición franja/monto/scope) (`/promociones`).
- **Suscripciones**: crear plan para un cliente, ver consumos (`/suscripciones`).
- **Retos (gamificación)**: crear retos (visitas/gasto → puntos + insignia) (`/retos`).
- **Caja/turnos**: abrir turno, retiros, **cerrar caja con reporte Z** (`/turnos/abrir`, `/caja/cerrar`).
- **Devoluciones**: desde un pedido, total/parcial con motivo (`POST /pedidos/:id/devoluciones`).

### 5.6 App de cliente por QR (CUSTOMER) — móvil, **sin login de staff**, separada
- **Menú** del local (`GET /qr/:localId/menu`), personalización (`GET /qr/:localId/producto/:id`).
- Armar pedido y enviarlo (`POST /qr/:localId/pedido`, canal `qr` o `pickup`).
- **Encuesta post-compra** de 1 toque (😞/😐/😀 = 1–5) + comentario opcional (`POST /encuestas`).
- (Opcional) “POSCOFFE Club”: puntos, retos/insignias y racha (`GET /clientes/:id/gamificacion`).

## 6. Flujos principales a cuidar
1. **Venta rápida**: catálogo → (modificadores) → ticket → cobrar, en pocos segundos.
2. **Cliente frecuente**: identificar → ver puntos + recomendación → cobrar (suma puntos y avanza retos automáticamente en el backend).
3. **Pedido por QR**: escanear → menú → personalizar → enviar → aparece en KDS.
4. **KDS**: pedido entra en vivo → barista avanza estados → “listo”.
5. **Cierre de caja**: abrir turno → vender → cerrar con cuadre (reporte Z).
6. **Promoción**: el descuento se refleja solo en el ticket al cumplir la condición.

## 7. Requisitos transversales
- **Responsive**: tablet-first en Caja/KDS (horizontal, botones ≥48px); desktop para Insights/Admin (multi-columna, tablas); mobile-first en superficies de cliente.
- **Modo oscuro**: por tokens, conmutable y persistente por dispositivo; oscuro recomendado para KDS y pantallas de cliente.
- **Offline-first**: indicador persistente de conexión; la caja debe permitir seguir registrando (cola local) cuando no haya internet, sincronizando luego (la idempotencia por `operationId` ya está soportada por la API).
- **Accesibilidad táctil**: nada crítico depende de hover; confirmación en acciones destructivas; alto contraste.

## 8. Entregables esperados de Claude Design
- Sistema de diseño (tokens, tipografía, componentes base: botón, tarjeta producto, panel modificadores, ticket, tarjeta KDS, KPI card, tabla, modal de cobro, chips, toasts, badges).
- Diseño de las pantallas 5.1–5.6 en claro y oscuro, tablet y desktop (y móvil para 5.6).
- Estados: cargando / vacío / error / offline.
- (Si aplica) componentes React + Tailwind conectables a los endpoints indicados.

## 9. Referencias técnicas
- **API completa**: `docs/11-api-reference.md` (rutas, auth, permisos, eventos WebSocket).
- **Contratos de tipos**: paquete `@poscoffe/types` (roles, permisos, enums de canal/estado/método de pago, tipos de auth).
- **Concepto y UX detallada**: `docs/01-concepto.md`, `docs/04-experiencia-usuario.md`, `docs/05-diseno-visual.md`.

> Nota: el frontend actual del repo (`apps/pos`) es una **referencia funcional** (qué llamar y en qué orden), no una restricción de diseño. Claude Design puede proponer una experiencia visual nueva manteniendo los mismos endpoints.
