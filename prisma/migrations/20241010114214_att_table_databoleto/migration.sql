-- DropForeignKey
ALTER TABLE "data_boleto" DROP CONSTRAINT "data_boleto_vendaId_fkey";

-- AddForeignKey
ALTER TABLE "data_boleto" ADD CONSTRAINT "data_boleto_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "vendas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
