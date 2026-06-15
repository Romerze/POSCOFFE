# 10. Entregables técnicos

## 10.1 Historias de usuario (selección, formato ágil)

**Cajero**
- Como cajero, quiero **agregar productos al ticket con un toque** para atender rápido en hora pico.
- Como cajero, quiero **personalizar una bebida** (tamaño, leche, extras) para registrar el pedido exacto.
- Como cajero, quiero **identificar al cliente frecuente** para sumarle puntos y ver su pedido habitual.
- Como cajero, quiero **cobrar con efectivo/tarjeta/QR** y dar vuelto/propina en un solo paso.
- Como cajero, quiero **seguir vendiendo sin internet** para no detener la operación.

**Barista**
- Como barista, quiero **ver los pedidos en cola con sus modificadores** para prepararlos sin error.
- Como barista, quiero un **cronómetro por pedido** para cumplir los tiempos objetivo.
- Como barista, quiero **marcar "listo"** para avisar al cliente.

**Administrador**
- Como admin, quiero **definir recetas por producto** para descontar inventario automáticamente.
- Como admin, quiero **registrar reposiciones y mermas** para mantener el stock exacto.
- Como admin, quiero **crear promociones** con condiciones de horario/stock/segmento.

**Dueño**
- Como dueño, quiero un **dashboard consolidado multi-local** para decidir con datos.
- Como dueño, quiero **ver el margen por producto** para ajustar carta y precios.
- Como dueño, quiero **alertas de stock y anomalías** para reaccionar a tiempo.

**Cliente**
- Como cliente, quiero **pedir por QR desde la mesa** sin instalar nada.
- Como cliente, quiero **ver mis puntos y recompensas** y canjearlos.
- Como cliente, quiero recibir **"mi café ideal"** y promos personalizadas.

## 10.2 Casos de uso (resumen)

| ID | Caso de uso | Actor | Fase |
|----|-------------|-------|------|
| CU-01 | Registrar venta en mostrador | Cajero | MVP |
| CU-02 | Personalizar bebida | Cajero/Cliente | MVP |
| CU-03 | Cobrar pedido | Cajero | MVP |
| CU-04 | Gestionar KDS | Barista | MVP |
| CU-05 | Abrir/cerrar caja y turno | Cajero/Admin | MVP |
| CU-06 | Gestionar catálogo y recetas | Admin | MVP |
| CU-07 | Reponer inventario / registrar merma | Admin | MVP |
| CU-08 | Identificar cliente y sumar puntos | Cajero | MVP |
| CU-09 | Ver dashboard / reportes | Dueño/Admin | MVP |
| CU-10 | Operar y sincronizar offline | Sistema | MVP |
| CU-11 | Pedir por QR / pick-up | Cliente | Fase 2 |
| CU-12 | Crear y aplicar promociones | Admin/Sistema | Fase 2 |
| CU-13 | Gestionar suscripción | Cliente/Sistema | Fase 2 |
| CU-14 | Recomendar "tu café ideal" | Sistema | Fase 2/3 |
| CU-15 | Predecir demanda / quiebres | Sistema | Fase 3 |

## 10.3 Backlog inicial (épicas → primeras tareas)

- **EPIC Fundaciones**: monorepo, CI/CD, Prisma + migraciones, auth+RBAC, shell offline-first, design system.
- **EPIC Catálogo & Recetas**: CRUD categorías/productos/variantes/modificadores; editor de recetas; costeo.
- **EPIC Ventas**: pantalla de caja, panel de modificadores, ticket, cobro, impresión.
- **EPIC KDS**: cola realtime, estados, cronómetro/semáforo, pantalla cliente.
- **EPIC Inventario**: stock por insumo/local, movimientos, reposición, merma, alertas.
- **EPIC Caja/Turnos**: apertura/cierre, PIN, reporte Z.
- **EPIC Clientes/Fidelización**: clientes, puntos, niveles, canje.
- **EPIC Sync/Offline**: cola de operaciones, idempotencia, conflictos por deltas.
- **EPIC Insights**: KPIs, reportes, márgenes.
- **EPIC Multi-local**: scoping, consolidado, permisos por sede.

## 10.4 Diagrama de módulos

```
apps/
  pos        (caja)        ─┐
  kds        (barista)      │  React + PWA (offline-first)
  display    (cliente)      │
  qr-menu    (cliente)      │
  club       (cliente)      │
  insights   (dueño)       ─┘
packages/
  ui            (design system)
  domain        (lógica compartida: precios, promos, fidelización)
  api-client    (REST + WS typed client)
  offline       (IndexedDB + cola de sync)
  types         (contratos compartidos)
server/ (NestJS)
  auth · catalog · inventory · sales · customers · loyalty ·
  promotions · subscriptions · reports · sync · notifications
  ├─ realtime (WS gateway)
  └─ workers  (BullMQ: alertas, rollups, predicciones)
infra/
  postgres · redis · payments-adapter · print-bridge · fiscal-adapter
```

## 10.5 Esquema de base de datos

Ver [modelo de datos](07-modelo-datos.md) (entidades, relaciones y SQL del núcleo). El esquema canónico se mantendrá como `schema.prisma` con migraciones versionadas.

## 10.6 Endpoints principales (REST `/api/v1`)

```
# Auth
POST   /auth/login                 POST /auth/refresh        POST /auth/pin
# Catálogo
GET/POST       /productos          GET/PUT/DELETE /productos/:id
GET/POST       /productos/:id/variantes
GET/POST       /modificadores      GET/POST /categorias
GET/POST       /recetas            (por variante)
# Inventario
GET            /inventario?local=  POST /inventario/reposiciones
POST           /inventario/mermas  GET  /inventario/alertas
# Ventas
POST           /pedidos            GET  /pedidos/:id        PATCH /pedidos/:id/estado
POST           /pedidos/:id/pagos  POST /pedidos/:id/cancelar  POST /pedidos/:id/devolucion
# Caja / Turnos
POST   /turnos/abrir   POST /turnos/cerrar   POST /caja/cerrar   GET /caja/reporte-z
# Clientes / Fidelización
GET/POST /clientes     GET /clientes/:id      POST /fidelizacion/canjear
GET      /clientes/:id/recomendaciones
# Promociones / Suscripciones
GET/POST /promociones  POST /carrito/evaluar-promos
GET/POST /suscripciones
# Reportes
GET /reportes/ventas   GET /reportes/margenes   GET /dashboard/kpis
# Sync
POST /sync/operaciones (batch idempotente)   GET /sync/cambios?desde=

# WebSocket (Socket.IO)
local:{id}:kds         · local:{id}:inventory   · order:{id}:status
```

## 10.7 Pantallas principales

Ver [diseño visual §5.4](05-diseno-visual.md). Núcleo MVP: Caja, Modificadores, Cobro, KDS, Cierre de caja, Catálogo/Recetas, Inventario, Dashboard.

## 10.8 Flujo de navegación

```
Login ─► (rol)
  ├─ Cajero  ─► Caja ─► [Modificadores] ─► Cobro ─► Ticket
  │             └─► Identificar cliente · Cierre de caja
  ├─ Barista ─► KDS (pantalla completa)
  ├─ Admin   ─► Catálogo/Recetas · Inventario · Promos · Turnos · Reportes
  └─ Dueño   ─► Insights (KPIs ─ Márgenes ─ Mapa de calor ─ Ranking)

Cliente (sin login de staff):
  QR mesa/pickup ─► Menú ─► Personalizar ─► Enviar ─► Pago/Recoger
  Club ─► Puntos · Retos · Historial · Recompensas
```

## 10.9 Recomendaciones de stack tecnológico

- **Frontend:** React + TypeScript, Vite, TailwindCSS, Radix UI, Zustand, TanStack Query, Dexie (IndexedDB), Socket.IO client, Workbox (PWA).
- **Backend:** NestJS, Prisma, PostgreSQL, Redis, BullMQ, Socket.IO, class-validator/zod.
- **Auth:** JWT (access/refresh) + PIN; argon2 para hashing.
- **Infra:** Docker, monorepo (pnpm + Turborepo), CI con GitHub Actions, observabilidad (logs estructurados + métricas).
- **Pagos/Impresión/Fiscal:** adaptadores desacoplados (`PaymentProvider`, `PrintBridge`, `FiscalProvider`).

## 10.10 Consideraciones de seguridad

- TLS, secrets fuera del repo, cifrado en reposo, argon2 para credenciales/PIN.
- RBAC con scoping obligatorio por `local_id`; auditoría de acciones sensibles.
- Idempotencia y validación estricta en endpoints de venta/sync.
- Rate limiting y protección de superficies públicas (QR/Club).
- Consentimiento y derecho a borrado de datos de cliente; minimización de PII.
- Sandbox y conciliación en pagos; nunca almacenar datos sensibles de tarjeta (delegar a la pasarela).

## 10.11 Plan de pruebas

| Nivel | Qué se prueba | Herramientas |
|-------|---------------|--------------|
| **Unitarias** | Lógica de dominio: precios, promos, costeo, fidelización | Vitest/Jest |
| **Integración** | Endpoints REST, transacciones, descuento de stock | Jest + Supertest + DB de test |
| **E2E** | Flujos: venta, cobro, KDS, cierre de caja | Playwright |
| **Offline/Sync** | Partición de red, cola, idempotencia, conflictos por deltas | Pruebas dirigidas + simulación de red |
| **Realtime** | Entrega y catch-up de eventos KDS | Pruebas de socket |
| **Carga** | Hora pico (ráfagas de pedidos), reportes | k6 |
| **Hardware** | Impresoras ESC/POS, lectores QR | Matriz de dispositivos manual |
| **UAT** | Operación real en una cafetería piloto | Checklist de aceptación |

Meta de cobertura para lógica de dominio crítica: **≥80 %**.

## 10.12 Roadmap de evolución

Ver fases completas en [MVP y roadmap §9.4](09-mvp-roadmap.md):
- **Fase 1 — MVP operativo** (vender de punta a punta, offline, multi-local base).
- **Fase 2 — Diferenciadores** (QR, promos dinámicas, suscripciones, fidelización avanzada, segmentación, recomendador v1).
- **Fase 3 — Inteligencia** (predicción de demanda/quiebres con modelos, recomendador v2, voz).
- **Fase 4 — Expansión** (facturación fiscal, agregadores de delivery, app nativa, multi-país).

---

⬅️ Volver al [README](../README.md) · Índice de documentación en la raíz.
