/*
  Warnings:

  - Made the column `distributorPaid` on table `comissoes` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "comissoes" ADD COLUMN     "ativo" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "distributorPaid" SET NOT NULL;
