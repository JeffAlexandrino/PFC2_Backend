/*
  Warnings:

  - The values [GERENTE_VENDAS] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('ADMIN', 'COMERCIAL_MANAGER', 'COMERCIAL_ASSISTANT', 'SOLUTION_ARCHITECT', 'COMMISSIONING_ANALYST', 'VENDEDOR');
ALTER TABLE "user_roles" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
COMMIT;

-- AlterEnum
ALTER TYPE "TipoGasto" ADD VALUE 'COFFE';
