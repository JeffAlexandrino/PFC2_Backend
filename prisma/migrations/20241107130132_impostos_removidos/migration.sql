/*
  Warnings:

  - You are about to drop the column `impostoICMS` on the `venda_produto` table. All the data in the column will be lost.
  - You are about to drop the column `impostoIPI` on the `venda_produto` table. All the data in the column will be lost.
  - You are about to drop the column `impostoISS` on the `venda_produto` table. All the data in the column will be lost.
  - You are about to drop the column `impostoPISCON` on the `venda_produto` table. All the data in the column will be lost.
  - You are about to drop the column `impostoICMS` on the `venda_servico` table. All the data in the column will be lost.
  - You are about to drop the column `impostoIPI` on the `venda_servico` table. All the data in the column will be lost.
  - You are about to drop the column `impostoISS` on the `venda_servico` table. All the data in the column will be lost.
  - You are about to drop the column `impostoPISCON` on the `venda_servico` table. All the data in the column will be lost.
  - Made the column `dedutiveisDistribuidor` on table `venda_produto` required. This step will fail if there are existing NULL values in that column.
  - Made the column `dedutiveisDistribuidor` on table `venda_servico` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "venda_produto" DROP COLUMN "impostoICMS",
DROP COLUMN "impostoIPI",
DROP COLUMN "impostoISS",
DROP COLUMN "impostoPISCON",
ALTER COLUMN "dedutiveisDistribuidor" SET NOT NULL;

-- AlterTable
ALTER TABLE "venda_servico" DROP COLUMN "impostoICMS",
DROP COLUMN "impostoIPI",
DROP COLUMN "impostoISS",
DROP COLUMN "impostoPISCON",
ALTER COLUMN "dedutiveisDistribuidor" SET NOT NULL;
