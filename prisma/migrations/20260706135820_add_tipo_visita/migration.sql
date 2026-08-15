-- CreateEnum
CREATE TYPE "VisitType" AS ENUM ('WEBINAR', 'WORKSHOP', 'REUNIAO', 'SUPORTE', 'VISITA');

-- AlterTable
ALTER TABLE "visitas" ADD COLUMN     "tipoVisita" "VisitType";
