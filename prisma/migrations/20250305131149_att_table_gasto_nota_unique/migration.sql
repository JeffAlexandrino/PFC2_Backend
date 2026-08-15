/*
  Warnings:

  - A unique constraint covering the columns `[nota]` on the table `gastos` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "gastos_nota_key" ON "gastos"("nota");
