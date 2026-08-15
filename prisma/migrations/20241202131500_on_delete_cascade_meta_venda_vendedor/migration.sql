-- DropForeignKey
ALTER TABLE "MetaVendaVendedor" DROP CONSTRAINT "MetaVendaVendedor_vendaId_fkey";

-- AddForeignKey
ALTER TABLE "MetaVendaVendedor" ADD CONSTRAINT "MetaVendaVendedor_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "vendas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
