/*
  Warnings:

  - You are about to drop the column `currentRole` on the `tokens` table. All the data in the column will be lost.
  - You are about to drop the column `userRoleId` on the `tokens` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "tokens" DROP CONSTRAINT "tokens_userRoleId_fkey";

-- AlterTable
ALTER TABLE "tokens" DROP COLUMN "currentRole",
DROP COLUMN "userRoleId",
ADD COLUMN     "currentUserRoleId" TEXT;

-- AddForeignKey
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_currentUserRoleId_fkey" FOREIGN KEY ("currentUserRoleId") REFERENCES "user_roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
