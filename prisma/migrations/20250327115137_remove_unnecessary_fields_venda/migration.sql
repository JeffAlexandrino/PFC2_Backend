/*
  Warnings:

  - You are about to drop the column `vendaId` on the `data_boleto` table. All the data in the column will be lost.
  - You are about to drop the column `vendaId` on the `venda_produto` table. All the data in the column will be lost.
  - You are about to drop the column `vendaId` on the `venda_servico` table. All the data in the column will be lost.
  - You are about to drop the column `codigoNota` on the `vendas` table. All the data in the column will be lost.
  - You are about to drop the column `dataFaturamento` on the `vendas` table. All the data in the column will be lost.
  - You are about to drop the column `formaPagamentoId` on the `vendas` table. All the data in the column will be lost.
  - You are about to drop the column `formaParcelamento` on the `vendas` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "data_boleto" DROP CONSTRAINT "data_boleto_vendaId_fkey";

-- DropForeignKey
ALTER TABLE "venda_produto" DROP CONSTRAINT "venda_produto_vendaId_fkey";

-- DropForeignKey
ALTER TABLE "venda_servico" DROP CONSTRAINT "venda_servico_vendaId_fkey";

-- DropForeignKey
ALTER TABLE "vendas" DROP CONSTRAINT "vendas_formaPagamentoId_fkey";

-- DropIndex
DROP INDEX "data_boleto_data_vendaId_key";

-- DropIndex
DROP INDEX "vendas_codigoNota_key";

-- AlterTable
ALTER TABLE "data_boleto" DROP COLUMN "vendaId";

-- AlterTable
ALTER TABLE "venda_produto" DROP COLUMN "vendaId";

-- AlterTable
ALTER TABLE "venda_servico" DROP COLUMN "vendaId";

-- AlterTable
ALTER TABLE "vendas" DROP COLUMN "codigoNota",
DROP COLUMN "dataFaturamento",
DROP COLUMN "formaPagamentoId",
DROP COLUMN "formaParcelamento";
