-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'REFERRER';

-- AlterTable
ALTER TABLE "vendas" ADD COLUMN     "referrerId" TEXT;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "user_roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
