-- DropForeignKey
ALTER TABLE "vendas" DROP CONSTRAINT "vendas_accountManagerId_fkey";

-- AlterTable
ALTER TABLE "vendas" ALTER COLUMN "accountManagerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_accountManagerId_fkey" FOREIGN KEY ("accountManagerId") REFERENCES "user_roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
