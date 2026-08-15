import { SaleWithClientSaleInvoice } from "./sale.types";
import { Prisma } from "@prisma/client";

const salePersonForRank = Prisma.validator<Prisma.UserRoleDefaultArgs>()({
    select: { id: true, user: { select: { name: true, id: true, email: true } } },
});
export type RankUserRole = Prisma.UserRoleGetPayload<typeof salePersonForRank>;

export type UserRoleRank = {
    userRole: RankUserRole;
    valorAcumulado: number;
    valorAcumuladoVendaRenovacao: number;
    valorAcumuladoVendaNova: number;
    posicao: number;
    qntVendas: number;
};

const salePersonWithUser = Prisma.validator<Prisma.UserRoleDefaultArgs>()({
    include: { user: { omit: { password: true } } },
});
export type SalePersonWithUser = Prisma.UserRoleGetPayload<typeof salePersonWithUser>;

export type MapSalesAndNameBySaleNameId = Record<string, { name: string; sales: SaleWithClientSaleInvoice[] }>;