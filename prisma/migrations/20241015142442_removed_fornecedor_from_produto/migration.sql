/*
  Warnings:

  - The primary key for the `venda_produto` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `_FornecedorToProduto` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[vendaId,produtoId]` on the table `venda_produto` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `venda_produto` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `id` was added to the `venda_servico` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "_FornecedorToProduto" DROP CONSTRAINT "_FornecedorToProduto_A_fkey";

-- DropForeignKey
ALTER TABLE "_FornecedorToProduto" DROP CONSTRAINT "_FornecedorToProduto_B_fkey";

-- AlterTable
ALTER TABLE "venda_produto" DROP CONSTRAINT "venda_produto_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "venda_produto_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "venda_servico" ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "venda_servico_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "_FornecedorToProduto";

-- CreateTable
CREATE TABLE "_FornecedorToVendaProduto" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_FornecedorToVendaProduto_AB_unique" ON "_FornecedorToVendaProduto"("A", "B");

-- CreateIndex
CREATE INDEX "_FornecedorToVendaProduto_B_index" ON "_FornecedorToVendaProduto"("B");

-- CreateIndex
CREATE UNIQUE INDEX "venda_produto_vendaId_produtoId_key" ON "venda_produto"("vendaId", "produtoId");

-- AddForeignKey
ALTER TABLE "_FornecedorToVendaProduto" ADD CONSTRAINT "_FornecedorToVendaProduto_A_fkey" FOREIGN KEY ("A") REFERENCES "fornecedores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FornecedorToVendaProduto" ADD CONSTRAINT "_FornecedorToVendaProduto_B_fkey" FOREIGN KEY ("B") REFERENCES "venda_produto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
