# Prompt para Claude Design — POSCOFFE (diseño desde cero)

> Copia el bloque de abajo y pégalo en Claude Design. Si acepta adjuntar archivos,
> añade también `docs/11-api-reference.md` (capacidades exactas de la API).
> Este prompt NO describe ninguna interfaz: solo el producto, los usuarios y lo
> que el backend permite hacer. El diseño y las pantallas los propones tú.

---

Actúa como diseñador de producto y arquitecto de frontend. Tienes un backend ya construido y quiero que diseñes desde cero el FRONTEND IDEAL para él. No existe un frontend previo que debas respetar ni replicar: tú decides la arquitectura de información, las pantallas, los flujos, la identidad visual y los componentes. Diséñalo como si partieras de una hoja en blanco, optimizando para los usuarios y para todo lo que el backend permite.

EL PRODUCTO
POSCOFFE es un POS (punto de venta) inteligente para cafeterías modernas de alto tránsito. Objetivos del negocio: vender muy rápido en hora pico, mejorar la experiencia del cliente y dar inteligencia comercial al dueño. Opera venta presencial en mostrador y también pedidos por QR en mesa y para recoger (pick-up). Es multi-local.

USUARIOS Y SUS METAS (no son pantallas; son objetivos a resolver con tu diseño)
- Cajero: tomar y cobrar pedidos en segundos, incluso en hora pico; personalizar bebidas; reconocer al cliente frecuente.
- Barista: ver los pedidos a preparar en tiempo real, en orden y a tiempo, sin teclado.
- Administrador: mantener catálogo, recetas, inventario, precios y promociones de su local.
- Dueño: entender el negocio de un vistazo y decidir con datos, desde cualquier dispositivo, en uno o varios locales.
- Cliente final: pedir fácil desde su móvil por QR, ser reconocido y dar feedback.

LO QUE EL BACKEND PERMITE HACER (el universo de funciones a exponer; tú decides cómo y dónde)
- Autenticación por usuario (email/contraseña y PIN rápido) con roles y permisos (Dueño, Administrador, Cajero, Barista, Cliente).
- Catálogo: categorías, productos, variantes (tamaños/precios) y modificadores (p. ej. tipo de leche, shots) con grupos de selección única/múltiple.
- Personalización de bebidas con precio dinámico según variante y modificadores.
- Recetas por producto e inventario por insumo: cada venta descuenta stock automáticamente; alertas de stock crítico; reposiciones, mermas y ajustes.
- Combos (un producto compuesto de varios) y upselling (sugerencias de "comprado junto con").
- Pedidos: creación, estados, pagos (efectivo/tarjeta/digital), cancelación; idempotencia para offline.
- Promociones dinámicas: descuento %/monto, hora valle, NxM, con condiciones (franja horaria, monto mínimo, productos); se reflejan como descuento en el cobro.
- Pantalla de cocina/barista (KDS) en TIEMPO REAL vía WebSocket: cola de pedidos con estados y tiempos.
- Caja y turnos: apertura con fondo, retiros y cierre con cuadre (reporte Z).
- Clientes y fidelización: identificación por teléfono, puntos y niveles, canje.
- Inteligencia de cliente: recomendaciones "tu café ideal" por historial, segmentación RFM y marca VIP.
- Suscripciones (planes tipo "X cafés/mes") y su consumo.
- Devoluciones totales/parciales (con reversión de stock y puntos).
- Encuestas post-compra (puntaje + comentario) y panel de experiencia/NPS.
- Gamificación: retos (visitas/gasto), insignias y rachas.
- Reportes e inteligencia comercial: ventas del día/KPIs, ticket promedio, productos top, mapa de calor por hora, predicción de quiebres de stock, márgenes por producto, ranking de personal.
- Pedidos por QR / pick-up desde el móvil del cliente, sin login de staff.
- Multi-local: datos y reportes por sede.

REALIDADES TÉCNICAS QUE CONDICIONAN LA EXPERIENCIA (no la estética)
- El KDS debe ser en tiempo real (WebSocket).
- Debe funcionar offline-first en caja (seguir vendiendo sin internet y sincronizar luego; la API soporta idempotencia por operationId).
- Uso intensivo y táctil en caja/cocina (probablemente tablet); administración y dashboard encajan mejor en desktop; la app de cliente es móvil.
- Roles y permisos: cada usuario ve solo lo que le corresponde.
- Montos monetarios llegan como string decimal.

LA API (ya existe; solo la consumes)
- REST en base `/api/v1` + WebSocket (Socket.IO) para tiempo real. Auth con token Bearer (login en `POST /auth/login`).
- El catálogo COMPLETO de endpoints, permisos por ruta y eventos WebSocket está en el archivo `docs/11-api-reference.md`. Úsalo como contrato. Si no lo tienes a la vista, pídemelo.

LIBERTAD Y RESTRICCIONES
- Libertad total de diseño: tú propones la identidad visual (paleta, tipografía, tono), la arquitectura de información, el conjunto de pantallas, la navegación, los componentes y las microinteracciones. Sorpréndeme con la mejor experiencia posible para una cafetería moderna.
- Innegociable: cubrir las capacidades del backend, respetar los roles/permisos, soportar el tiempo real del KDS y el modo offline en caja, ofrecer modo claro y oscuro, ser responsive según el contexto de cada usuario, y consumir los endpoints existentes (no inventes endpoints; si falta algo, indícalo).
- Stack para que integre con el proyecto: preferiblemente React + TypeScript + TailwindCSS (estado con Zustand + TanStack Query, tiempo real con socket.io-client). Si propones otra cosa, justifícalo.

QUÉ ESPERO DE TI
1. Una propuesta breve de arquitectura de información y flujos por rol (qué pantallas existen y por qué).
2. Un sistema de diseño propio (tokens de color claro/oscuro, tipografía, componentes base).
3. El diseño de las pantallas (claro y oscuro; responsive según el rol) cubriendo todas las capacidades.
4. Implementación en componentes conectables a la API descrita.

Empieza proponiendo la arquitectura de información y la identidad visual antes de entrar al detalle de cada pantalla.
