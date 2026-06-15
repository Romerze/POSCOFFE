# ☕ POSCOFFE

**Sistema POS inteligente para cafeterías modernas de alto movimiento.**

POSCOFFE no es un POS tradicional que solo registra ventas e imprime tickets. Es una plataforma que combina **operación rápida**, **experiencia del cliente** e **inteligencia comercial** para el dueño: pedidos en mostrador / QR / pick-up / delivery, personalización avanzada de bebidas, fidelización moderna, control de inventario por receta y analítica accionable.

---

## Estado del proyecto

> 🟢 **Fase 0 (Fundaciones) completa.** Monorepo operativo con: API NestJS + Prisma (auth JWT/PIN + RBAC), esquema de datos completo y migración inicial, y app de caja (React PWA offline-first) con login. Siguiente: **Fase 1 (MVP operativo)**.

Todos los commits y el proceso completo se versionan en este repositorio. Para correr el proyecto, ver [DEVELOPMENT.md](DEVELOPMENT.md).

---

## Decisiones de proyecto (cerradas)

| Tema | Decisión |
|------|----------|
| **Alcance** | Visión completa, entregada **por fases** (ver [roadmap](docs/09-mvp-roadmap.md)) |
| **Facturación fiscal** | MVP con **tickets internos**; facturación electrónica (SUNAT/SAT) como módulo desacoplado posterior |
| **Multi-local** | Soportado **desde el día 1** (`local_id` en el modelo) |
| **Stack** | Desktop · **Node (NestJS) + PostgreSQL + WebSockets** · control total (sin BaaS) |
| **API** | **REST + WebSockets** (no GraphQL) |
| **Algoritmos/IA** | Arranque **heurístico**; migración a modelos con histórico (~2-3 meses) |

---

## Documentación

La propuesta completa está en [`docs/`](docs/):

| # | Documento | Contenido |
|---|-----------|-----------|
| 00 | [Brief original](Info.md) | Requerimiento inicial con decisiones cerradas |
| 01 | [Concepto](docs/01-concepto.md) | Nombre, propuesta de valor, diferenciación, cafetería ideal |
| 02 | [Funcionalidades](docs/02-funcionalidades.md) | Módulos innovadores (con etiqueta de fase) |
| 03 | [Diferenciales](docs/03-diferenciales.md) | Funciones poco comunes y ganchos competitivos |
| 04 | [Experiencia de usuario](docs/04-experiencia-usuario.md) | Roles y flujos principales |
| 05 | [Diseño visual](docs/05-diseno-visual.md) | Estilo, colores, componentes, pantallas, responsive |
| 06 | [Arquitectura técnica](docs/06-arquitectura.md) | Front/back/DB, offline-first, sync, integraciones, seguridad |
| 07 | [Modelo de datos](docs/07-modelo-datos.md) | Entidades, relaciones y esquema SQL |
| 08 | [Reglas de negocio](docs/08-reglas-negocio.md) | Precios, stock, fidelización, caja, etc. |
| 09 | [MVP y roadmap](docs/09-mvp-roadmap.md) | Fases, tiempos y riesgos |
| 10 | [Entregables técnicos](docs/10-entregables.md) | Historias, casos de uso, backlog, endpoints, plan de pruebas |

---

## Stack tecnológico (resumen)

- **Frontend**: React + TypeScript, Vite, TailwindCSS, Zustand/TanStack Query, PWA offline-first (IndexedDB).
- **Backend**: NestJS (Node + TypeScript), REST + WebSockets (Socket.IO), BullMQ para colas.
- **Base de datos**: PostgreSQL (con Prisma), Redis para caché/colas/realtime.
- **Infra**: Docker, despliegue por contenedores; un servidor central + clientes por local.

Ver detalle en [docs/06-arquitectura.md](docs/06-arquitectura.md).

---

## Licencia

Propietario — Romerze. Todos los derechos reservados (provisional).
