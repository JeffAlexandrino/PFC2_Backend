import { Categoria, EstadoVenda, TipoProdutoServico, Visita } from "@prisma/client";
import { CustomerWithSegment } from "./customer.types";
import { SaleWithSaleInvoice } from "./sale.types";
import { ComercialRole } from "./user-role.types";

export enum DashboardMetric {
    VALOR_VENDA = "VALOR_VENDA",
    MARKUP_BRUTO = "MARKUP_BRUTO",
    MARKUP_LIQUIDO = "MARKUP_LIQUIDO",
    //MARGEM = "MARGEM",
    FATURAMENTO = "FATURAMENTO",
    VISITA = "VISITA",
}

//VALIDATIONS
export type ValidFindDashboardsWithoutMetric = { query: Omit<DashboardsWhere, "metrica"> };
export type ValidFindDashboardsWithMetric = { query: DashboardsWhere };

export type DashboardsQueryWithoutMetric = Omit<DashboardsWhere, "metrica">;
export type DashboardsWhere = {
    estadoVenda?: EstadoVenda;
    metrica?: DashboardMetric;
    userRoleId?: string;
    role?: ComercialRole;
    dataInicio: Date;
    dataFim: Date;
};

export type SaleEvolutionMappedByYearMonth = Record<string, SaleEvolution>;
export type SaleEvolutionWithYearMonth = SaleEvolution & { mesAno: string };
export type SaleEvolution = {
    valorVenda: number;
    markupBruto: number;
    markupLiquido: number;
    margem: number;
    qntdVendasIteradas: number;
};
export type SaleDataForEvolution = Pick<SaleWithSaleInvoice, "notasVenda"> & {
    valorVenda: number;
    valorMarkup: number;
    valorMarkupLiquido: number;
    valorMargemBruta: number;
};

export type RankCustomerInfo = {
    cliente: CustomerWithSegment;
    posicao: number;
    valorAcumulado: number;
    valorGasto: number;
    qntVendas: number;
};

export type CategoryRank = {
    categoria: Pick<Categoria, "id" | "name">;
    valorAcumulado: number;
    posicao: number;
};

export type TotalValueByProductServiceType = {
    tipoProdServ: Pick<TipoProdutoServico, "id" | "name">;
    valorAcumulado: number;
};

export type MapVisitsEvolutionMappedByYearMonth = Record<string, VisitEvolution>;
export type VisitEvolutionWithYearMonth = VisitEvolution & { mesAno: string };
export type VisitDataForEvolution = Pick<Visita, "dataVisita">;
export type VisitEvolution = { qntdVisitas: number };
