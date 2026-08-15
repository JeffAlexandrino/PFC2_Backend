-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Tabela" ADD VALUE 'ADMIN';
ALTER TYPE "Tabela" ADD VALUE 'GERENTE';

-- AlterTable
ALTER TABLE "Contrato" ADD COLUMN     "empresaId" TEXT;

-- AlterTable
ALTER TABLE "DistribuicaoComissao" ADD COLUMN     "empresaId" TEXT;

-- AlterTable
ALTER TABLE "MetaVendaVendedor" ADD COLUMN     "userRoleId" TEXT;

-- AlterTable
ALTER TABLE "VendedorComissao" ADD COLUMN     "userRoleId" TEXT;

-- AlterTable
ALTER TABLE "auditoria" ADD COLUMN     "empresaId" TEXT;

-- AlterTable
ALTER TABLE "categorias" ADD COLUMN     "empresaId" TEXT;

-- AlterTable
ALTER TABLE "clientes" ADD COLUMN     "empresaId" TEXT;

-- AlterTable
ALTER TABLE "comissoes" ADD COLUMN     "userRoleId" TEXT;

-- AlterTable
ALTER TABLE "fabricantes" ADD COLUMN     "empresaId" TEXT;

-- AlterTable
ALTER TABLE "forma_pagamento" ADD COLUMN     "empresaId" TEXT;

-- AlterTable
ALTER TABLE "fornecedores" ADD COLUMN     "empresaId" TEXT;

-- AlterTable
ALTER TABLE "metas" ADD COLUMN     "userRoleId" TEXT;

-- AlterTable
ALTER TABLE "produtos" ADD COLUMN     "empresaId" TEXT;

-- AlterTable
ALTER TABLE "segmentos" ADD COLUMN     "empresaId" TEXT;

-- AlterTable
ALTER TABLE "servicos" ADD COLUMN     "empresaId" TEXT;

-- AlterTable
ALTER TABLE "tipo_produto_servico" ADD COLUMN     "empresaId" TEXT;

-- AlterTable
ALTER TABLE "tokens" ADD COLUMN     "currentEmpresaId" TEXT,
ADD COLUMN     "currentRole" "Role",
ADD COLUMN     "empresaRoleId" TEXT;

-- AlterTable
ALTER TABLE "vendas" ADD COLUMN     "empresaId" TEXT,
ADD COLUMN     "userRoleId" TEXT;

-- AlterTable
ALTER TABLE "vendedores" ADD COLUMN     "empresaId" TEXT;

-- AlterTable
ALTER TABLE "visitas" ADD COLUMN     "empresaId" TEXT,
ADD COLUMN     "userRoleId" TEXT;

-- CreateTable
CREATE TABLE "empresas" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(256) NOT NULL,
    "cnpj" VARCHAR(14) NOT NULL,
    "logo" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "empresas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "bloqueado" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "empresas_cnpj_key" ON "empresas"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_userId_key" ON "user_roles"("userId");

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendedores" ADD CONSTRAINT "vendedores_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "segmentos" ADD CONSTRAINT "segmentos_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tipo_produto_servico" ADD CONSTRAINT "tipo_produto_servico_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fornecedores" ADD CONSTRAINT "fornecedores_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fabricantes" ADD CONSTRAINT "fabricantes_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categorias" ADD CONSTRAINT "categorias_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "servicos" ADD CONSTRAINT "servicos_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metas" ADD CONSTRAINT "metas_userRoleId_fkey" FOREIGN KEY ("userRoleId") REFERENCES "user_roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetaVendaVendedor" ADD CONSTRAINT "MetaVendaVendedor_userRoleId_fkey" FOREIGN KEY ("userRoleId") REFERENCES "user_roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_userRoleId_fkey" FOREIGN KEY ("userRoleId") REFERENCES "user_roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria" ADD CONSTRAINT "auditoria_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comissoes" ADD CONSTRAINT "comissoes_userRoleId_fkey" FOREIGN KEY ("userRoleId") REFERENCES "user_roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forma_pagamento" ADD CONSTRAINT "forma_pagamento_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DistribuicaoComissao" ADD CONSTRAINT "DistribuicaoComissao_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendedorComissao" ADD CONSTRAINT "VendedorComissao_userRoleId_fkey" FOREIGN KEY ("userRoleId") REFERENCES "user_roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitas" ADD CONSTRAINT "visitas_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitas" ADD CONSTRAINT "visitas_userRoleId_fkey" FOREIGN KEY ("userRoleId") REFERENCES "user_roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contrato" ADD CONSTRAINT "Contrato_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
