/*
  Warnings:

  - You are about to drop the column `numOportunidadeCRM` on the `nota_venda` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "nota_venda" DROP COLUMN "numOportunidadeCRM";

-- AlterTable
ALTER TABLE "venda_produto" ALTER COLUMN "tipoMoeda" DROP NOT NULL;

-- AlterTable
ALTER TABLE "venda_servico" ALTER COLUMN "tipoMoeda" DROP NOT NULL;
