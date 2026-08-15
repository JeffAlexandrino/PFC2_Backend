-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Tabela" ADD VALUE 'META_EMPRESA';
ALTER TYPE "Tabela" ADD VALUE 'AUDITORIA';

-- CreateTable
CREATE TABLE "metas_empresa" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "dataInicioMeta" TIMESTAMP(3) NOT NULL,
    "dataFimMeta" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "metas_empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "valor_tipo_meta_empresa" (
    "id" TEXT NOT NULL,
    "metaEmpresaId" TEXT NOT NULL,
    "valorMeta" DOUBLE PRECISION NOT NULL,
    "valorAtual" DOUBLE PRECISION,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipoMeta" "TipoMeta" NOT NULL,

    CONSTRAINT "valor_tipo_meta_empresa_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "metas_empresa" ADD CONSTRAINT "metas_empresa_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "valor_tipo_meta_empresa" ADD CONSTRAINT "valor_tipo_meta_empresa_metaEmpresaId_fkey" FOREIGN KEY ("metaEmpresaId") REFERENCES "metas_empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
