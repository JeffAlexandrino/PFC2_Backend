/*
  Warnings:

  - You are about to drop the column `valorFaturamento` on the `metas` table. All the data in the column will be lost.
  - You are about to drop the column `valorVenda` on the `metas` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TipoMeta" AS ENUM ('VISITA', 'FATURAMENTO', 'VALOR_VENDA', 'MARGEM_BRUTA', 'MARKUP_BRUTO', 'MARKUP_LIQUIDO');

-- AlterTable
ALTER TABLE "metas" DROP COLUMN "valorFaturamento",
DROP COLUMN "valorVenda";

-- CreateTable
CREATE TABLE "valor_tipo_meta" (
    "id" TEXT NOT NULL,
    "tipoMeta" "TipoMeta" NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "metaId" TEXT NOT NULL,

    CONSTRAINT "valor_tipo_meta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetaVendaVendedor" (
    "vendedorId" TEXT NOT NULL,
    "vendaId" TEXT NOT NULL,
    "percentContribuicaoMeta" DOUBLE PRECISION NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "MetaVendaVendedor_vendedorId_vendaId_key" ON "MetaVendaVendedor"("vendedorId", "vendaId");

-- AddForeignKey
ALTER TABLE "valor_tipo_meta" ADD CONSTRAINT "valor_tipo_meta_metaId_fkey" FOREIGN KEY ("metaId") REFERENCES "metas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetaVendaVendedor" ADD CONSTRAINT "MetaVendaVendedor_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "vendas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetaVendaVendedor" ADD CONSTRAINT "MetaVendaVendedor_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "vendedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
