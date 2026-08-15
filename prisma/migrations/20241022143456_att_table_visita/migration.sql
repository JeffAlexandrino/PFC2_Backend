/*
  Warnings:

  - You are about to drop the column `kmRodados` on the `visitas` table. All the data in the column will be lost.
  - Added the required column `kmFinal` to the `visitas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kmInicial` to the `visitas` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "visitas" DROP COLUMN "kmRodados",
ADD COLUMN     "kmFinal" INTEGER NOT NULL,
ADD COLUMN     "kmInicial" INTEGER NOT NULL;
