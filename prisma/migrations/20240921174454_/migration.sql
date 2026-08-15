-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'GERENTE_VENDAS', 'VENDEDOR');

-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('ACCESS', 'REFRESH', 'RESET_PASSWORD', 'VERIFY_EMAIL');

-- CreateEnum
CREATE TYPE "TipoMoeda" AS ENUM ('BRL', 'USD');

-- CreateEnum
CREATE TYPE "EstadoVenda" AS ENUM ('VERIFICADA', 'AGUARDANDO_VERIFICACAO');

-- CreateEnum
CREATE TYPE "Acao" AS ENUM ('CREATE', 'UPDATE', 'DELETE');

-- CreateEnum
CREATE TYPE "Tabela" AS ENUM ('USUARIO', 'VENDEDOR', 'CLIENTE', 'PRODUTO', 'FORNECEDOR', 'META', 'SERVICO', 'VENDA');

-- CreateEnum
CREATE TYPE "TipoFaturamento" AS ENUM ('DIRETO', 'REVENDA');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(256) NOT NULL,
    "email" VARCHAR(256) NOT NULL,
    "password" VARCHAR(256) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'VENDEDOR',
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "bloqueado" BOOLEAN NOT NULL DEFAULT false,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "type" "TokenType" NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "blacklisted" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendedores" (
    "id" TEXT NOT NULL,
    "acelerador" DOUBLE PRECISION NOT NULL,
    "comissao" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,

    CONSTRAINT "vendedores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(256) NOT NULL,
    "cnpj" VARCHAR(14) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" VARCHAR(256) NOT NULL,
    "telefone" VARCHAR(156) NOT NULL,
    "segmentoId" TEXT NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "segmentos" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(256) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "segmentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipo_produto_servico" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(256) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tipo_produto_servico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produtos" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(256) NOT NULL,
    "partNumber" VARCHAR(256) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "categoriaId" TEXT NOT NULL,
    "fabricanteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tipoProdutoServicoId" TEXT NOT NULL,

    CONSTRAINT "produtos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fornecedores" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(256) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cnpj" VARCHAR(14) NOT NULL,
    "email" VARCHAR(256) NOT NULL,

    CONSTRAINT "fornecedores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fabricantes" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(256) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fabricantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(256) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metas" (
    "id" TEXT NOT NULL,
    "dataInicioMeta" TIMESTAMP(3) NOT NULL,
    "dataFimMeta" TIMESTAMP(3) NOT NULL,
    "vendedorId" TEXT NOT NULL,
    "valorVenda" DOUBLE PRECISION NOT NULL,
    "valorFaturamento" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "metas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "servicos" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(256) NOT NULL,
    "valorCustoHora" DOUBLE PRECISION NOT NULL,
    "observacoes" VARCHAR(256) NOT NULL,
    "tipoMoeda" "TipoMoeda" NOT NULL DEFAULT 'BRL',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tipoProdutoServicoId" TEXT NOT NULL,

    CONSTRAINT "servicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendas" (
    "id" TEXT NOT NULL,
    "formaParcelamento" INTEGER NOT NULL,
    "codigoNota" TEXT NOT NULL,
    "estadoVenda" "EstadoVenda" NOT NULL DEFAULT 'AGUARDANDO_VERIFICACAO',
    "dataVenda" TIMESTAMP(3) NOT NULL,
    "dataFaturamento" TIMESTAMP(3) NOT NULL,
    "clienteId" TEXT NOT NULL,
    "vendedorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venda_produto" (
    "vendaId" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "valorCustoUnit" DOUBLE PRECISION NOT NULL,
    "markup" DOUBLE PRECISION NOT NULL,
    "impostoISS" DOUBLE PRECISION NOT NULL,
    "impostoICMS" DOUBLE PRECISION NOT NULL,
    "impostoPISCON" DOUBLE PRECISION NOT NULL,
    "impostoIPI" DOUBLE PRECISION NOT NULL,
    "impostoNota" DOUBLE PRECISION NOT NULL,
    "cotacao" DOUBLE PRECISION NOT NULL,
    "tipoMoeda" "TipoMoeda" NOT NULL DEFAULT 'BRL',
    "tipoFaturamento" "TipoFaturamento" NOT NULL,

    CONSTRAINT "venda_produto_pkey" PRIMARY KEY ("vendaId","produtoId")
);

-- CreateTable
CREATE TABLE "venda_servico" (
    "vendaId" TEXT NOT NULL,
    "servicoId" TEXT NOT NULL,
    "qntdHorasComercial" INTEGER NOT NULL,
    "qntdHorasNaoComercial" INTEGER NOT NULL,
    "qntdHorasEspecial" INTEGER NOT NULL,
    "markup" DOUBLE PRECISION NOT NULL,
    "valorCustoHora" DOUBLE PRECISION NOT NULL,
    "impostoISS" DOUBLE PRECISION NOT NULL,
    "impostoICMS" DOUBLE PRECISION NOT NULL,
    "impostoPISCON" DOUBLE PRECISION NOT NULL,
    "impostoIPI" DOUBLE PRECISION NOT NULL,
    "impostoNota" DOUBLE PRECISION NOT NULL,
    "cotacao" DOUBLE PRECISION NOT NULL,
    "tipoMoeda" "TipoMoeda" NOT NULL DEFAULT 'BRL',
    "tipoFaturamento" "TipoFaturamento" NOT NULL
);

-- CreateTable
CREATE TABLE "auditoria" (
    "id" TEXT NOT NULL,
    "dadoId" TEXT NOT NULL,
    "dado" JSONB NOT NULL,
    "acao" "Acao" NOT NULL,
    "tabela" "Tabela" NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comissoes" (
    "id" TEXT NOT NULL,
    "comissao" DOUBLE PRECISION NOT NULL,
    "acelerador" DOUBLE PRECISION NOT NULL,
    "dataComissao" TIMESTAMP(3) NOT NULL,
    "valorMargemBrutaBase" DOUBLE PRECISION NOT NULL,
    "vendedorId" TEXT NOT NULL,
    "vendaId" TEXT NOT NULL,

    CONSTRAINT "comissoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_FornecedorToProduto" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "vendedores_userId_key" ON "vendedores"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_cnpj_key" ON "clientes"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_email_key" ON "clientes"("email");

-- CreateIndex
CREATE UNIQUE INDEX "produtos_partNumber_key" ON "produtos"("partNumber");

-- CreateIndex
CREATE UNIQUE INDEX "fornecedores_cnpj_key" ON "fornecedores"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "fornecedores_email_key" ON "fornecedores"("email");

-- CreateIndex
CREATE UNIQUE INDEX "vendas_codigoNota_key" ON "vendas"("codigoNota");

-- CreateIndex
CREATE UNIQUE INDEX "venda_servico_vendaId_servicoId_key" ON "venda_servico"("vendaId", "servicoId");

-- CreateIndex
CREATE UNIQUE INDEX "_FornecedorToProduto_AB_unique" ON "_FornecedorToProduto"("A", "B");

-- CreateIndex
CREATE INDEX "_FornecedorToProduto_B_index" ON "_FornecedorToProduto"("B");

-- AddForeignKey
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendedores" ADD CONSTRAINT "vendedores_userId_fkey" FOREIGN KEY ("userId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_segmentoId_fkey" FOREIGN KEY ("segmentoId") REFERENCES "segmentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_fabricanteId_fkey" FOREIGN KEY ("fabricanteId") REFERENCES "fabricantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_tipoProdutoServicoId_fkey" FOREIGN KEY ("tipoProdutoServicoId") REFERENCES "tipo_produto_servico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metas" ADD CONSTRAINT "metas_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "vendedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "servicos" ADD CONSTRAINT "servicos_tipoProdutoServicoId_fkey" FOREIGN KEY ("tipoProdutoServicoId") REFERENCES "tipo_produto_servico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "vendedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venda_produto" ADD CONSTRAINT "venda_produto_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venda_produto" ADD CONSTRAINT "venda_produto_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "vendas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venda_servico" ADD CONSTRAINT "venda_servico_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "servicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venda_servico" ADD CONSTRAINT "venda_servico_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "vendas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria" ADD CONSTRAINT "auditoria_userId_fkey" FOREIGN KEY ("userId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comissoes" ADD CONSTRAINT "comissoes_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "vendedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comissoes" ADD CONSTRAINT "comissoes_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "vendas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FornecedorToProduto" ADD CONSTRAINT "_FornecedorToProduto_A_fkey" FOREIGN KEY ("A") REFERENCES "fornecedores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FornecedorToProduto" ADD CONSTRAINT "_FornecedorToProduto_B_fkey" FOREIGN KEY ("B") REFERENCES "produtos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
