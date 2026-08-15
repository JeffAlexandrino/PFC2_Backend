-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Tabela" ADD VALUE 'CATEGORIA';
ALTER TYPE "Tabela" ADD VALUE 'CONTRATO';
ALTER TYPE "Tabela" ADD VALUE 'FABRICANTE';
ALTER TYPE "Tabela" ADD VALUE 'ORGANIZACAO';
ALTER TYPE "Tabela" ADD VALUE 'METODO_PAGAMENTO';
ALTER TYPE "Tabela" ADD VALUE 'TIPO_PROD_SERV';
ALTER TYPE "Tabela" ADD VALUE 'SEGMENTO';
