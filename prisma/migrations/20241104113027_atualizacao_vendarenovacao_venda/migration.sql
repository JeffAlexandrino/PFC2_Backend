/*
  Warnings:

  - Made the column `vendaRenovacao` on table `vendas` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "vendas" ALTER COLUMN "vendaRenovacao" SET NOT NULL;
