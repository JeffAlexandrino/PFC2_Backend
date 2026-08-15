/*
  Warnings:

  - The values [VISITA] on the enum `Tabela` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `gastos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `visitas` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Tabela_new" AS ENUM ('USUARIO', 'VENDEDOR', 'CLIENTE', 'PRODUTO', 'FORNECEDOR', 'META', 'SERVICO', 'VENDA', 'COMISSAO', 'DISTRIBUICAO_COMISSAO');
ALTER TABLE "auditoria" ALTER COLUMN "tabela" TYPE "Tabela_new" USING ("tabela"::text::"Tabela_new");
ALTER TYPE "Tabela" RENAME TO "Tabela_old";
ALTER TYPE "Tabela_new" RENAME TO "Tabela";
DROP TYPE "Tabela_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "gastos" DROP CONSTRAINT "gastos_visitaId_fkey";

-- DropForeignKey
ALTER TABLE "visitas" DROP CONSTRAINT "visitas_vendedorId_fkey";

-- DropTable
DROP TABLE "gastos";

-- DropTable
DROP TABLE "visitas";

-- DropEnum
DROP TYPE "TipoGasto";
