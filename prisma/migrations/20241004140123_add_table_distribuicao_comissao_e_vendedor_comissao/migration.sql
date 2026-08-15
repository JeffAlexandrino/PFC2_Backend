-- CreateTable
CREATE TABLE "DistribuicaoComissao" (
    "id" TEXT NOT NULL,

    CONSTRAINT "DistribuicaoComissao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendedorComissao" (
    "id" TEXT NOT NULL,
    "vendedorId" TEXT NOT NULL,
    "comissao" DOUBLE PRECISION NOT NULL,
    "distribuicaoComissaoId" TEXT NOT NULL,

    CONSTRAINT "VendedorComissao_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "VendedorComissao" ADD CONSTRAINT "VendedorComissao_distribuicaoComissaoId_fkey" FOREIGN KEY ("distribuicaoComissaoId") REFERENCES "DistribuicaoComissao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
