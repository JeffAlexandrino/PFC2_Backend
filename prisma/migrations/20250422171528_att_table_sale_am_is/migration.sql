-- AlterTable
ALTER TABLE "vendas" ADD COLUMN     "accountManagerId" TEXT,
ADD COLUMN     "insideSalesId" TEXT;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_accountManagerId_fkey" FOREIGN KEY ("accountManagerId") REFERENCES "user_roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_insideSalesId_fkey" FOREIGN KEY ("insideSalesId") REFERENCES "user_roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
