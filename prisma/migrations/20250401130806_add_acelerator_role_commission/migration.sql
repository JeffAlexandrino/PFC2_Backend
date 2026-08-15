-- AlterTable
ALTER TABLE "CommissionRole" ADD COLUMN     "acelerator" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "comissoes" ALTER COLUMN "aceleratorApproved" SET DEFAULT false,
ALTER COLUMN "commissionApproved" SET DEFAULT false;
