/*
  Warnings:

  - A unique constraint covering the columns `[userId,empresaId,role]` on the table `user_roles` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "user_roles_userId_key";

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_userId_empresaId_role_key" ON "user_roles"("userId", "empresaId", "role");
