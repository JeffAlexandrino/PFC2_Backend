-- DropForeignKey
ALTER TABLE "gastos" DROP CONSTRAINT "gastos_visitaId_fkey";

-- DropForeignKey
ALTER TABLE "meta_alternativa" DROP CONSTRAINT "meta_alternativa_metaId_fkey";

-- AddForeignKey
ALTER TABLE "meta_alternativa" ADD CONSTRAINT "meta_alternativa_metaId_fkey" FOREIGN KEY ("metaId") REFERENCES "metas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gastos" ADD CONSTRAINT "gastos_visitaId_fkey" FOREIGN KEY ("visitaId") REFERENCES "visitas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
