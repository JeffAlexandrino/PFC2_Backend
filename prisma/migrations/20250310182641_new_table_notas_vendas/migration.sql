/*
  Warnings:

  - A unique constraint covering the columns `[data,notaVendaId]` on the table `data_boleto` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[notaVendaId,produtoId]` on the table `venda_produto` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[notaVendaId,servicoId]` on the table `venda_servico` will be added. If there are existing duplicate values, this will fail.
  - Made the column `createdAt` on table `comissoes` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `comissoes` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "comissoes" ADD COLUMN     "notaVendaId" TEXT,
ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "updatedAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "data_boleto" ADD COLUMN     "notaVendaId" TEXT;

-- AlterTable
ALTER TABLE "venda_produto" ADD COLUMN     "notaVendaId" TEXT;

-- AlterTable
ALTER TABLE "venda_servico" ADD COLUMN     "notaVendaId" TEXT;

-- CreateTable
CREATE TABLE "nota_venda" (
    "id" TEXT NOT NULL,
    "codigo" VARCHAR(256) NOT NULL,
    "formaParcelamento" INTEGER NOT NULL,
    "dataFaturamento" TIMESTAMP(3) NOT NULL,
    "vendaId" TEXT NOT NULL,
    "formaPagamentoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nota_venda_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "data_boleto_data_notaVendaId_key" ON "data_boleto"("data", "notaVendaId");

-- CreateIndex
CREATE UNIQUE INDEX "venda_produto_notaVendaId_produtoId_key" ON "venda_produto"("notaVendaId", "produtoId");

-- CreateIndex
CREATE UNIQUE INDEX "venda_servico_notaVendaId_servicoId_key" ON "venda_servico"("notaVendaId", "servicoId");

-- AddForeignKey
ALTER TABLE "venda_produto" ADD CONSTRAINT "venda_produto_notaVendaId_fkey" FOREIGN KEY ("notaVendaId") REFERENCES "nota_venda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venda_servico" ADD CONSTRAINT "venda_servico_notaVendaId_fkey" FOREIGN KEY ("notaVendaId") REFERENCES "nota_venda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comissoes" ADD CONSTRAINT "comissoes_notaVendaId_fkey" FOREIGN KEY ("notaVendaId") REFERENCES "nota_venda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_boleto" ADD CONSTRAINT "data_boleto_notaVendaId_fkey" FOREIGN KEY ("notaVendaId") REFERENCES "nota_venda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nota_venda" ADD CONSTRAINT "nota_venda_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "vendas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nota_venda" ADD CONSTRAINT "nota_venda_formaPagamentoId_fkey" FOREIGN KEY ("formaPagamentoId") REFERENCES "forma_pagamento"("id") ON DELETE CASCADE ON UPDATE CASCADE;
