import { DistribuicaoComissao, Prisma, Role, RoleCommission } from "@prisma/client";
import { FindQueryProps } from "./commom.types";

//VARIETIES
export type NewCommissionDistributionWithOrgId = NewCommissionDistribution & Pick<DistribuicaoComissao, "empresaId">;
export type NewCommissionDistribution = {
    roleCommissions: Pick<RoleCommission, "comissao" | "acelerator" | "userRoleId">[];
};

const commissionDistributionWithUserRoleCommission = Prisma.validator<Prisma.DistribuicaoComissaoDefaultArgs>()({
    include: { roleCommissions: true },
});
export type CommissionDistributionWithUserRoleCommission = Prisma.DistribuicaoComissaoGetPayload<
    typeof commissionDistributionWithUserRoleCommission
>;

export type UpdateCommissionDistributionProps = NewCommissionDistribution & Pick<DistribuicaoComissao, "id">;
export type CommissionDistributionsMappedBySaleIdProps = {
    accountManagerId: string | null;
    insideSalesId: string | null;
    referrerId: string | null;
    solutionArchitectId: string | null;
    comercialAssistantId: string | null;
    comercialManagerId: string | null;
    id: string;
};

export const CommissionDistributionSortBy = Prisma.DistribuicaoComissaoScalarFieldEnum;
export type CommissionDistributionSortBy = Prisma.DistribuicaoComissaoScalarFieldEnum;
export type CommissionDistributionWhere = { userRoleId?: string; role?: Role };

export type DistributionsMappedBySaleId = Record<string, SaleDistribution>;
export type SaleDistribution = {
    salePersonDist: CommissionDistributionWithUserRoleCommission | null;
    referrerDist: CommissionDistributionWithUserRoleCommission | null;
    comercialManagerDist: CommissionDistributionWithUserRoleCommission | null;
    architectDist: CommissionDistributionWithUserRoleCommission | null;
    comercialAssistantDist: CommissionDistributionWithUserRoleCommission | null;
};

//VALIDATIONS
export type ValidUpdateCommissionDistribution = { params: { id: string }; body: { data: NewCommissionDistribution } };
export type ValidCreateCommissionDistribution = { body: { data: NewCommissionDistribution[] } };
export type ValidFindCommissionDistribution = {
    query: FindQueryProps<CommissionDistributionWhere, CommissionDistributionSortBy>;
};
export type ValidGetCommissionDistribution = { params: { id: string } };
export type ValidDeleteCommissionDistribution = { params: { id: string } };
