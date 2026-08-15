-- DropForeignKey
ALTER TABLE "nota_venda" DROP CONSTRAINT "nota_venda_formaPagamentoId_fkey";

-- AddForeignKey
ALTER TABLE "nota_venda" ADD CONSTRAINT "nota_venda_formaPagamentoId_fkey" FOREIGN KEY ("formaPagamentoId") REFERENCES "forma_pagamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
