/*
  Warnings:

  - Made the column `acelerator` on table `CommissionRole` required. This step will fail if there are existing NULL values in that column.
  - Made the column `notaVendaId` on table `comissoes` required. This step will fail if there are existing NULL values in that column.
  - Made the column `aceleratorApproved` on table `comissoes` required. This step will fail if there are existing NULL values in that column.
  - Made the column `commissionApproved` on table `comissoes` required. This step will fail if there are existing NULL values in that column.
  - Made the column `notaVendaId` on table `data_boleto` required. This step will fail if there are existing NULL values in that column.
  - Made the column `commissionTriggerValue` on table `valor_tipo_meta` required. This step will fail if there are existing NULL values in that column.
  - Made the column `notaVendaId` on table `venda_produto` required. This step will fail if there are existing NULL values in that column.
  - Made the column `notaVendaId` on table `venda_servico` required. This step will fail if there are existing NULL values in that column.
  - Made the column `carroEmpresa` on table `visitas` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "CommissionRole" ALTER COLUMN "acelerator" SET NOT NULL;

-- AlterTable
ALTER TABLE "comissoes" ALTER COLUMN "notaVendaId" SET NOT NULL,
ALTER COLUMN "aceleratorApproved" SET NOT NULL,
ALTER COLUMN "commissionApproved" SET NOT NULL;

-- AlterTable
ALTER TABLE "data_boleto" ALTER COLUMN "notaVendaId" SET NOT NULL;

-- AlterTable
ALTER TABLE "valor_tipo_meta" ALTER COLUMN "commissionTriggerValue" SET NOT NULL;

-- AlterTable
ALTER TABLE "venda_produto" ALTER COLUMN "notaVendaId" SET NOT NULL;

-- AlterTable
ALTER TABLE "venda_servico" ALTER COLUMN "notaVendaId" SET NOT NULL;

-- AlterTable
ALTER TABLE "visitas" ALTER COLUMN "carroEmpresa" SET NOT NULL;
