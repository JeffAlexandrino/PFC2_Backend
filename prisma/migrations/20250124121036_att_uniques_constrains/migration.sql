/*
  Warnings:

  - A unique constraint covering the columns `[name,empresaId]` on the table `categorias` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email,empresaId]` on the table `clientes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cnpj,empresaId]` on the table `clientes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cnpj,empresaId]` on the table `fornecedores` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email,empresaId]` on the table `fornecedores` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[partNumber,empresaId]` on the table `produtos` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,empresaId]` on the table `segmentos` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "categorias_name_key";

-- DropIndex
DROP INDEX "clientes_cnpj_key";

-- DropIndex
DROP INDEX "clientes_email_key";

-- DropIndex
DROP INDEX "fornecedores_cnpj_key";

-- DropIndex
DROP INDEX "fornecedores_email_key";

-- DropIndex
DROP INDEX "produtos_partNumber_key";

-- DropIndex
DROP INDEX "segmentos_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "categorias_name_empresaId_key" ON "categorias"("name", "empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_email_empresaId_key" ON "clientes"("email", "empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_cnpj_empresaId_key" ON "clientes"("cnpj", "empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "fornecedores_cnpj_empresaId_key" ON "fornecedores"("cnpj", "empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "fornecedores_email_empresaId_key" ON "fornecedores"("email", "empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "produtos_partNumber_empresaId_key" ON "produtos"("partNumber", "empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "segmentos_name_empresaId_key" ON "segmentos"("name", "empresaId");
