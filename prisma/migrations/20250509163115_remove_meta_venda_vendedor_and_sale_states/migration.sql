/*
  Warnings:

  - The values [VERIFICADA,AGUARDANDO_VERIFICACAO,CRIADA] on the enum `EstadoVenda` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `aceleratorApproved` on the `comissoes` table. All the data in the column will be lost.
  - You are about to drop the column `commissionApproved` on the `comissoes` table. All the data in the column will be lost.
  - You are about to drop the `MetaVendaVendedor` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `porcentAcceleratorApproved` on table `comissoes` required. This step will fail if there are existing NULL values in that column.
  - Made the column `porcentCommissionApproved` on table `comissoes` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EstadoVenda_new" AS ENUM ('DRAFT', 'FINANCIAL_REVIEW', 'TEAM_ASSIGNMENT', 'CLOSED');
ALTER TABLE "vendas" ALTER COLUMN "estadoVenda" DROP DEFAULT;
ALTER TABLE "vendas" ALTER COLUMN "estadoVenda" TYPE "EstadoVenda_new" USING ("estadoVenda"::text::"EstadoVenda_new");
ALTER TYPE "EstadoVenda" RENAME TO "EstadoVenda_old";
ALTER TYPE "EstadoVenda_new" RENAME TO "EstadoVenda";
DROP TYPE "EstadoVenda_old";
ALTER TABLE "vendas" ALTER COLUMN "estadoVenda" SET DEFAULT 'DRAFT';
COMMIT;

-- DropForeignKey
ALTER TABLE "MetaVendaVendedor" DROP CONSTRAINT "MetaVendaVendedor_vendaId_fkey";

-- DropForeignKey
ALTER TABLE "MetaVendaVendedor" DROP CONSTRAINT "MetaVendaVendedor_vendedorRoleId_fkey";

-- AlterTable
ALTER TABLE "comissoes" DROP COLUMN "aceleratorApproved",
DROP COLUMN "commissionApproved",
ALTER COLUMN "porcentAcceleratorApproved" SET NOT NULL,
ALTER COLUMN "porcentCommissionApproved" SET NOT NULL;

-- AlterTable
ALTER TABLE "vendas" ALTER COLUMN "estadoVenda" SET DEFAULT 'DRAFT';

-- DropTable
DROP TABLE "MetaVendaVendedor";
