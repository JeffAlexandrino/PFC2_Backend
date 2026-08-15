-- CreateEnum
CREATE TYPE "TravelType" AS ENUM ('ONIBUS', 'AVIAO', 'TREM');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TipoGasto" ADD VALUE 'ALMOCO';
ALTER TYPE "TipoGasto" ADD VALUE 'JANTA';
ALTER TYPE "TipoGasto" ADD VALUE 'VIAGEM';

-- AlterTable
ALTER TABLE "gastos" ADD COLUMN     "tipoViagem" "TravelType";
