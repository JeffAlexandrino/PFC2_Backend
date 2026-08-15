-- DropForeignKey
ALTER TABLE "VendedorComissao" DROP CONSTRAINT "VendedorComissao_distribuicaoComissaoId_fkey";

-- AddForeignKey
ALTER TABLE "VendedorComissao" ADD CONSTRAINT "VendedorComissao_distribuicaoComissaoId_fkey" FOREIGN KEY ("distribuicaoComissaoId") REFERENCES "DistribuicaoComissao"("id") ON DELETE CASCADE ON UPDATE CASCADE;
