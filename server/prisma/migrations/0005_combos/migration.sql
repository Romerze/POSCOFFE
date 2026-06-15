-- CreateTable
CREATE TABLE "combo_componente" (
    "id" TEXT NOT NULL,
    "combo_variante_id" TEXT NOT NULL,
    "variante_id" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "combo_componente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "combo_componente_combo_variante_id_idx" ON "combo_componente"("combo_variante_id");

-- CreateIndex
CREATE UNIQUE INDEX "combo_componente_combo_variante_id_variante_id_key" ON "combo_componente"("combo_variante_id", "variante_id");

-- AddForeignKey
ALTER TABLE "combo_componente" ADD CONSTRAINT "combo_componente_combo_variante_id_fkey" FOREIGN KEY ("combo_variante_id") REFERENCES "variante"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "combo_componente" ADD CONSTRAINT "combo_componente_variante_id_fkey" FOREIGN KEY ("variante_id") REFERENCES "variante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

