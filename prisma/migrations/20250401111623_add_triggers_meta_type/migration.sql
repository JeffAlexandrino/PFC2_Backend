-- AlterTable
ALTER TABLE "valor_tipo_meta" RENAME COLUMN "valor" TO "aceleratorTriggerValue";
ALTER TABLE "valor_tipo_meta" ADD COLUMN "commissionTriggerValue" DOUBLE PRECISION;
