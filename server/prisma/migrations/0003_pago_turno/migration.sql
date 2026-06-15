-- AlterTable
ALTER TABLE "pago" ADD COLUMN     "turno_id" TEXT;

-- CreateIndex
CREATE INDEX "pago_turno_id_idx" ON "pago"("turno_id");

-- AddForeignKey
ALTER TABLE "pago" ADD CONSTRAINT "pago_turno_id_fkey" FOREIGN KEY ("turno_id") REFERENCES "turno"("id") ON DELETE SET NULL ON UPDATE CASCADE;

