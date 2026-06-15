# 6. Arquitectura técnica

## 6.1 Visión general

POSCOFFE es un sistema **multi-local, offline-first y en tiempo real**. La topología:

```
┌─────────────────────────────────────────────────────────────┐
│                    NUBE (servidor central)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ API REST │  │ WS Gateway│ │ Workers  │  │ PostgreSQL    │  │
│  │ (NestJS) │  │ (Socket.IO)│ │ (BullMQ) │  │ + Redis       │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘  │
└───────┼─────────────┼─────────────┼───────────────┼──────────┘
        │  sync (REST/WS) por local, tolerante a cortes
┌───────┴─────────────┴─────────────┴───────────────┴──────────┐
│                      LOCAL (cafetería)                         │
│  ┌────────────┐   ┌────────────┐   ┌────────────────────┐    │
│  │ Caja (PWA) │   │ KDS (PWA)  │   │ Pantalla cliente    │    │
│  │ IndexedDB  │◄─►│  red LAN   │◄─►│  (web)              │    │
│  └─────┬──────┘   └────────────┘   └────────────────────┘    │
│        │ impresora térmica (ESC/POS), lector QR                │
└───────────────────────────────────────────────────────────────┘
```

La caja opera contra su **store local (IndexedDB)** y sincroniza con la nube; si internet cae, sigue vendiendo.

## 6.2 Frontend

- **React + TypeScript + Vite.**
- **TailwindCSS** con los tokens de [diseño](05-diseno-visual.md); componentes propios + Radix UI para accesibilidad.
- **Estado:** Zustand (estado local de UI/POS) + **TanStack Query** (datos servidor, caché, reintentos).
- **PWA offline-first:** Service Worker + **IndexedDB** (vía Dexie) para catálogo, pedidos en curso y cola de sincronización.
- **Tiempo real:** cliente Socket.IO para KDS, estado de pedidos, inventario en vivo.
- Apps/superficies: **POS (caja)**, **KDS**, **Pantalla cliente**, **Menú QR**, **Club** (cliente), **Insights** (dueño). Monorepo con paquetes compartidos (tipos, UI, lógica de dominio).

## 6.3 Backend

- **NestJS (Node + TypeScript)**, modular por dominio (ventas, catálogo, inventario, clientes, fidelización, promociones, reportes, sync).
- **API REST** para CRUD y transacciones; **WebSockets (Socket.IO)** para realtime; **BullMQ** (sobre Redis) para tareas async (reportes, alertas, recomputo de stats, notificaciones).
- **Validación** con class-validator/zod; **DTOs** y contratos compartidos con el front vía tipos.
- Costeo por receta, motor de promociones y motor de fidelización como **servicios de dominio** desacoplados.

## 6.4 Base de datos

- **PostgreSQL** como fuente de verdad central. ORM **Prisma**.
- **Redis** para caché, colas (BullMQ) y pub/sub de realtime entre instancias.
- Esquema con `local_id` en entidades transaccionales y de catálogo (ver [modelo de datos](07-modelo-datos.md)).
- Particionado/índices por `local_id` y fecha en tablas de pedidos para reportes.
- Time-series de métricas en tablas agregadas (rollups) recalculadas por workers.

## 6.5 API: REST + WebSockets (decisión cerrada)

- **REST** versionado (`/api/v1`): recursos CRUD, transacciones de venta, reportes.
- **WebSockets**: canales por local y por estación — `local:{id}:kds`, `local:{id}:inventory`, `order:{id}:status`.
- Sin GraphQL (decisión cerrada): el patrón de acceso del POS es transaccional + push, donde REST+WS encaja mejor y simplifica el offline.

## 6.6 Autenticación

- **JWT** (access + refresh) para usuarios de staff; sesión por dispositivo/local.
- **PIN rápido** por empleado para cambio de operador en la misma caja (sin re-login completo).
- Clientes finales: login ligero por teléfono/OTP o magic link para QR/Club.
- Service tokens para dispositivos (KDS, pantallas) con scope limitado.

## 6.7 Roles y permisos

- RBAC con roles base: **Dueño**, **Administrador**, **Cajero**, **Barista**, **Cliente**.
- Permisos por módulo y por **local** (un admin puede gestionar solo ciertas sedes).
- Acciones sensibles (anulaciones, descuentos manuales, apertura de cajón) requieren rol/PIN autorizado y quedan en auditoría.

## 6.8 Modo offline-first

- La caja mantiene en IndexedDB: catálogo, precios, promos vigentes, clientes frecuentes (subset) y **cola de operaciones**.
- Las ventas se confirman localmente (ticket + KDS LAN) sin esperar a la nube.
- Identificadores generados como **UUID v7** en cliente para evitar colisiones al sincronizar.
- KDS y pantallas se comunican en la **red local** aunque no haya internet (servidor local ligero opcional o WS directo entre dispositivos en LAN).

## 6.9 Sincronización de datos

- **Cola de operaciones** (event log) por dispositivo → se envía al volver la conexión.
- Estrategia de conflictos:
  - **Ventas/pedidos**: append-only, no hay conflicto real (cada venta es un evento único).
  - **Stock**: el servidor aplica los movimientos en orden de llegada (delta-based, no "set absoluto") para que dos cajas no se pisen; reconciliación por suma de deltas.
  - **Catálogo/precios/promos**: el servidor es la autoridad; **last-write-wins por campo** con timestamp y versión.
  - **Caja/turno**: reglas dedicadas; el cierre se valida en servidor.
- Sincronización **idempotente** (operation_id único) y con reintentos exponenciales.

## 6.10 Integración con pasarelas de pago

- **Adaptador de pagos** (interfaz `PaymentProvider`) que abstrae proveedores (tarjeta, Yape/Plin, Mercado Pago, etc.).
- Webhooks de confirmación; conciliación con el pedido por `operation_id`.
- Permite añadir/cambiar proveedor y país sin tocar el flujo de venta.

## 6.11 Integración con impresoras térmicas

- **ESC/POS** sobre USB/red/Bluetooth.
- Servicio de impresión local (en el dispositivo o un print bridge en LAN) para funcionar offline.
- Plantillas de ticket configurables (logo, datos del local, QR de encuesta/Club).

## 6.12 Integración con pantallas de cocina/barista

- KDS y pantallas de cliente son clientes WebSocket suscritos a los canales del local.
- Reconexión automática y *catch-up* (al reconectar piden el estado actual de la cola).

## 6.13 Seguridad de datos

- TLS en todo el transporte; secrets en gestor de secretos (no en repo).
- Cifrado en reposo de la BD; hashing de contraseñas (argon2) y PINs.
- **Auditoría** de acciones sensibles; principio de mínimo privilegio.
- Aislamiento por local en consultas (scoping obligatorio por `local_id`).
- Cumplimiento de protección de datos del cliente (consentimiento, derecho a borrado en Club).
- Facturación electrónica como **módulo desacoplado** para incorporar requisitos fiscales (SUNAT/SAT) sin reescribir el núcleo.

## 6.14 Escalabilidad multi-local

- Stateless API detrás de balanceador; realtime escalado con Redis pub/sub (adapter de Socket.IO).
- Datos segmentados por `local_id`; reportes consolidados vía rollups.
- Onboarding de nuevo local = alta de `Local` + dispositivos; el resto del modelo ya lo soporta.
- Workers escalables por cola para no bloquear el camino crítico de venta.

---

➡️ Siguiente: [Modelo de datos](07-modelo-datos.md)
