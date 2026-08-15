-- DropForeignKey
ALTER TABLE "valor_tipo_meta_empresa" DROP CONSTRAINT "valor_tipo_meta_empresa_metaEmpresaId_fkey";

-- AddForeignKey
ALTER TABLE "valor_tipo_meta_empresa" ADD CONSTRAINT "valor_tipo_meta_empresa_metaEmpresaId_fkey" FOREIGN KEY ("metaEmpresaId") REFERENCES "metas_empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
