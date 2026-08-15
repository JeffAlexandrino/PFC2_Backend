/*
  Warnings:

  - A unique constraint covering the columns `[vendedorRoleId,vendaId]` on the table `MetaVendaVendedor` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "MetaVendaVendedor_vendedorRoleId_vendaId_key" ON "MetaVendaVendedor"("vendedorRoleId", "vendaId");
