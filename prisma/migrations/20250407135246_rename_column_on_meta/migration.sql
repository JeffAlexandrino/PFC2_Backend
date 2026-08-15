-- DropForeignKey
ALTER TABLE "metas" DROP CONSTRAINT "metas_vendedorRoleId_fkey";

-- AlterTable
ALTER TABLE "metas" RENAME COLUMN "vendedorRoleId" TO "userRoleId";

-- AddForeignKey
ALTER TABLE "metas" ADD CONSTRAINT "metas_userRoleId_fkey" FOREIGN KEY ("userRoleId") REFERENCES "user_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
