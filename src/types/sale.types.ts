import { DataCreateSale, QueryFindSales } from "../validations/sale.validator";
import { EstadoVenda, Prisma, Role, Venda } from "@prisma/client";
import { SaleInvoiceCalculable } from "./sale-invoice.types";

//VARIETIES
export type NewSaleWithOrgId = DataCreateSale & Pick<Venda, "empresaId">;
export type UpdateSaleProps = DataCreateSale & Pick<Venda, "id">;
export type NewSaleWithId = NewSaleWithOrgId & { id: string };

export type NewSaleWithUsersAndInvoices = Pick<
    NewSaleWithId,
    | "id"
    | "accountManagerId"
    | "insideSalesId"
    | "notasVenda"
    | "solutionArchitectId"
    | "referrerId"
    | "comercialAssistantId"
    | "comercialManagerId"
>;
export type NewSaleWithUsersInvoicesAndContractId = NewSaleWithUsersAndInvoices & Pick<DataCreateSale, "contratoId">;

export type SaleWithSaleInvoicesWithCommissions = Prisma.VendaGetPayload<typeof saleWithSaleInvoicesWithCommissions>;
const saleWithSaleInvoicesWithCommissions = Prisma.validator<Prisma.VendaDefaultArgs>()({
    include: { notasVenda: { include: { comissoes: true } } },
});

export type SaleWithSaleInvoice = Prisma.VendaGetPayload<typeof saleWithSaleInvoice>;
const saleWithSaleInvoice = Prisma.validator<Prisma.VendaDefaultArgs>()({ include: { notasVenda: true } });

export type SaleWithClientSaleInvoice = Prisma.VendaGetPayload<typeof saleWithClientSaleInvoice>;
const saleWithClientSaleInvoice = Prisma.validator<Prisma.VendaDefaultArgs>()({
    include: {
        notasVenda: { include: { vendasServico: true, vendasProduto: true, datasBoleto: true } },
        accountManager: { select: { user: { select: { id: true, name: true } } } },
        comercialManager: { select: { user: { select: { id: true, name: true } } } },
        cliente: true,
    },
});

export type SaleWithUserRole = Prisma.VendaGetPayload<typeof saleWithUserRole>;
const saleWithUserRole = Prisma.validator<Prisma.VendaDefaultArgs>()({
    select: {
        comercialAssistant: true,
        comercialManager: true,
        solutionArchitect: true,
        referrer: true,
        accountManager: true,
        insideSales: true,
        dataVenda: true,
        cliente: { select: { name: true } },
        estadoVenda: true,
        notasVenda: { include: { vendasProduto: true, vendasServico: true }, select: { codigo: true } },
    },
});

export type SaleInvoiceWithIncludes = Prisma.VendaGetPayload<typeof saleInvoiceWithIncludes>;
const saleInvoiceWithIncludes = Prisma.validator<Prisma.VendaDefaultArgs>()({
    include: {
        notasVenda: { include: { vendasServico: true, vendasProduto: true, datasBoleto: true, comissoes: true } },
    },
});

export type SaleDataForRevenueEvolution = SaleInvoiceWithIncludes;
export type RevenueEvolution = { faturamento: number; qntdVendasIteradas: number };
export type RevenueEvolutionMappedByYearMonth = Record<string, RevenueEvolution>;
export type RevenueEvolutionWithYearMonth = RevenueEvolution & { mesAno: string };

export type SaleCalculable = { notasVenda: SaleInvoiceCalculable[] };
export interface SaleCalc {
    valorCusto: number;
    valorMarkup: number;
    valorMarkupLiquido: number;
    valorMargemBruta: number;
    valorDedutiveisDistribuidor: number;
    valorImpostoNota: number;
    valorImpostos: number;
    valorVenda: number;
}

//VALIDATIONS
export type SaleUserRolesParams = Pick<
    QueryFindSales["where"],
    | "comercialAssistantId"
    | "comercialManagerId"
    | "solutionArchitectId"
    | "salePersonId"
    | "referrerId"
    | "accountManagerId"
> & { role?: Role };

export type SaleUpdateOrDeleteQuery = { salePersonId?: string; estadoVendaAtual?: EstadoVenda };
export type SaleGetQuery = { salePersonId?: string };

export type saleCalcsSlotsType = {
    valorMarkup: number;
    valorVenda: number;
    valorImpostos: number;
    valorMarkupLiquido: number;
    valorImpostoNota: number;
    valorMargem: number;
};
