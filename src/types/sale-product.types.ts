import { VendaProduto } from "@prisma/client";

export type NewSaleProduct = Pick<
    //TODO: após exclusão do banco, remover colunas movidas
    VendaProduto,
    | "produtoId"
    | "valorCustoUnit"
    | "quantidade"
    | "cotacao"
    | "tipoMoeda"
    | "markup"
    | "dedutiveisDistribuidor"
    | "impostoNota"
    | "tipoFaturamento"
> & { fornecedoresId: string[] };

export type SaleProductCalculable = Pick<
    VendaProduto,
    | "quantidade"
    | "valorCustoUnit"
    | "cotacao"
    | "markup"
    | "impostoNota"
    | "tipoFaturamento"
    | "dedutiveisDistribuidor"
>;

export type SaleProductCalcs = {
    valorCusto: number;
    valorMarkup: number;
    valorMargem: number;
    valorMarkupLiquido: number;
    valorImpostoNota: number; //TODO: copy to SaleInvoiceCalc, keep here to read the older versions
    valorImpostos: number; //TODO: copy to SaleInvoiceCalc, keep here to read the older versions
    valorVenda: number;
};

export type SaleProductTotalCalcs = {
    valorCustoProdutos: number;
    valorMarkupProdutos: number;
    valorMarkupLiqProdutos: number;
    valorMargemBrutaProdutos: number;
    valorImpostoProdutos: number; //TODO: copy to SaleInvoiceCalc, keep here to read the older versions
    valorVendaProdutos: number;
};
