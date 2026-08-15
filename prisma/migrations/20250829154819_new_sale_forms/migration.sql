-- AlterTable
ALTER TABLE "nota_venda" ADD COLUMN     "dedutiveisDistribuidor" DOUBLE PRECISION,
ADD COLUMN     "impostoNota" DOUBLE PRECISION,
ADD COLUMN     "numOportunidadeCRM" TEXT,
ADD COLUMN     "numPedidoDistribuidor" TEXT,
ADD COLUMN     "tipoFaturamento" "TipoFaturamento";

-- AlterTable
ALTER TABLE "venda_produto" ALTER COLUMN "impostoNota" DROP NOT NULL,
ALTER COLUMN "tipoFaturamento" DROP NOT NULL,
ALTER COLUMN "dedutiveisDistribuidor" DROP NOT NULL;

-- AlterTable
ALTER TABLE "venda_servico" ALTER COLUMN "impostoNota" DROP NOT NULL,
ALTER COLUMN "tipoFaturamento" DROP NOT NULL,
ALTER COLUMN "dedutiveisDistribuidor" DROP NOT NULL;
