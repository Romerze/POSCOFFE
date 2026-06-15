# 3. Funcionalidades diferenciales y poco comunes

Estas son las funciones que separan a POSCOFFE de la competencia. Mismo etiquetado de fase: 🟢 MVP · 🔵 Fase 2 · 🟣 Visión. La mayoría arranca con **reglas heurísticas** y evoluciona a modelos con datos.

---

## 3.1 Motor "Tu café ideal" 🔵 → 🟣

Recomendador que aprende del cliente.

- **v1 (reglas, 🔵)**: sugiere el producto más comprado + complemento frecuente + "prueba algo nuevo" de la misma familia.
- **v2 (modelo, 🟣)**: filtrado colaborativo ("clientes como tú pidieron…") + similitud de perfiles de sabor (intensidad, dulzor, leche).
- Se expone en caja (al identificar cliente) y en el pedido por QR/app.

## 3.2 Suscripción mensual para clientes frecuentes 🔵

- Planes tipo *"café del día ilimitado"* o *"15 cafés/mes"* con precio fijo.
- Validación de consumo contra el plan en cada pedido; corte y renovación automáticos.
- Entidad `Suscripcion` en el [modelo de datos](07-modelo-datos.md). Gran palanca de recurrencia y caja predecible.

## 3.3 Mapa de calor de productos por horario 🔵

- Matriz producto × franja horaria con intensidad de demanda.
- Sirve para colocar atajos, planificar producción y diseñar promos de hora valle.

## 3.4 Algoritmo de sugerencia de nuevos productos 🟣

- Detecta combinaciones frecuentes y huecos de catálogo ("muchos piden X frío pero no existe la versión fría").
- Recomienda altas/bajas de carta según rotación y margen. Requiere histórico.

## 3.5 Predicción de quiebres de stock 🔵 → 🟣

- **v1 (🔵)**: proyección lineal por consumo medio diario → "este insumo se agota en ~2 días".
- **v2 (🟣)**: proyección por franja y estacionalidad cruzada con la predicción de demanda.

## 3.6 Alertas de merma y desperdicio 🔵

- Registro de merma (caducidad, error de preparación, prueba) con motivo.
- Alertas cuando la merma de un insumo supera un umbral; reporte de costo de merma.

## 3.7 Gamificación para clientes recurrentes 🔵

- Retos ("5 visitas esta semana → bebida gratis"), rachas, insignias, niveles.
- Integrado con fidelización y la app **POSCOFFE Club**.

## 3.8 Pedidos por voz para el cajero 🟣

- Dictado de pedido ("dos lattes grandes con leche de avena, uno descafeinado") → ítems + modificadores.
- Acelera la hora pico; requiere NLP de dominio y validación contra catálogo.

## 3.9 Panel de experiencia del cliente 🔵

- Consolida tiempos de espera, encuestas post-compra, reclamos y NPS.
- Vista de "salud de la experiencia" por local y franja.

## 3.10 Integración con pantallas digitales del local 🔵

- **Pantalla de "pedido listo"** (llamado por número/nombre) y **menú digital** con disponibilidad y promos en vivo.
- Reutiliza el canal WebSocket del KDS.

## 3.11 Promociones automáticas para horas valle 🔵

- El motor de promociones activa descuentos en franjas de baja demanda (detectadas por el mapa de calor) para nivelar el flujo.

## 3.12 Identificación de clientes VIP 🔵

- Marca automática de VIP por gasto/frecuencia; alerta al cajero para trato preferente y beneficios.

## 3.13 Segmentación automática de clientes 🔵 → 🟣

- Segmentos por RFM (recencia, frecuencia, monto): nuevos, fieles, en riesgo, dormidos.
- Base para campañas y promos dirigidas.

## 3.14 Encuestas rápidas post-compra 🔵

- Micro-encuesta (1 toque: 😞/😐/😀 + comentario opcional) vía QR del ticket o app.
- Alimenta el panel de experiencia.

## 3.15 Ranking de baristas / productividad por turno 🔵

- Métricas por empleado: pedidos atendidos, tiempo medio de preparación, ticket medio, upsell logrado.
- Tablero comparativo por turno; insumo para incentivos.

## 3.16 Control de preparación para reducir tiempos de espera 🟢

- El KDS mide el tiempo real de cada pedido y compara contra el objetivo por producto.
- Semáforo y alertas cuando un pedido se demora; histórico de tiempos por estación.

## 3.17 Modo "rush hour" 🟢

- Interfaz simplificada activable manual o automáticamente (por volumen/franja): solo top productos, modificadores más usados, menos pasos.
- Diseñado para máxima velocidad táctil en pico.

---

## Resumen de priorización

| Fase | Diferenciales incluidos |
|------|-------------------------|
| 🟢 **MVP** | Control de preparación (3.16), Modo rush hour (3.17) |
| 🔵 **Fase 2** | Tu café ideal v1 (3.1), Suscripción (3.2), Mapa de calor (3.3), Predicción quiebres v1 (3.5), Merma (3.6), Gamificación (3.7), Panel experiencia (3.9), Pantallas digitales (3.10), Promos hora valle (3.11), VIP (3.12), Segmentación (3.13), Encuestas (3.14), Ranking baristas (3.15) |
| 🟣 **Visión** | Tu café ideal v2 (3.1), Sugerencia de productos (3.4), Predicción quiebres v2 (3.5), Pedidos por voz (3.8), Segmentación con modelo (3.13) |

---

➡️ Siguiente: [Experiencia de usuario](04-experiencia-usuario.md)
