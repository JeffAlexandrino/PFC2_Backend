-- AddForeignKey
ALTER TABLE "VendedorComissao" ADD CONSTRAINT "VendedorComissao_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "vendedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
