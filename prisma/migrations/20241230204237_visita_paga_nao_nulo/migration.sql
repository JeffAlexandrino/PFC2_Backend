/*
  Warnings:

  - Made the column `visitaPaga` on table `visitas` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "visitas" ALTER COLUMN "visitaPaga" SET NOT NULL;
