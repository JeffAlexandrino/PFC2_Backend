-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'COMERCIAL_MANAGER';
ALTER TYPE "Role" ADD VALUE 'COMERCIAL_ASSISTANT';
ALTER TYPE "Role" ADD VALUE 'SOLUTION_ARCHITECT';
ALTER TYPE "Role" ADD VALUE 'COMMISSIONING_ANALYST';

-- DropForeignKey
ALTER TABLE "VendedorComissao" DROP CONSTRAINT "VendedorComissao_distribuicaoComissaoId_fkey";

-- DropForeignKey
ALTER TABLE "VendedorComissao" DROP CONSTRAINT "VendedorComissao_vendedorRoleId_fkey";

-- AlterTable
ALTER TABLE "vendas" ADD COLUMN     "comercialAssistantId" TEXT,
ADD COLUMN     "solutionArchitectId" TEXT;

-- AlterTable
ALTER TABLE "VendedorComissao" RENAME TO "CommissionRole";

-- AlterTable
ALTER TABLE "CommissionRole" RENAME COLUMN "vendedorRoleId" TO "userRoleId";

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_comercialAssistantId_fkey" FOREIGN KEY ("comercialAssistantId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_solutionArchitectId_fkey" FOREIGN KEY ("solutionArchitectId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionRole" ADD CONSTRAINT "CommissionRole_userRoleId_fkey" FOREIGN KEY ("userRoleId") REFERENCES "user_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionRole" ADD CONSTRAINT "CommissionRole_distribuicaoComissaoId_fkey" FOREIGN KEY ("distribuicaoComissaoId") REFERENCES "DistribuicaoComissao"("id") ON DELETE CASCADE ON UPDATE CASCADE;
