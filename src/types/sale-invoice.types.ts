import { NewSaleService, NewSaleServiceNormalized, SaleServiceCalculable } from "./sale-service.types";
import { NewSaleProduct, SaleProductCalculable } from "./sale-product.types";
import { NotaVenda, Prisma } from "@prisma/client";
import { NewCommission } from "./commission.types";

const saleInvoice = Prisma.validator<Prisma.NotaVendaDefaultArgs>()({
    include: {
        vendasServico: { include: { servico: true } },
        vendasProduto: { include: { produto: true } },
        comissoes: true,
        formaPagamento: true,
        datasBoleto: true,
    },
});
export type SaleInvoice = Prisma.NotaVendaGetPayload<typeof saleInvoice>;

export type NewSaleInvoice = Omit<NotaVenda, "id" | "vendaId" | "createdAt" | "updatedAt"> & {
    vendasServico: NewSaleService[];
    vendasProduto: NewSaleProduct[];
    datasBoleto: Date[];
};

export type NewSaleInvoiceNormalized = Omit<
    NewSaleInvoice,
    "vendasServico" | "numPedidoDistribuidor"
> & {
    vendasServico: NewSaleServiceNormalized[];
};
export type NewSaleInvoiceNormalizedWithCommissions = NewSaleInvoiceNormalized & { comissoes: NewCommission[] };
export type NewSalesInvoiceNormalizedWithCommissionsMappedBySaleId = Record<
    string,
    NewSaleInvoiceNormalizedWithCommissions[]
>;

export type SaleInvoiceEditData = Pick<NotaVenda, "id" | "codigo" | "formaPagamentoId" | "formaParcelamento"> & {
    vendasServico: NewSaleServiceNormalized[];
    vendasProduto: NewSaleProduct[];
    datasBoleto: Date[];
    comissoes: NewCommission[];
};

export type SaleInvoiceWithSalePersonCommission = NewSaleInvoice & {
    id: string;
    vendedoresComissao: { vendedorRoleId: string; comissao: number }[];
};

export type SaleInvoiceWithSalePersonMargin = NewSaleInvoice & {
    valorMargemBruta: number;
    vendedoresComissao: { vendedorRoleId: string; comissao: number }[];
};

export type SaleInvoiceCalculable = Pick<SaleInvoice, "dedutiveisDistribuidor" | "impostoNota" | "tipoFaturamento" | "markup"> & {
    vendasServico: SaleServiceCalculable[];
    vendasProduto: SaleProductCalculable[];
};

export type SaleInvoiceCalc = {
    valorCustoProdutos: number;
    valorMarkupProdutos: number;
    valorMarkupLiqProdutos: number;
    valorMargemBrutaProdutos: number;
    valorImpostoProdutos: number;
    valorVendaProdutos: number;

    valorCustoServicos: number;
    valorMarkupServicos: number;
    valorMarkupLiqServicos: number;
    valorMargemBrutaServicos: number;
    valorImpostoServicos: number;
    valorVendaServicos: number;

    valorCusto: number;
    valorMarkup: number;
    valorMarkupLiquido: number;
    valorMargemBruta: number;
    valorDedutiveisDistribuidor: number;
    valorImpostoNota: number;
    valorImpostos: number;
    valorVenda: number;
};
