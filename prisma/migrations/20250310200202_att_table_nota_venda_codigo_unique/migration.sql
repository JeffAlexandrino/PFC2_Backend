/*
  Warnings:

  - A unique constraint covering the columns `[codigo]` on the table `nota_venda` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "nota_venda" ALTER COLUMN "codigo" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "nota_venda_codigo_key" ON "nota_venda"("codigo");
