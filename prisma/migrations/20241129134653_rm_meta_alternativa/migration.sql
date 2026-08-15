/*
  Warnings:

  - You are about to drop the `meta_alternativa` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "meta_alternativa" DROP CONSTRAINT "meta_alternativa_metaId_fkey";

-- DropTable
DROP TABLE "meta_alternativa";

-- DropEnum
DROP TYPE "TipoMetaAlternantiva";
