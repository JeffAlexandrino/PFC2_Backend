-- AlterTable
ALTER TABLE "produtos" ALTER COLUMN "tipoMoeda" DROP DEFAULT;

-- AlterTable
ALTER TABLE "servicos" ALTER COLUMN "tipoMoeda" DROP DEFAULT;

-- AlterTable
ALTER TABLE "venda_produto" ALTER COLUMN "tipoMoeda" DROP DEFAULT;

-- AlterTable
ALTER TABLE "venda_servico" ALTER COLUMN "tipoMoeda" DROP DEFAULT;
