-- CreateEnum
CREATE TYPE "TipoMetaAlternantiva" AS ENUM ('VISITA');

-- CreateTable
CREATE TABLE "meta_alternativa" (
    "id" TEXT NOT NULL,
    "tipoMeta" "TipoMetaAlternantiva" NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "metaId" TEXT NOT NULL,

    CONSTRAINT "meta_alternativa_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "meta_alternativa" ADD CONSTRAINT "meta_alternativa_metaId_fkey" FOREIGN KEY ("metaId") REFERENCES "metas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
