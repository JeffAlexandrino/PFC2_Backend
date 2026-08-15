-- AlterTable
ALTER TABLE "clientes" ADD COLUMN     "responsavelId" VARCHAR(256);

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
