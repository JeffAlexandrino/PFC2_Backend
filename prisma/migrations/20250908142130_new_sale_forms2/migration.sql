-- AlterTable
ALTER TABLE "nota_venda" ADD COLUMN     "markup" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "produtos" ADD COLUMN     "tipoMoeda" "TipoMoeda" DEFAULT 'BRL';

-- AlterTable
ALTER TABLE "venda_produto" ALTER COLUMN "markup" DROP NOT NULL;

-- AlterTable
ALTER TABLE "venda_servico" ALTER COLUMN "markup" DROP NOT NULL;
