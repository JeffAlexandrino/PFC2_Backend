import { Comissao, EstadoVenda, Prisma, User } from "@prisma/client";

//VARIETIES
export type UpdateCommissionProps = Pick<Comissao, "comissaoPaga" | "id">;
export type PayManyCommissionsProps = { comissoesId: string[] };
export type ApproveCommissionsProps = PayManyCommissionsProps;

export type NewCommission = Pick<
    Comissao,
    "comissao" | "acelerador" | "comissaoPaga" | "dataComissao" | "valorMargemBrutaBase" | "userRoleId"
>;

export type CommissionWithSalePersonRole = Prisma.ComissaoGetPayload<typeof commissionsWithSalePersonRole>;
export type CommissionWithSale = Prisma.ComissaoGetPayload<typeof commissionsWithSale>;
const commissionsWithSalePersonRole = Prisma.validator<Prisma.ComissaoDefaultArgs>()({
    include: { userRole: { include: { user: { omit: { password: true } } } } },
});
const commissionsWithSale = Prisma.validator<Prisma.ComissaoDefaultArgs>()({
    include: { notaVenda: true, venda: { include: { cliente: true, contrato: { select: { name: true } } } } },
});

export type MapCommissionsAndNameBySalePersonRoleId = Record<
    string,
    { name: string; comissoes: (CommissionWithSale & CommissionWithSalePersonRole)[] }
>;

export type CommissionInfoPerUser = {
    user: Omit<User, "password">;
    comissoesIdsAPagar: string[];
    expectedValue: number;
    approvedValue: number;
    pago: number;
};

//VALIDATIONS

export type ValidGetInfoPerUser = { query: { where: CommissionReportWhere } };

export const CommissionSortBy = Prisma.ComissaoScalarFieldEnum;
export type CommissionSortBy = keyof typeof CommissionSortBy;

export type CommissionInfoPerUserWhere = CommissionReportWhere;
export type CommissionReportWhere = Pick<
    CommissionWhere,
    "userId" | "gte_dataComissao" | "lte_dataComissao" | "estadoVenda"
>;
export type CommissionWhere = Partial<{
    estadoVenda: EstadoVenda;
    userId: string;
    gte_dataComissao: Date;
    lte_dataComissao: Date;
    comissaoPaga: string;
    gte_updatedAt: Date;
    lte_updatedAt: Date;
    codigoNota: string;
    clienteId: string;
}>;
