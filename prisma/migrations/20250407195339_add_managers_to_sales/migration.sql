-- AlterTable
ALTER TABLE "vendas" ADD COLUMN     "comercialManagerId" TEXT;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_comercialManagerId_fkey" FOREIGN KEY ("comercialManagerId") REFERENCES "user_roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
