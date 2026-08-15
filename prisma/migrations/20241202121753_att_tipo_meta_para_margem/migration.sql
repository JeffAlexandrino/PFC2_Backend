/*
  Warnings:

  - The values [MARGEM_BRUTA] on the enum `TipoMeta` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TipoMeta_new" AS ENUM ('VISITA', 'FATURAMENTO', 'VALOR_VENDA', 'MARGEM', 'MARKUP_BRUTO', 'MARKUP_LIQUIDO');
ALTER TABLE "valor_tipo_meta" ALTER COLUMN "tipoMeta" TYPE "TipoMeta_new" USING ("tipoMeta"::text::"TipoMeta_new");
ALTER TYPE "TipoMeta" RENAME TO "TipoMeta_old";
ALTER TYPE "TipoMeta_new" RENAME TO "TipoMeta";
DROP TYPE "TipoMeta_old";
COMMIT;
