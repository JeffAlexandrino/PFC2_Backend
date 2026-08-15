-- DropForeignKey
ALTER TABLE "comissoes" DROP CONSTRAINT "comissoes_salePersonId_fkey";

-- AlterTable
ALTER TABLE "comissoes" RENAME COLUMN "salePersonId" TO "userRoleId";

-- AddForeignKey
ALTER TABLE "comissoes" ADD CONSTRAINT "comissoes_userRoleId_fkey" FOREIGN KEY ("userRoleId") REFERENCES "user_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
