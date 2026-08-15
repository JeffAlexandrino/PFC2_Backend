/*
  Warnings:

  - You are about to drop the column `userRoleId` on the `MetaVendaVendedor` table. All the data in the column will be lost.
  - You are about to drop the column `userRoleId` on the `comissoes` table. All the data in the column will be lost.
  - You are about to drop the column `userRoleId` on the `metas` table. All the data in the column will be lost.
  - You are about to drop the column `userRoleId` on the `vendas` table. All the data in the column will be lost.
  - You are about to drop the column `userRoleId` on the `visitas` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "MetaVendaVendedor" DROP CONSTRAINT "MetaVendaVendedor_userRoleId_fkey";

-- DropForeignKey
ALTER TABLE "comissoes" DROP CONSTRAINT "comissoes_userRoleId_fkey";

-- DropForeignKey
ALTER TABLE "metas" DROP CONSTRAINT "metas_userRoleId_fkey";

-- DropForeignKey
ALTER TABLE "vendas" DROP CONSTRAINT "vendas_userRoleId_fkey";

-- DropForeignKey
ALTER TABLE "visitas" DROP CONSTRAINT "visitas_userRoleId_fkey";

-- AlterTable
ALTER TABLE "MetaVendaVendedor" DROP COLUMN "userRoleId",
ADD COLUMN     "vendedorRoleId" TEXT;

-- AlterTable
ALTER TABLE "comissoes" DROP COLUMN "userRoleId",
ADD COLUMN     "vendedorRoleId" TEXT;

-- AlterTable
ALTER TABLE "metas" DROP COLUMN "userRoleId",
ADD COLUMN     "vendedorRoleId" TEXT;

-- AlterTable
ALTER TABLE "tokens" ADD COLUMN     "currentRole" "Role";

-- AlterTable
ALTER TABLE "vendas" DROP COLUMN "userRoleId",
ADD COLUMN     "vendedorRoleId" TEXT;

-- AlterTable
ALTER TABLE "visitas" DROP COLUMN "userRoleId",
ADD COLUMN     "vendedorRoleId" TEXT;

-- AddForeignKey
ALTER TABLE "metas" ADD CONSTRAINT "metas_vendedorRoleId_fkey" FOREIGN KEY ("vendedorRoleId") REFERENCES "user_roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetaVendaVendedor" ADD CONSTRAINT "MetaVendaVendedor_vendedorRoleId_fkey" FOREIGN KEY ("vendedorRoleId") REFERENCES "user_roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_vendedorRoleId_fkey" FOREIGN KEY ("vendedorRoleId") REFERENCES "user_roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comissoes" ADD CONSTRAINT "comissoes_vendedorRoleId_fkey" FOREIGN KEY ("vendedorRoleId") REFERENCES "user_roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitas" ADD CONSTRAINT "visitas_vendedorRoleId_fkey" FOREIGN KEY ("vendedorRoleId") REFERENCES "user_roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
