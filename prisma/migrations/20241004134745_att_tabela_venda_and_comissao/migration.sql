-- AlterTable
ALTER TABLE "comissoes" ADD COLUMN     "dataBoleto" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "vendas" ADD COLUMN     "formaPagamentoId" TEXT,
ADD COLUMN     "numOportunidadeCRM" TEXT,
ADD COLUMN     "numPedidoDistribuidor" TEXT;

-- CreateTable
CREATE TABLE "_VendedorToVenda" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_VendedorToVenda_AB_unique" ON "_VendedorToVenda"("A", "B");

-- CreateIndex
CREATE INDEX "_VendedorToVenda_B_index" ON "_VendedorToVenda"("B");

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_formaPagamentoId_fkey" FOREIGN KEY ("formaPagamentoId") REFERENCES "forma_pagamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VendedorToVenda" ADD CONSTRAINT "_VendedorToVenda_A_fkey" FOREIGN KEY ("A") REFERENCES "vendas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VendedorToVenda" ADD CONSTRAINT "_VendedorToVenda_B_fkey" FOREIGN KEY ("B") REFERENCES "vendedores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
