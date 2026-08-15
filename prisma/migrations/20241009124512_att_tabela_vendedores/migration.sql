/*
  Warnings:

  - You are about to drop the column `acelerador` on the `vendedores` table. All the data in the column will be lost.
  - You are about to drop the column `comissao` on the `vendedores` table. All the data in the column will be lost.
  - Made the column `formaPagamentoId` on table `vendas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `numOportunidadeCRM` on table `vendas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `numPedidoDistribuidor` on table `vendas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `comissaoPrimeiraParcela` on table `vendas` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "vendas" DROP CONSTRAINT "vendas_formaPagamentoId_fkey";

-- AlterTable
ALTER TABLE "vendas" ALTER COLUMN "formaPagamentoId" SET NOT NULL,
ALTER COLUMN "numOportunidadeCRM" SET NOT NULL,
ALTER COLUMN "numPedidoDistribuidor" SET NOT NULL,
ALTER COLUMN "comissaoPrimeiraParcela" SET NOT NULL;

-- AlterTable
ALTER TABLE "vendedores" DROP COLUMN "acelerador",
DROP COLUMN "comissao";

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_formaPagamentoId_fkey" FOREIGN KEY ("formaPagamentoId") REFERENCES "forma_pagamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
