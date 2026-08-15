/*
  Warnings:

  - You are about to drop the column `userRoleId` on the `VendedorComissao` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "VendedorComissao" DROP CONSTRAINT "VendedorComissao_userRoleId_fkey";

-- AlterTable
ALTER TABLE "VendedorComissao" DROP COLUMN "userRoleId",
ADD COLUMN     "vendedorRoleId" TEXT;

-- AddForeignKey
ALTER TABLE "VendedorComissao" ADD CONSTRAINT "VendedorComissao_vendedorRoleId_fkey" FOREIGN KEY ("vendedorRoleId") REFERENCES "user_roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
