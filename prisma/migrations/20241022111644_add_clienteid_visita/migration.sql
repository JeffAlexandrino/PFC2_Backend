/*
  Warnings:

  - Added the required column `clienteId` to the `visitas` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "visitas" ADD COLUMN     "clienteId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "visitas" ADD CONSTRAINT "visitas_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
