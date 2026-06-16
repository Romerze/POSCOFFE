-- CreateTable
CREATE TABLE "reto" (
    "id" TEXT NOT NULL,
    "local_id" TEXT,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipo" TEXT NOT NULL,
    "objetivo" DECIMAL(10,2) NOT NULL,
    "periodo_dias" INTEGER NOT NULL,
    "recompensa_puntos" INTEGER NOT NULL,
    "insignia" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "reto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reto_progreso" (
    "id" TEXT NOT NULL,
    "reto_id" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "progreso" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "periodo_inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completados" INTEGER NOT NULL DEFAULT 0,
    "ultimo_completado" TIMESTAMP(3),

    CONSTRAINT "reto_progreso_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reto_local_id_idx" ON "reto"("local_id");

-- CreateIndex
CREATE INDEX "reto_progreso_cliente_id_idx" ON "reto_progreso"("cliente_id");

-- CreateIndex
CREATE UNIQUE INDEX "reto_progreso_reto_id_cliente_id_key" ON "reto_progreso"("reto_id", "cliente_id");

-- AddForeignKey
ALTER TABLE "reto_progreso" ADD CONSTRAINT "reto_progreso_reto_id_fkey" FOREIGN KEY ("reto_id") REFERENCES "reto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reto_progreso" ADD CONSTRAINT "reto_progreso_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

