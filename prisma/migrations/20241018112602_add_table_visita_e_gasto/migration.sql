-- CreateEnum
CREATE TYPE "TipoGasto" AS ENUM ('ALIMENTACAO', 'HOSPEDAGEM');

-- AlterEnum
ALTER TYPE "Tabela" ADD VALUE 'VISITA';

-- CreateTable
CREATE TABLE "visitas" (
    "id" TEXT NOT NULL,
    "dataVisita" TIMESTAMP(3) NOT NULL,
    "carroEmpresa" BOOLEAN NOT NULL,
    "kmRodados" INTEGER NOT NULL,
    "vendedorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visitas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gastos" (
    "id" TEXT NOT NULL,
    "nota" TEXT NOT NULL,
    "tipoGasto" "TipoGasto" NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "visitaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gastos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "visitas" ADD CONSTRAINT "visitas_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "vendedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gastos" ADD CONSTRAINT "gastos_visitaId_fkey" FOREIGN KEY ("visitaId") REFERENCES "visitas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
