/*
  Warnings:

  - You are about to drop the column `vendedorId` on the `MetaVendaVendedor` table. All the data in the column will be lost.
  - You are about to drop the column `vendedorId` on the `VendedorComissao` table. All the data in the column will be lost.
  - You are about to drop the column `vendedorId` on the `comissoes` table. All the data in the column will be lost.
  - You are about to drop the column `vendedorId` on the `metas` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `vendedorId` on the `visitas` table. All the data in the column will be lost.
  - You are about to drop the `_VendaToVendedor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `vendedores` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `empresaId` on table `Contrato` required. This step will fail if there are existing NULL values in that column.
  - Made the column `empresaId` on table `DistribuicaoComissao` required. This step will fail if there are existing NULL values in that column.
  - Made the column `vendedorRoleId` on table `MetaVendaVendedor` required. This step will fail if there are existing NULL values in that column.
  - Made the column `vendedorRoleId` on table `VendedorComissao` required. This step will fail if there are existing NULL values in that column.
  - Made the column `empresaId` on table `auditoria` required. This step will fail if there are existing NULL values in that column.
  - Made the column `empresaId` on table `categorias` required. This step will fail if there are existing NULL values in that column.
  - Made the column `empresaId` on table `clientes` required. This step will fail if there are existing NULL values in that column.
  - Made the column `vendedorRoleId` on table `comissoes` required. This step will fail if there are existing NULL values in that column.
  - Made the column `empresaId` on table `fabricantes` required. This step will fail if there are existing NULL values in that column.
  - Made the column `empresaId` on table `forma_pagamento` required. This step will fail if there are existing NULL values in that column.
  - Made the column `empresaId` on table `fornecedores` required. This step will fail if there are existing NULL values in that column.
  - Made the column `vendedorRoleId` on table `metas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `empresaId` on table `produtos` required. This step will fail if there are existing NULL values in that column.
  - Made the column `empresaId` on table `segmentos` required. This step will fail if there are existing NULL values in that column.
  - Made the column `empresaId` on table `servicos` required. This step will fail if there are existing NULL values in that column.
  - Made the column `empresaId` on table `tipo_produto_servico` required. This step will fail if there are existing NULL values in that column.
  - Made the column `empresaId` on table `vendas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `empresaId` on table `visitas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `vendedorRoleId` on table `visitas` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Contrato" DROP CONSTRAINT "Contrato_empresaId_fkey";

-- DropForeignKey
ALTER TABLE "DistribuicaoComissao" DROP CONSTRAINT "DistribuicaoComissao_empresaId_fkey";

-- DropForeignKey
ALTER TABLE "MetaVendaVendedor" DROP CONSTRAINT "MetaVendaVendedor_vendedorId_fkey";

-- DropForeignKey
ALTER TABLE "MetaVendaVendedor" DROP CONSTRAINT "MetaVendaVendedor_vendedorRoleId_fkey";

-- DropForeignKey
ALTER TABLE "VendedorComissao" DROP CONSTRAINT "VendedorComissao_vendedorId_fkey";

-- DropForeignKey
ALTER TABLE "VendedorComissao" DROP CONSTRAINT "VendedorComissao_vendedorRoleId_fkey";

-- DropForeignKey
ALTER TABLE "_VendaToVendedor" DROP CONSTRAINT "_VendaToVendedor_A_fkey";

-- DropForeignKey
ALTER TABLE "_VendaToVendedor" DROP CONSTRAINT "_VendaToVendedor_B_fkey";

-- DropForeignKey
ALTER TABLE "auditoria" DROP CONSTRAINT "auditoria_empresaId_fkey";

-- DropForeignKey
ALTER TABLE "categorias" DROP CONSTRAINT "categorias_empresaId_fkey";

-- DropForeignKey
ALTER TABLE "clientes" DROP CONSTRAINT "clientes_empresaId_fkey";

-- DropForeignKey
ALTER TABLE "comissoes" DROP CONSTRAINT "comissoes_vendedorId_fkey";

-- DropForeignKey
ALTER TABLE "comissoes" DROP CONSTRAINT "comissoes_vendedorRoleId_fkey";

-- DropForeignKey
ALTER TABLE "fabricantes" DROP CONSTRAINT "fabricantes_empresaId_fkey";

-- DropForeignKey
ALTER TABLE "forma_pagamento" DROP CONSTRAINT "forma_pagamento_empresaId_fkey";

-- DropForeignKey
ALTER TABLE "fornecedores" DROP CONSTRAINT "fornecedores_empresaId_fkey";

-- DropForeignKey
ALTER TABLE "metas" DROP CONSTRAINT "metas_vendedorId_fkey";

-- DropForeignKey
ALTER TABLE "metas" DROP CONSTRAINT "metas_vendedorRoleId_fkey";

-- DropForeignKey
ALTER TABLE "produtos" DROP CONSTRAINT "produtos_empresaId_fkey";

-- DropForeignKey
ALTER TABLE "segmentos" DROP CONSTRAINT "segmentos_empresaId_fkey";

-- DropForeignKey
ALTER TABLE "servicos" DROP CONSTRAINT "servicos_empresaId_fkey";

-- DropForeignKey
ALTER TABLE "tipo_produto_servico" DROP CONSTRAINT "tipo_produto_servico_empresaId_fkey";

-- DropForeignKey
ALTER TABLE "vendas" DROP CONSTRAINT "vendas_empresaId_fkey";

-- DropForeignKey
ALTER TABLE "vendedores" DROP CONSTRAINT "vendedores_empresaId_fkey";

-- DropForeignKey
ALTER TABLE "vendedores" DROP CONSTRAINT "vendedores_userId_fkey";

-- DropForeignKey
ALTER TABLE "visitas" DROP CONSTRAINT "visitas_empresaId_fkey";

-- DropForeignKey
ALTER TABLE "visitas" DROP CONSTRAINT "visitas_vendedorId_fkey";

-- DropForeignKey
ALTER TABLE "visitas" DROP CONSTRAINT "visitas_vendedorRoleId_fkey";

-- DropIndex
DROP INDEX "MetaVendaVendedor_vendedorId_vendaId_key";

-- AlterTable
ALTER TABLE "Contrato" ALTER COLUMN "empresaId" SET NOT NULL;

-- AlterTable
ALTER TABLE "DistribuicaoComissao" ALTER COLUMN "empresaId" SET NOT NULL;

-- AlterTable
ALTER TABLE "MetaVendaVendedor" DROP COLUMN "vendedorId",
ALTER COLUMN "vendedorRoleId" SET NOT NULL;

-- AlterTable
ALTER TABLE "VendedorComissao" DROP COLUMN "vendedorId",
ALTER COLUMN "vendedorRoleId" SET NOT NULL;

-- AlterTable
ALTER TABLE "auditoria" ALTER COLUMN "empresaId" SET NOT NULL;

-- AlterTable
ALTER TABLE "categorias" ALTER COLUMN "empresaId" SET NOT NULL;

-- AlterTable
ALTER TABLE "clientes" ALTER COLUMN "empresaId" SET NOT NULL;

-- AlterTable
ALTER TABLE "comissoes" DROP COLUMN "vendedorId",
ALTER COLUMN "vendedorRoleId" SET NOT NULL;

-- AlterTable
ALTER TABLE "fabricantes" ALTER COLUMN "empresaId" SET NOT NULL;

-- AlterTable
ALTER TABLE "forma_pagamento" ALTER COLUMN "empresaId" SET NOT NULL;

-- AlterTable
ALTER TABLE "fornecedores" ALTER COLUMN "empresaId" SET NOT NULL;

-- AlterTable
ALTER TABLE "metas" DROP COLUMN "vendedorId",
ALTER COLUMN "vendedorRoleId" SET NOT NULL;

-- AlterTable
ALTER TABLE "produtos" ALTER COLUMN "empresaId" SET NOT NULL;

-- AlterTable
ALTER TABLE "segmentos" ALTER COLUMN "empresaId" SET NOT NULL;

-- AlterTable
ALTER TABLE "servicos" ALTER COLUMN "empresaId" SET NOT NULL;

-- AlterTable
ALTER TABLE "tipo_produto_servico" ALTER COLUMN "empresaId" SET NOT NULL;

-- AlterTable
ALTER TABLE "usuarios" DROP COLUMN "role";

-- AlterTable
ALTER TABLE "vendas" ALTER COLUMN "empresaId" SET NOT NULL;

-- AlterTable
ALTER TABLE "visitas" DROP COLUMN "vendedorId",
ALTER COLUMN "empresaId" SET NOT NULL,
ALTER COLUMN "vendedorRoleId" SET NOT NULL;

-- DropTable
DROP TABLE "_VendaToVendedor";

-- DropTable
DROP TABLE "vendedores";

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "segmentos" ADD CONSTRAINT "segmentos_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tipo_produto_servico" ADD CONSTRAINT "tipo_produto_servico_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fornecedores" ADD CONSTRAINT "fornecedores_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fabricantes" ADD CONSTRAINT "fabricantes_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categorias" ADD CONSTRAINT "categorias_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "servicos" ADD CONSTRAINT "servicos_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metas" ADD CONSTRAINT "metas_vendedorRoleId_fkey" FOREIGN KEY ("vendedorRoleId") REFERENCES "user_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetaVendaVendedor" ADD CONSTRAINT "MetaVendaVendedor_vendedorRoleId_fkey" FOREIGN KEY ("vendedorRoleId") REFERENCES "user_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria" ADD CONSTRAINT "auditoria_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comissoes" ADD CONSTRAINT "comissoes_vendedorRoleId_fkey" FOREIGN KEY ("vendedorRoleId") REFERENCES "user_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forma_pagamento" ADD CONSTRAINT "forma_pagamento_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DistribuicaoComissao" ADD CONSTRAINT "DistribuicaoComissao_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendedorComissao" ADD CONSTRAINT "VendedorComissao_vendedorRoleId_fkey" FOREIGN KEY ("vendedorRoleId") REFERENCES "user_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitas" ADD CONSTRAINT "visitas_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitas" ADD CONSTRAINT "visitas_vendedorRoleId_fkey" FOREIGN KEY ("vendedorRoleId") REFERENCES "user_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contrato" ADD CONSTRAINT "Contrato_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
