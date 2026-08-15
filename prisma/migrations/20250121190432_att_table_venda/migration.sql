/*
  Warnings:

  - You are about to drop the column `vendedorRoleId` on the `vendas` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "vendas" DROP CONSTRAINT "vendas_vendedorRoleId_fkey";

-- AlterTable
ALTER TABLE "vendas" DROP COLUMN "vendedorRoleId";

-- CreateTable
CREATE TABLE "_UserRoleToVenda" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_UserRoleToVenda_AB_unique" ON "_UserRoleToVenda"("A", "B");

-- CreateIndex
CREATE INDEX "_UserRoleToVenda_B_index" ON "_UserRoleToVenda"("B");

-- AddForeignKey
ALTER TABLE "_UserRoleToVenda" ADD CONSTRAINT "_UserRoleToVenda_A_fkey" FOREIGN KEY ("A") REFERENCES "user_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserRoleToVenda" ADD CONSTRAINT "_UserRoleToVenda_B_fkey" FOREIGN KEY ("B") REFERENCES "vendas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
