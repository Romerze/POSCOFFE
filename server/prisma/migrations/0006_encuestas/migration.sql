-- CreateTable
CREATE TABLE "encuesta" (
    "id" TEXT NOT NULL,
    "pedido_id" TEXT NOT NULL,
    "local_id" TEXT NOT NULL,
    "cliente_id" TEXT,
    "puntaje" INTEGER NOT NULL,
    "comentario" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "encuesta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "encuesta_pedido_id_key" ON "encuesta"("pedido_id");

-- CreateIndex
CREATE INDEX "encuesta_local_id_idx" ON "encuesta"("local_id");

