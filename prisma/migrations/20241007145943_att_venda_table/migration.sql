/*
  Warnings:

  - You are about to drop the column `dataBoleto` on the `comissoes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "comissoes" DROP COLUMN "dataBoleto";

-- AlterTable
ALTER TABLE "vendas" ADD COLUMN     "comissaoPrimeiraParcela" BOOLEAN;

-- CreateTable
CREATE TABLE "data_boleto" (
    "id" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "vendaId" TEXT NOT NULL,

    CONSTRAINT "data_boleto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "data_boleto_data_vendaId_key" ON "data_boleto"("data", "vendaId");

-- AddForeignKey
ALTER TABLE "data_boleto" ADD CONSTRAINT "data_boleto_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "vendas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
