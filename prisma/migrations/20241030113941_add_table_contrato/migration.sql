-- AlterTable
ALTER TABLE "vendas" ADD COLUMN     "contratoId" TEXT;

-- CreateTable
CREATE TABLE "Contrato" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(256) NOT NULL,
    "comissaoPrimeiraParcela" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contrato_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "Contrato"("id") ON DELETE SET NULL ON UPDATE CASCADE;
