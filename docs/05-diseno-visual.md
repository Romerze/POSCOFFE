# 5. Diseño visual

## 5.1 Estilo visual

- **Lenguaje:** limpio, moderno y de alto contraste, pensado para uso táctil rápido. Inspiración: "specialty coffee" + dashboards modernos (Linear/Vercel) sin sacrificar legibilidad operativa.
- **Densidad:** generosa en zonas táctiles (botones grandes en caja/KDS), compacta y rica en datos en dashboards.
- **Tarjetas y bordes suaves** (radius 12-16px), sombras sutiles, jerarquía clara por tamaño y color.
- **Cero ruido en operación:** durante la venta, la pantalla muestra solo lo necesario; los datos avanzados viven en Insights.

## 5.2 Colores recomendados

Paleta "café cálido + acento energético":

| Token | Claro | Oscuro | Uso |
|-------|-------|--------|-----|
| `--bg` | `#FAF7F2` (crema) | `#1A1614` (espresso) | Fondo |
| `--surface` | `#FFFFFF` | `#262019` | Tarjetas/paneles |
| `--primary` | `#6F4E37` (café) | `#C8966B` (latte) | Marca, botones principales |
| `--accent` | `#E07A3E` (caramelo) | `#F08C4B` | Acciones, CTAs, upsell |
| `--success` | `#2E9E5B` | `#3FBE72` | Pago OK, stock sano |
| `--warning` | `#E0A52E` | `#F2BC4C` | Stock bajo, demora media |
| `--danger` | `#D14848` | `#E86464` | Error, quiebre, demora alta |
| `--text` | `#2B2420` | `#F2EDE6` | Texto principal |
| `--muted` | `#8A7F75` | `#A89A8C` | Texto secundario |

Semáforo de tiempos del KDS reutiliza success/warning/danger.

## 5.3 Componentes principales

- **Tarjeta de producto** (grilla de caja): imagen/ícono, nombre, precio, badge de "top".
- **Panel de modificadores**: grupos con chips seleccionables, contador de extras, total dinámico.
- **Ticket lateral**: lista editable de ítems, subtotal, descuentos, total, botón Cobrar.
- **Tarjeta de pedido KDS**: número, ítems con modificadores resaltados, cronómetro, estado.
- **KPI card** (dashboard): valor grande, delta vs periodo, mini-sparkline.
- **Buscador con atajos** y filtros por categoría.
- **Modal de cobro**: métodos de pago, división, propina, monto recibido/vuelto.
- **Identificador de cliente**: chip con nombre, nivel, puntos.
- **Toast / banner de alertas** (stock, sincronización offline).

## 5.4 Pantallas clave

1. **Caja / Toma de pedidos** (cajero).
2. **Panel de modificadores** (overlay).
3. **Cobro** (modal).
4. **KDS barista** (pantalla completa).
5. **Pantalla de cliente** ("pedido listo" / menú digital).
6. **Menú web QR** (cliente, móvil).
7. **POSCOFFE Club** (cliente: puntos, retos, historial).
8. **Dashboard Insights** (dueño).
9. **Gestión de catálogo / recetas** (admin).
10. **Inventario y alertas** (admin).
11. **Cierre de caja / turnos** (cajero/admin).
12. **Gestor de promociones** (admin/dueño).

> Wireframes textuales y flujo de navegación en [entregables](10-entregables.md).

## 5.5 Diseño responsive

- **Tablet (primario para caja/KDS):** layout de 2 zonas (catálogo + ticket), botones ≥48px, orientación horizontal.
- **Desktop (admin/dueño):** dashboards multi-columna, tablas densas, atajos de teclado.
- **Móvil (cliente):** menú QR y POSCOFFE Club en una columna, flujo de pedido tipo wizard.
- Breakpoints: `sm 640 · md 768 · lg 1024 · xl 1280`. Mobile-first en superficies de cliente; tablet-first en superficies operativas.

## 5.6 Microinteracciones

- Feedback táctil inmediato al agregar producto (escala + sonido opcional corto).
- Animación del ítem "volando" al ticket.
- Cronómetro del KDS que cambia de color al cruzar umbrales.
- Confeti/aprobación sutil al canjear recompensa o subir de nivel (Club).
- Skeletons en carga; estados vacíos ilustrados y accionables.
- Indicador persistente de **modo offline / sincronizando** con conteo de operaciones pendientes.

## 5.7 Uso rápido con pantalla táctil

- Zonas táctiles grandes y separadas; nada crítico en esquinas difíciles.
- Acciones destructivas con confirmación; acciones frecuentes a un toque.
- Sin hovers como única vía (todo accesible por toque).
- Modo *rush hour* reduce a lo esencial.

## 5.8 Modo oscuro y claro

- Ambos modos de primera clase mediante tokens CSS (tabla 5.2).
- **Claro** por defecto en caja diurna; **oscuro** recomendado para KDS y pantallas de cliente en ambientes de baja luz.
- Conmutación por preferencia de sistema + override manual, persistente por dispositivo.

---

➡️ Siguiente: [Arquitectura técnica](06-arquitectura.md)
