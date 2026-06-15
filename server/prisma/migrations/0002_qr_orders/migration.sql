-- DropForeignKey
ALTER TABLE "pedido" DROP CONSTRAINT "pedido_usuario_id_fkey";

-- AlterTable
ALTER TABLE "pedido" ALTER COLUMN "usuario_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "pedido" ADD CONSTRAINT "pedido_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

