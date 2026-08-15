/*
  Warnings:

  - You are about to drop the column `logo` on the `empresas` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "empresas" DROP COLUMN "logo",
ADD COLUMN     "empresaLogoId" TEXT;

-- CreateTable
CREATE TABLE "EmpresaLogo" (
    "id" TEXT NOT NULL,
    "buffer" BYTEA NOT NULL,
    "fileName" VARCHAR(256) NOT NULL,
    "mimetype" VARCHAR(256) NOT NULL,
    "empresaId" TEXT NOT NULL,

    CONSTRAINT "EmpresaLogo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmpresaLogo_empresaId_key" ON "EmpresaLogo"("empresaId");

-- AddForeignKey
ALTER TABLE "EmpresaLogo" ADD CONSTRAINT "EmpresaLogo_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
