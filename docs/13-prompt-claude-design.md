# Prompt para Claude Design — POSCOFFE

> Copia el bloque de abajo y pégalo en Claude Design. Si acepta adjuntar archivos,
> añade también `docs/11-api-reference.md` (detalle exacto de endpoints).

---

Diseña y construye el frontend de POSCOFFE, un POS (punto de venta) inteligente para cafeterías modernas de alto tránsito. Es una app web MULTI-ROL (una sola app, vistas según rol) que consume una API REST + WebSocket ya existente. El backend ya está hecho; tú solo construyes el frontend.

OBJETIVO: app PWA offline-first, táctil, con modo claro y oscuro. Tablet-first para Caja y Cocina; desktop para Dashboard/Administración; móvil para la app de cliente por QR.

STACK: React + TypeScript + Vite + TailwindCSS. Estado con Zustand (UI/POS) y TanStack Query (datos). Tiempo real con socket.io-client.

MARCA Y ESTILO: cálido (café de especialidad), moderno y limpio, inspiración specialty coffee + dashboards tipo Linear/Vercel, pero muy legible y táctil (botones ≥48px en operación). Bordes 12–16px, sombras sutiles, microinteracciones (feedback al agregar producto, cronómetro KDS con semáforo, skeletons, toasts). Cubre siempre los estados: cargando, vacío, error y offline (banner persistente).

TOKENS DE COLOR (claro / oscuro):
- bg #FAF7F2 / #1A1614 · surface #FFFFFF / #262019
- primary #6F4E37 / #C8966B · accent #E07A3E / #F08C4B
- success #2E9E5B · warning #E0A52E · danger #D14848
- text #2B2420 / #F2EDE6 · muted #8A7F75 / #A89A8C

ROLES Y VISTAS: Cajero→Caja; Barista→Cocina(KDS); Admin y Dueño→Caja, Cocina, Insights y Administración; Cliente→app pública por QR (sin login de staff). Barra superior con navegación por rol, toggle de tema, indicador de conexión, usuario y logout.

PANTALLAS:
1. Login (email+contraseña, opción PIN).
2. CAJA (estrella, tablet horizontal): catálogo en grilla por categoría + barra de cliente (identificar por teléfono, muestra puntos/VIP y recomendación "tu café ideal") + modal de personalización (variante + modificadores con precio dinámico) + ticket lateral con subtotal, DESCUENTO DE PROMO EN VIVO y total, y cobro Efectivo/Tarjeta/Digital.
3. COCINA/KDS (tiempo real, pantalla completa): 3 columnas Pendientes→En preparación→Listos; tarjetas con ítems+modificadores, notas y cronómetro con semáforo (verde/ámbar/rojo); botón para avanzar estado. Usa WebSocket (kds:join, kds:order_created/updated).
4. INSIGHTS/Dashboard (dueño): KPIs del día, mapa de calor por hora (barras), predicción de quiebres, márgenes por producto, ranking de personal y NPS/experiencia con comentarios.
5. ADMINISTRACIÓN: catálogo, recetas, combos, inventario+alertas, promociones, suscripciones, retos (gamificación), turnos/caja con reporte Z, devoluciones.
6. APP DE CLIENTE POR QR (móvil, sin login): menú del local, personalizar y enviar pedido (canal qr/pickup), encuesta post-compra de 1 toque (😞/😐/😀), y opcional "Club" con puntos, insignias y racha.

REQUISITOS: responsive (tablet/desktop/móvil), modo oscuro por tokens y persistente, offline-first con indicador de conexión, accesibilidad táctil (nada crítico por hover, confirmación en acciones destructivas, alto contraste).

ENTREGA: sistema de diseño (tokens, tipografía y componentes base: botón, tarjeta de producto, panel de modificadores, ticket, tarjeta KDS, KPI card, tabla, modal de cobro, chips, toasts, badges) + las pantallas en claro y oscuro + estados (cargando/vacío/error/offline) + componentes React+Tailwind conectables a la API.

REFERENCIA DE API: la lista completa de endpoints (rutas, auth, permisos y eventos WebSocket) está en el archivo docs/11-api-reference.md del proyecto; los contratos de tipos en el paquete @poscoffe/types. Base URL /api/v1, auth Bearer (login en POST /auth/login). Pégame ese archivo si necesitas el detalle de endpoints.
