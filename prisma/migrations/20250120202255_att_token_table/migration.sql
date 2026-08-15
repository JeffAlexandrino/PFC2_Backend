/*
  Warnings:

  - You are about to drop the column `currentEmpresaId` on the `tokens` table. All the data in the column will be lost.
  - You are about to drop the column `empresaRoleId` on the `tokens` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tokens" DROP COLUMN "currentEmpresaId",
DROP COLUMN "empresaRoleId",
ADD COLUMN     "userRoleId" TEXT;

-- AddForeignKey
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_userRoleId_fkey" FOREIGN KEY ("userRoleId") REFERENCES "user_roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
