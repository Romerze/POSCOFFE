# 9. MVP y roadmap

> Recordatorio (decisión cerrada): se construye la **visión completa por fases**. Nada queda fuera del producto final; el MVP es el primer corte vendible.

## 9.1 Funciones indispensables (MVP 🟢)

El MVP debe permitir **operar una cafetería real de principio a fin**:

1. Gestión de catálogo: categorías, productos, variantes, modificadores.
2. Recetas e inventario por insumo + descuento automático por venta.
3. Toma de pedidos en mostrador con personalización.
4. Cobro multi-método (efectivo, tarjeta, 1 billetera digital).
5. Impresión de ticket interno (ESC/POS).
6. **KDS** en tiempo real con control de tiempos.
7. **Offline-first** + sincronización.
8. **Multi-local** base (alta de locales, scoping de datos, usuarios por local).
9. Turnos y cierre de caja.
10. Fidelización base (puntos + identificación de cliente).
11. Dashboard con KPIs del día y reportes básicos.
12. Auth + RBAC (Dueño/Admin/Cajero/Barista).
13. Alertas de stock crítico.
14. Modo rush hour.

## 9.2 Funciones innovadoras mínimas (en MVP)

Para que el MVP ya sea "diferencial" y no un POS común:

- **Costeo por receta → margen por producto** (mostrado al dueño).
- **Control de tiempos de preparación** en KDS (semáforo).
- **Modo rush hour**.
- Inventario en tiempo real real (no conteo manual).

## 9.3 Funciones que pueden esperar

- Pedidos por QR/pick-up/delivery, pantallas de cliente.
- Recomendador "tu café ideal", segmentación, VIP, suscripciones.
- Promociones dinámicas avanzadas, gamificación, encuestas.
- Predicciones (demanda, quiebres), mapa de calor, sugerencia de productos.
- Pedidos por voz.
- Facturación electrónica fiscal.

## 9.4 Priorización por fases

### Fase 0 — Fundaciones (setup)
Monorepo, CI, esquema BD/Prisma, auth + RBAC, alta de local/usuarios, diseño base (tokens, componentes), esqueleto offline-first.

### Fase 1 — MVP operativo 🟢
Catálogo + recetas + inventario, toma de pedidos + personalización, cobro + ticket, KDS, turnos + cierre de caja, fidelización base, dashboard básico, alertas de stock, offline + sync, multi-local base, rush hour.

### Fase 2 — Diferenciadores 🔵
QR/pick-up/delivery + pantallas de cliente, promociones dinámicas + combos/upsell, perfil de cliente + segmentación + VIP, suscripciones, mapa de calor, predicción de quiebres v1, merma, gamificación, encuestas, ranking de baristas, panel de experiencia, recomendador v1.

### Fase 3 — Inteligencia (Visión 🟣)
Predicción de demanda (con clima/temporada), recomendador v2 (colaborativo), sugerencia de nuevos productos, segmentación con modelo, predicción de quiebres v2, pedidos por voz.

### Fase 4 — Expansión
Facturación electrónica fiscal (SUNAT/SAT), integraciones con agregadores de delivery, app móvil nativa de cliente, marketplace de integraciones, multi-moneda/multi-país.

## 9.5 Tiempo estimado por etapa

> Estimación para un equipo pequeño (2-3 devs). Orientativa, a ajustar tras Fase 0.

| Fase | Alcance | Estimación |
|------|---------|------------|
| Fase 0 | Fundaciones | 3-4 semanas |
| Fase 1 | MVP operativo | 8-12 semanas |
| Fase 2 | Diferenciadores | 10-14 semanas |
| Fase 3 | Inteligencia | 8-12 semanas (depende de datos) |
| Fase 4 | Expansión | continuo |

## 9.6 Riesgos técnicos

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| **Sincronización offline ↔ online** (el más alto) | Inconsistencia de stock/ventas | Modelo append-only por deltas, idempotencia (operation_id), UUID v7 en cliente, pruebas de partición de red |
| **Realtime multi-dispositivo en LAN sin internet** | KDS no recibe pedidos | WS en LAN + catch-up al reconectar; fallback local |
| **Integración impresora térmica** (variedad de hardware) | Tickets no imprimen | Print bridge local, soporte ESC/POS, matriz de modelos probados |
| **Pasarelas de pago** (cada proveedor distinto) | Bloqueo de cobro digital | Adaptador desacoplado, sandbox por proveedor, conciliación por webhook |
| **Predicciones sin datos (arranque en frío)** | Funciones "IA" inútiles al inicio | Heurísticas primero, modelos al tener histórico; comunicar expectativas |
| **Costeo por receta mal configurado** | Márgenes/stock erróneos | Validación de recetas, asistente de carga, alertas de costo 0 |
| **Multi-local desde día 1** | Complejidad temprana | Scoping por `local_id` obligatorio desde el esquema; tests de aislamiento |
| **Rendimiento en hora pico** | Lentitud en caja | Operación local primero, índices, colas async para lo no crítico |

---

➡️ Siguiente: [Entregables técnicos](10-entregables.md)
