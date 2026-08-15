-- DropForeignKey
ALTER TABLE "vendas" DROP CONSTRAINT "vendas_formaPagamentoId_fkey";

-- AlterTable
ALTER TABLE "vendas" ALTER COLUMN "dataFaturamento" DROP NOT NULL,
ALTER COLUMN "formaPagamentoId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_formaPagamentoId_fkey" FOREIGN KEY ("formaPagamentoId") REFERENCES "forma_pagamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;
