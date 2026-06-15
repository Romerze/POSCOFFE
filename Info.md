Actúa como un arquitecto de software senior, diseñador UX/UI experto en retail gastronómico y consultor de innovación para cafeterías modernas.

Quiero que diseñes un sistema POS para una cafetería moderna, dinámica e innovadora. No quiero un POS común que solo registre ventas, imprima tickets y controle inventario. Quiero una solución diferencial, pensada para mejorar la experiencia del cliente, acelerar la operación del negocio y dar inteligencia comercial al dueño.

El sistema debe estar orientado a una cafetería con alto movimiento, estilo moderno, atención rápida, pedidos personalizados, clientes recurrentes, promociones dinámicas y venta presencial, delivery y pick-up.

---

## 0. Decisiones y restricciones del proyecto (cerradas)

Estas decisiones están tomadas y condicionan todo el diseño. La propuesta debe respetarlas, no reabrirlas.

- **Alcance**: se construye la **visión completa** del brief, pero **entregada por fases**. El roadmap (sección 9) define qué entra en cada fase; nada queda fuera del producto final, pero el MVP no lo incluye todo de golpe.
- **Facturación fiscal**: el MVP emite **solo tickets/comprobantes internos** (no fiscales). La arquitectura debe dejar la **facturación electrónica como módulo desacoplado** (interfaz/adaptador) para integrar SUNAT / SAT u otro ente fiscal en una fase posterior sin reescribir el núcleo de ventas.
- **Multi-local desde el día 1**: el modelo de datos lleva `local_id` en todas las entidades transaccionales y de catálogo aplicables; la sincronización, los reportes y los permisos se diseñan para varias sedes desde el inicio.
- **Hardware y stack**: uso principal en **desktop** (PC/caja por sede) con **stack propio y control total**: backend Node (NestJS) + PostgreSQL + tiempo real propio (WebSockets). Sin BaaS gestionado para el núcleo.
- **API**: se usa **REST + WebSockets** (no GraphQL). REST para CRUD/transacciones; WebSockets para KDS, inventario en vivo y estado de pedidos.
- **Estrategia offline-first + tiempo real + multi-local**: se reconoce como el punto técnico más difícil. Cada sede opera con una cola local de operaciones y sincroniza contra el servidor central; conflictos resueltos con reglas explícitas (last-write-wins por defecto, y reglas dedicadas para stock y caja). Debe documentarse en la sección 6.
- **Algoritmos / predicción (arranque en frío)**: predicción de demanda, recomendador "tu café ideal", predicción de quiebres de stock y sugerencia de productos **arrancan con reglas heurísticas** (no ML) porque una cafetería nueva no tiene datos históricos. Se migra a modelos estadísticos/ML cuando exista un histórico suficiente (~2-3 meses de ventas). La propuesta debe distinguir explícitamente la versión heurística de la versión con modelos.
- **Etiquetado por fase**: cada funcionalidad de las secciones 2 y 3 debe marcarse como `MVP`, `Fase 2` o `Visión`, de forma coherente con la sección 9.

---

Desarrolla una propuesta completa que incluya:

1. Concepto general del sistema

- Nombre tentativo del POS.
- Propuesta de valor.
- Qué lo hace diferente frente a un POS tradicional.
- Tipo de cafetería ideal para usarlo.

2. Funcionalidades innovadoras
   Incluye módulos como:

- Toma de pedidos rápida e inteligente.
- Personalización avanzada de bebidas.
- Sugerencias automáticas según historial del cliente.
- Predicción de demanda por hora, día, clima o temporada.
- Control de inventario en tiempo real.
- Alertas inteligentes de insumos críticos.
- Programa de fidelización moderno.
- Pedidos por QR desde mesa o para recoger.
- Pantalla de cocina/barista en tiempo real.
- Integración con pagos digitales.
- Reportes inteligentes para el dueño.
- Dashboard con métricas clave.
- Promociones dinámicas según stock, horario o comportamiento de compra.
- Gestión de combos y upselling automático.
- Perfil de clientes frecuentes.
- Modo offline para seguir vendiendo sin internet.
- Integración con delivery.
- Gestión de turnos y desempeño del personal.

3. Funcionalidades diferenciales y poco comunes
   Propón ideas innovadoras como:

- Motor de recomendaciones tipo “tu café ideal”.
- Sistema de suscripción mensual para clientes frecuentes.
- Mapa de calor de productos más pedidos por horario.
- Algoritmo que sugiera nuevos productos según ventas.
- Predicción de quiebres de stock.
- Alertas de merma o desperdicio.
- Gamificación para clientes recurrentes.
- Pedidos por voz para el cajero.
- Panel de experiencia del cliente.
- Integración con pantallas digitales del local.
- Promociones automáticas para horas valle.
- Identificación de clientes VIP.
- Segmentación automática de clientes.
- Encuestas rápidas post-compra.
- Ranking de baristas o productividad por turno.
- Control de preparación para reducir tiempos de espera.
- Modo “rush hour” para simplificar la interfaz en horas pico.

4. Experiencia de usuario
   Diseña la experiencia para:

- Cajero.
- Barista.
- Administrador.
- Cliente final.
- Dueño del negocio.

Incluye flujos principales:

- Venta rápida en mostrador.
- Pedido personalizado de bebida.
- Pedido por QR.
- Pedido para recoger.
- Cliente frecuente con recompensas.
- Cierre de caja.
- Reposición de inventario.
- Creación de promociones.

5. Diseño visual
   Propón una interfaz moderna, limpia y dinámica:

- Estilo visual.
- Colores recomendados.
- Componentes principales.
- Pantallas clave.
- Diseño responsive para tablet, desktop y móvil.
- Microinteracciones.
- Diseño para uso rápido con pantalla táctil.
- Modo oscuro y modo claro.

6. Arquitectura técnica
   Propón una arquitectura moderna:

- Frontend.
- Backend.
- Base de datos.
- API REST + WebSockets (decisión cerrada, ver sección 0): REST para CRUD/transacciones, WebSockets para tiempo real (KDS, inventario, estado de pedidos).
- Autenticación.
- Roles y permisos.
- Modo offline-first.
- Sincronización de datos.
- Integración con pasarelas de pago.
- Integración con impresoras térmicas.
- Integración con pantallas de cocina/barista.
- Seguridad de datos.
- Escalabilidad para múltiples locales.

7. Modelo de datos
   Diseña entidades principales como:

- Usuario.
- Rol.
- Producto.
- Categoría.
- Variante.
- Modificador.
- Pedido.
- Detalle de pedido.
- Pago.
- Cliente.
- Fidelización.
- Inventario.
- Insumo.
- Receta.
- Promoción.
- Turno.
- Caja.
- Local.
- Proveedor.
- Merma.
- Suscripción.

Incluye relaciones entre entidades.

8. Reglas de negocio
   Define reglas para:

- Precios.
- Promociones.
- Stock.
- Inventario por receta.
- Puntos de fidelización.
- Suscripciones.
- Descuentos.
- Cancelaciones.
- Devoluciones.
- Cierre de caja.
- Turnos.
- Alertas automáticas.

9. MVP
   Define un MVP realista para lanzar la primera versión:

- Funciones indispensables.
- Funciones innovadoras mínimas.
- Funciones que pueden esperar.
- Priorización por fases.
- Tiempo estimado por etapa.
- Riesgos técnicos.

10. Entregables técnicos
    Genera:

- Historias de usuario.
- Casos de uso.
- Backlog inicial.
- Diagrama de módulos.
- Esquema de base de datos.
- Endpoints principales.
- Pantallas principales.
- Flujo de navegación.
- Recomendaciones de stack tecnológico.
- Consideraciones de seguridad.
- Plan de pruebas.
- Roadmap de evolución.

El resultado debe ser práctico, innovador y orientado a construir un producto real. Evita ideas genéricas. Propón detalles concretos, diferenciadores y aplicables a una cafetería moderna.
