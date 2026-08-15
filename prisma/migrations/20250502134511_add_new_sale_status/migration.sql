/*
  Warnings:

  - Made the column `accountManagerId` on table `vendas` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "EstadoVenda" ADD VALUE 'DRAFT';
ALTER TYPE "EstadoVenda" ADD VALUE 'FINANCIAL_REVIEW';
ALTER TYPE "EstadoVenda" ADD VALUE 'TEAM_ASSIGNMENT';
ALTER TYPE "EstadoVenda" ADD VALUE 'CLOSED';

-- DropForeignKey
ALTER TABLE "vendas" DROP CONSTRAINT "vendas_accountManagerId_fkey";

-- AlterTable
ALTER TABLE "vendas" ALTER COLUMN "accountManagerId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_accountManagerId_fkey" FOREIGN KEY ("accountManagerId") REFERENCES "user_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
