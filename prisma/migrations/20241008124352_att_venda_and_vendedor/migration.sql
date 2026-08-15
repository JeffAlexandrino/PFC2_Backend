/*
  Warnings:

  - You are about to drop the column `vendedorId` on the `vendas` table. All the data in the column will be lost.
  - You are about to drop the `_VendedorToVenda` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_VendedorToVenda" DROP CONSTRAINT "_VendedorToVenda_A_fkey";

-- DropForeignKey
ALTER TABLE "_VendedorToVenda" DROP CONSTRAINT "_VendedorToVenda_B_fkey";

-- DropForeignKey
ALTER TABLE "vendas" DROP CONSTRAINT "vendas_vendedorId_fkey";

-- AlterTable
ALTER TABLE "vendas" DROP COLUMN "vendedorId";

-- DropTable
DROP TABLE "_VendedorToVenda";

-- CreateTable
CREATE TABLE "_VendaToVendedor" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_VendaToVendedor_AB_unique" ON "_VendaToVendedor"("A", "B");

-- CreateIndex
CREATE INDEX "_VendaToVendedor_B_index" ON "_VendaToVendedor"("B");

-- AddForeignKey
ALTER TABLE "_VendaToVendedor" ADD CONSTRAINT "_VendaToVendedor_A_fkey" FOREIGN KEY ("A") REFERENCES "vendas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VendaToVendedor" ADD CONSTRAINT "_VendaToVendedor_B_fkey" FOREIGN KEY ("B") REFERENCES "vendedores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
