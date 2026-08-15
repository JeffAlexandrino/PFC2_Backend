-- DropForeignKey
ALTER TABLE "comissoes" DROP CONSTRAINT "comissoes_vendedorRoleId_fkey";

-- DropForeignKey
ALTER TABLE "visitas" DROP CONSTRAINT "visitas_vendedorRoleId_fkey";

-- AlterTable
ALTER TABLE "comissoes" RENAME COLUMN "vendedorRoleId" TO "salePersonId";

-- AlterTable
ALTER TABLE "visitas" RENAME COLUMN "vendedorRoleId" TO "salePersonId";

-- AddForeignKey
ALTER TABLE "comissoes" ADD CONSTRAINT "comissoes_salePersonId_fkey" FOREIGN KEY ("salePersonId") REFERENCES "user_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitas" ADD CONSTRAINT "visitas_salePersonId_fkey" FOREIGN KEY ("salePersonId") REFERENCES "user_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
