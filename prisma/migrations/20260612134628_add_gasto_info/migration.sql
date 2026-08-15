-- AlterTable
ALTER TABLE "gastos" ADD COLUMN     "carroEmpresa" BOOLEAN,
ADD COLUMN     "dataViagem" TIMESTAMP(3),
ADD COLUMN     "kmFinal" INTEGER,
ADD COLUMN     "kmInicial" INTEGER;
