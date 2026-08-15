-- DropForeignKey
ALTER TABLE "_UserRoleToVenda" DROP CONSTRAINT "_UserRoleToVenda_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserRoleToVenda" DROP CONSTRAINT "_UserRoleToVenda_B_fkey";

-- DropForeignKey
ALTER TABLE "vendas" DROP CONSTRAINT "vendas_comercialAssistantId_fkey";

-- DropForeignKey
ALTER TABLE "vendas" DROP CONSTRAINT "vendas_solutionArchitectId_fkey";

-- DropTable
ALTER TABLE "_UserRoleToVenda" RENAME TO "_SalePersonSales";

-- CreateIndex
CREATE INDEX "_SalePersonSales_B_index" ON "_SalePersonSales"("B");

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_comercialAssistantId_fkey" FOREIGN KEY ("comercialAssistantId") REFERENCES "user_roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_solutionArchitectId_fkey" FOREIGN KEY ("solutionArchitectId") REFERENCES "user_roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SalePersonSales" ADD CONSTRAINT "_SalePersonSales_A_fkey" FOREIGN KEY ("A") REFERENCES "user_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SalePersonSales" ADD CONSTRAINT "_SalePersonSales_B_fkey" FOREIGN KEY ("B") REFERENCES "vendas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
