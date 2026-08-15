/*
  Warnings:

  - The values [DRAFT,FINANCIAL_REVIEW,TEAM_ASSIGNMENT,CLOSED] on the enum `EstadoVenda` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."EstadoVenda_new" AS ENUM ('INITIAL', 'BILLING_AUDIT', 'FINANCIAL_AUDIT', 'AVAIBLE_PAYMENT', 'PAID');
ALTER TABLE "public"."vendas" ALTER COLUMN "estadoVenda" DROP DEFAULT;
ALTER TABLE "public"."vendas" ALTER COLUMN "estadoVenda" TYPE "public"."EstadoVenda_new" USING ("estadoVenda"::text::"public"."EstadoVenda_new");
ALTER TYPE "public"."EstadoVenda" RENAME TO "EstadoVenda_old";
ALTER TYPE "public"."EstadoVenda_new" RENAME TO "EstadoVenda";
DROP TYPE "public"."EstadoVenda_old";
ALTER TABLE "public"."vendas" ALTER COLUMN "estadoVenda" SET DEFAULT 'INITIAL';
COMMIT;

-- AlterTable
ALTER TABLE "public"."vendas" ALTER COLUMN "estadoVenda" SET DEFAULT 'INITIAL';
