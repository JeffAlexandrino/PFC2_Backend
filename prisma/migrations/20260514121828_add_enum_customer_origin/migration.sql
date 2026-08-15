-- CreateEnum
CREATE TYPE "Origem" AS ENUM ('INDICATION', 'WHATSAPP', 'INSTAGRAM', 'EMAIL', 'LINKEDIN', 'CELLPHONE');

-- AlterTable
ALTER TABLE "clientes" ADD COLUMN     "origem" "Origem";
