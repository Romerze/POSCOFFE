-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "local" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'America/Lima',
    "moneda" TEXT NOT NULL DEFAULT 'PEN',
    "config" JSONB NOT NULL DEFAULT '{}',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "local_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rol" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "permisos" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "rol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario" (
    "id" TEXT NOT NULL,
    "local_id" TEXT,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "pin_hash" TEXT,
    "rol_id" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categoria" (
    "id" TEXT NOT NULL,
    "local_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "icono" TEXT,

    CONSTRAINT "categoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "producto" (
    "id" TEXT NOT NULL,
    "local_id" TEXT NOT NULL,
    "categoria_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "imagen" TEXT,
    "es_combo" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "variante" (
    "id" TEXT NOT NULL,
    "producto_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "sku" TEXT,
    "precio" DECIMAL(10,2) NOT NULL,
    "costo_calculado" DECIMAL(10,2) NOT NULL DEFAULT 0,

    CONSTRAINT "variante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modificador_grupo" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "seleccion" TEXT NOT NULL DEFAULT 'unica',
    "min" INTEGER NOT NULL DEFAULT 0,
    "max" INTEGER,
    "obligatorio" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "modificador_grupo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modificador" (
    "id" TEXT NOT NULL,
    "grupo_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "precio_extra" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "insumo_id" TEXT,
    "cantidad_insumo" DECIMAL(10,4),

    CONSTRAINT "modificador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "producto_modificador_grupo" (
    "producto_id" TEXT NOT NULL,
    "grupo_id" TEXT NOT NULL,

    CONSTRAINT "producto_modificador_grupo_pkey" PRIMARY KEY ("producto_id","grupo_id")
);

-- CreateTable
CREATE TABLE "insumo" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "unidad" TEXT NOT NULL,
    "costo_unitario" DECIMAL(10,4) NOT NULL,
    "perecedero" BOOLEAN NOT NULL DEFAULT false,
    "vida_util_dias" INTEGER,

    CONSTRAINT "insumo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receta" (
    "id" TEXT NOT NULL,
    "variante_id" TEXT NOT NULL,
    "insumo_id" TEXT NOT NULL,
    "cantidad" DECIMAL(10,4) NOT NULL,

    CONSTRAINT "receta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventario" (
    "id" TEXT NOT NULL,
    "local_id" TEXT NOT NULL,
    "insumo_id" TEXT NOT NULL,
    "stock_actual" DECIMAL(12,4) NOT NULL DEFAULT 0,
    "stock_minimo" DECIMAL(12,4) NOT NULL DEFAULT 0,
    "punto_reorden" DECIMAL(12,4) NOT NULL DEFAULT 0,

    CONSTRAINT "inventario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimiento_stock" (
    "id" TEXT NOT NULL,
    "local_id" TEXT NOT NULL,
    "insumo_id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "delta" DECIMAL(12,4) NOT NULL,
    "ref_id" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimiento_stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proveedor" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "contacto" TEXT,
    "condiciones" TEXT,

    CONSTRAINT "proveedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reposicion" (
    "id" TEXT NOT NULL,
    "local_id" TEXT NOT NULL,
    "insumo_id" TEXT NOT NULL,
    "proveedor_id" TEXT,
    "cantidad" DECIMAL(12,4) NOT NULL,
    "costo" DECIMAL(10,2) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario_id" TEXT NOT NULL,

    CONSTRAINT "reposicion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "merma" (
    "id" TEXT NOT NULL,
    "local_id" TEXT NOT NULL,
    "insumo_id" TEXT NOT NULL,
    "cantidad" DECIMAL(12,4) NOT NULL,
    "motivo" TEXT NOT NULL,
    "costo" DECIMAL(10,2) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario_id" TEXT NOT NULL,

    CONSTRAINT "merma_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerta_stock" (
    "id" TEXT NOT NULL,
    "local_id" TEXT NOT NULL,
    "insumo_id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'abierta',
    "creada_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alerta_stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedido" (
    "id" TEXT NOT NULL,
    "operation_id" TEXT NOT NULL,
    "local_id" TEXT NOT NULL,
    "cliente_id" TEXT,
    "usuario_id" TEXT NOT NULL,
    "canal" TEXT NOT NULL,
    "mesa" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "subtotal" DECIMAL(10,2) NOT NULL,
    "descuento" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detalle_pedido" (
    "id" TEXT NOT NULL,
    "pedido_id" TEXT NOT NULL,
    "variante_id" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unit" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "notas" TEXT,

    CONSTRAINT "detalle_pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detalle_modificador" (
    "id" TEXT NOT NULL,
    "detalle_pedido_id" TEXT NOT NULL,
    "modificador_id" TEXT NOT NULL,
    "precio_extra" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "detalle_modificador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pago" (
    "id" TEXT NOT NULL,
    "pedido_id" TEXT NOT NULL,
    "metodo" TEXT NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "propina" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "referencia" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'aprobado',
    "proveedor" TEXT,

    CONSTRAINT "pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cliente" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT,
    "email" TEXT,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "segmento" TEXT,
    "es_vip" BOOLEAN NOT NULL DEFAULT false,
    "preferencias" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fidelizacion" (
    "id" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "puntos" INTEGER NOT NULL DEFAULT 0,
    "nivel" TEXT NOT NULL DEFAULT 'base',
    "actualizado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fidelizacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimiento_puntos" (
    "id" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "pedido_id" TEXT,
    "tipo" TEXT NOT NULL,
    "puntos" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimiento_puntos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suscripcion" (
    "id" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'activa',
    "inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fin" TIMESTAMP(3),
    "limite_consumos" INTEGER,
    "precio" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "suscripcion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consumo_suscripcion" (
    "id" TEXT NOT NULL,
    "suscripcion_id" TEXT NOT NULL,
    "pedido_id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consumo_suscripcion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promocion" (
    "id" TEXT NOT NULL,
    "local_id" TEXT,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "vigencia_desde" TIMESTAMP(3) NOT NULL,
    "vigencia_hasta" TIMESTAMP(3) NOT NULL,
    "prioridad" INTEGER NOT NULL DEFAULT 0,
    "activa" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "promocion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promocion_regla" (
    "id" TEXT NOT NULL,
    "promocion_id" TEXT NOT NULL,
    "condicion" JSONB NOT NULL,
    "efecto" JSONB NOT NULL,

    CONSTRAINT "promocion_regla_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "turno" (
    "id" TEXT NOT NULL,
    "local_id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "apertura" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cierre" TIMESTAMP(3),
    "estado" TEXT NOT NULL DEFAULT 'abierto',

    CONSTRAINT "turno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "caja" (
    "id" TEXT NOT NULL,
    "local_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'cerrada',

    CONSTRAINT "caja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimiento_caja" (
    "id" TEXT NOT NULL,
    "caja_id" TEXT NOT NULL,
    "turno_id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimiento_caja_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rol_nombre_key" ON "rol"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- CreateIndex
CREATE INDEX "usuario_local_id_idx" ON "usuario"("local_id");

-- CreateIndex
CREATE INDEX "categoria_local_id_idx" ON "categoria"("local_id");

-- CreateIndex
CREATE INDEX "producto_local_id_idx" ON "producto"("local_id");

-- CreateIndex
CREATE INDEX "producto_categoria_id_idx" ON "producto"("categoria_id");

-- CreateIndex
CREATE INDEX "variante_producto_id_idx" ON "variante"("producto_id");

-- CreateIndex
CREATE INDEX "modificador_grupo_id_idx" ON "modificador"("grupo_id");

-- CreateIndex
CREATE UNIQUE INDEX "receta_variante_id_insumo_id_key" ON "receta"("variante_id", "insumo_id");

-- CreateIndex
CREATE UNIQUE INDEX "inventario_local_id_insumo_id_key" ON "inventario"("local_id", "insumo_id");

-- CreateIndex
CREATE INDEX "movimiento_stock_local_id_insumo_id_idx" ON "movimiento_stock"("local_id", "insumo_id");

-- CreateIndex
CREATE INDEX "reposicion_local_id_idx" ON "reposicion"("local_id");

-- CreateIndex
CREATE INDEX "merma_local_id_idx" ON "merma"("local_id");

-- CreateIndex
CREATE INDEX "alerta_stock_local_id_idx" ON "alerta_stock"("local_id");

-- CreateIndex
CREATE UNIQUE INDEX "pedido_operation_id_key" ON "pedido"("operation_id");

-- CreateIndex
CREATE INDEX "pedido_local_id_creado_en_idx" ON "pedido"("local_id", "creado_en");

-- CreateIndex
CREATE INDEX "detalle_pedido_pedido_id_idx" ON "detalle_pedido"("pedido_id");

-- CreateIndex
CREATE INDEX "detalle_modificador_detalle_pedido_id_idx" ON "detalle_modificador"("detalle_pedido_id");

-- CreateIndex
CREATE INDEX "pago_pedido_id_idx" ON "pago"("pedido_id");

-- CreateIndex
CREATE UNIQUE INDEX "cliente_telefono_key" ON "cliente"("telefono");

-- CreateIndex
CREATE UNIQUE INDEX "cliente_email_key" ON "cliente"("email");

-- CreateIndex
CREATE UNIQUE INDEX "fidelizacion_cliente_id_key" ON "fidelizacion"("cliente_id");

-- CreateIndex
CREATE INDEX "movimiento_puntos_cliente_id_idx" ON "movimiento_puntos"("cliente_id");

-- CreateIndex
CREATE INDEX "suscripcion_cliente_id_idx" ON "suscripcion"("cliente_id");

-- CreateIndex
CREATE INDEX "consumo_suscripcion_suscripcion_id_idx" ON "consumo_suscripcion"("suscripcion_id");

-- CreateIndex
CREATE INDEX "promocion_local_id_idx" ON "promocion"("local_id");

-- CreateIndex
CREATE INDEX "promocion_regla_promocion_id_idx" ON "promocion_regla"("promocion_id");

-- CreateIndex
CREATE INDEX "turno_local_id_idx" ON "turno"("local_id");

-- CreateIndex
CREATE INDEX "caja_local_id_idx" ON "caja"("local_id");

-- CreateIndex
CREATE INDEX "movimiento_caja_caja_id_idx" ON "movimiento_caja"("caja_id");

-- CreateIndex
CREATE INDEX "movimiento_caja_turno_id_idx" ON "movimiento_caja"("turno_id");

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_local_id_fkey" FOREIGN KEY ("local_id") REFERENCES "local"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "rol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categoria" ADD CONSTRAINT "categoria_local_id_fkey" FOREIGN KEY ("local_id") REFERENCES "local"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto" ADD CONSTRAINT "producto_local_id_fkey" FOREIGN KEY ("local_id") REFERENCES "local"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto" ADD CONSTRAINT "producto_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variante" ADD CONSTRAINT "variante_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modificador" ADD CONSTRAINT "modificador_grupo_id_fkey" FOREIGN KEY ("grupo_id") REFERENCES "modificador_grupo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modificador" ADD CONSTRAINT "modificador_insumo_id_fkey" FOREIGN KEY ("insumo_id") REFERENCES "insumo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto_modificador_grupo" ADD CONSTRAINT "producto_modificador_grupo_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto_modificador_grupo" ADD CONSTRAINT "producto_modificador_grupo_grupo_id_fkey" FOREIGN KEY ("grupo_id") REFERENCES "modificador_grupo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receta" ADD CONSTRAINT "receta_variante_id_fkey" FOREIGN KEY ("variante_id") REFERENCES "variante"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receta" ADD CONSTRAINT "receta_insumo_id_fkey" FOREIGN KEY ("insumo_id") REFERENCES "insumo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventario" ADD CONSTRAINT "inventario_local_id_fkey" FOREIGN KEY ("local_id") REFERENCES "local"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventario" ADD CONSTRAINT "inventario_insumo_id_fkey" FOREIGN KEY ("insumo_id") REFERENCES "insumo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimiento_stock" ADD CONSTRAINT "movimiento_stock_local_id_fkey" FOREIGN KEY ("local_id") REFERENCES "local"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimiento_stock" ADD CONSTRAINT "movimiento_stock_insumo_id_fkey" FOREIGN KEY ("insumo_id") REFERENCES "insumo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reposicion" ADD CONSTRAINT "reposicion_local_id_fkey" FOREIGN KEY ("local_id") REFERENCES "local"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reposicion" ADD CONSTRAINT "reposicion_insumo_id_fkey" FOREIGN KEY ("insumo_id") REFERENCES "insumo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reposicion" ADD CONSTRAINT "reposicion_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "proveedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reposicion" ADD CONSTRAINT "reposicion_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "merma" ADD CONSTRAINT "merma_local_id_fkey" FOREIGN KEY ("local_id") REFERENCES "local"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "merma" ADD CONSTRAINT "merma_insumo_id_fkey" FOREIGN KEY ("insumo_id") REFERENCES "insumo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "merma" ADD CONSTRAINT "merma_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerta_stock" ADD CONSTRAINT "alerta_stock_local_id_fkey" FOREIGN KEY ("local_id") REFERENCES "local"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido" ADD CONSTRAINT "pedido_local_id_fkey" FOREIGN KEY ("local_id") REFERENCES "local"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido" ADD CONSTRAINT "pedido_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido" ADD CONSTRAINT "pedido_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_pedido" ADD CONSTRAINT "detalle_pedido_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_pedido" ADD CONSTRAINT "detalle_pedido_variante_id_fkey" FOREIGN KEY ("variante_id") REFERENCES "variante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_modificador" ADD CONSTRAINT "detalle_modificador_detalle_pedido_id_fkey" FOREIGN KEY ("detalle_pedido_id") REFERENCES "detalle_pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_modificador" ADD CONSTRAINT "detalle_modificador_modificador_id_fkey" FOREIGN KEY ("modificador_id") REFERENCES "modificador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pago" ADD CONSTRAINT "pago_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fidelizacion" ADD CONSTRAINT "fidelizacion_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimiento_puntos" ADD CONSTRAINT "movimiento_puntos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimiento_puntos" ADD CONSTRAINT "movimiento_puntos_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedido"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suscripcion" ADD CONSTRAINT "suscripcion_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consumo_suscripcion" ADD CONSTRAINT "consumo_suscripcion_suscripcion_id_fkey" FOREIGN KEY ("suscripcion_id") REFERENCES "suscripcion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consumo_suscripcion" ADD CONSTRAINT "consumo_suscripcion_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedido"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promocion" ADD CONSTRAINT "promocion_local_id_fkey" FOREIGN KEY ("local_id") REFERENCES "local"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promocion_regla" ADD CONSTRAINT "promocion_regla_promocion_id_fkey" FOREIGN KEY ("promocion_id") REFERENCES "promocion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turno" ADD CONSTRAINT "turno_local_id_fkey" FOREIGN KEY ("local_id") REFERENCES "local"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turno" ADD CONSTRAINT "turno_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "caja" ADD CONSTRAINT "caja_local_id_fkey" FOREIGN KEY ("local_id") REFERENCES "local"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimiento_caja" ADD CONSTRAINT "movimiento_caja_caja_id_fkey" FOREIGN KEY ("caja_id") REFERENCES "caja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimiento_caja" ADD CONSTRAINT "movimiento_caja_turno_id_fkey" FOREIGN KEY ("turno_id") REFERENCES "turno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

