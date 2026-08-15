import { Servico, VendaServico } from "@prisma/client";

export type NewSaleService = Pick<
    VendaServico,
    | "qntdHorasComercial"
    | "qntdHorasEspecial"
    | "qntdHorasNaoComercial"
    | "servicoId"
    | "cotacao"
    | "tipoMoeda"
    | "tipoFaturamento"
    | "impostoNota"
    | "dedutiveisDistribuidor"
    | "markup"
>;

export type NewSaleServiceNormalized = NewSaleService & Pick<Servico, "valorCustoHora" | "tipoMoeda">;

export type SaleServiceCalculable = Pick<
    VendaServico,
    | "qntdHorasComercial"
    | "qntdHorasEspecial"
    | "qntdHorasNaoComercial"
    | "valorCustoHora"
    | "cotacao"
    | "tipoMoeda"
    | "tipoFaturamento"
    | "impostoNota"
    | "dedutiveisDistribuidor"
    | "markup"
>;
export type SaleServiceCalcs = {
    valorCusto: number;
    valorMarkup: number;
    valorMargem: number;
    valorMarkupLiquido: number;
    valorImpostoNota: number; //TODO: copy to SaleInvoiceCalc, keep here to read the older versions
    valorImpostos: number; //TODO: copy to SaleInvoiceCalc, keep here to read the older versions
    valorVenda: number;
};

export type SaleServiceTotalCalcs = {
    valorCustoServicos: number;
    valorMarkupServicos: number;
    valorMarkupLiqServicos: number;
    valorMargemBrutaServicos: number;
    valorImpostoServicos: number; //TODO: copy to SaleInvoiceCalc, keep here to read the older versions
    valorVendaServicos: number;
};
