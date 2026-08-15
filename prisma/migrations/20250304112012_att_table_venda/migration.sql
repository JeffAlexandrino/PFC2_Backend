/*
  Warnings:

  - A unique constraint covering the columns `[codigoNota]` on the table `vendas` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "vendas_codigoNota_key" ON "vendas"("codigoNota");
