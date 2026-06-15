-- CreateTable
CREATE TABLE "devolucion" (
    "id" TEXT NOT NULL,
    "pedido_id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "turno_id" TEXT,
    "motivo" TEXT NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "reincorpora_stock" BOOLEAN NOT NULL DEFAULT false,
    "total" BOOLEAN NOT NULL DEFAULT false,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "devolucion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devolucion_detalle" (
    "id" TEXT NOT NULL,
    "devolucion_id" TEXT NOT NULL,
    "detalle_pedido_id" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,

    CONSTRAINT "devolucion_detalle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "devolucion_pedido_id_idx" ON "devolucion"("pedido_id");

-- CreateIndex
CREATE INDEX "devolucion_detalle_devolucion_id_idx" ON "devolucion_detalle"("devolucion_id");

-- AddForeignKey
ALTER TABLE "devolucion" ADD CONSTRAINT "devolucion_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedido"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devolucion" ADD CONSTRAINT "devolucion_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devolucion_detalle" ADD CONSTRAINT "devolucion_detalle_devolucion_id_fkey" FOREIGN KEY ("devolucion_id") REFERENCES "devolucion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devolucion_detalle" ADD CONSTRAINT "devolucion_detalle_detalle_pedido_id_fkey" FOREIGN KEY ("detalle_pedido_id") REFERENCES "detalle_pedido"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

