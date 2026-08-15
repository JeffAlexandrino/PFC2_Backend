import { Acao, DistribuicaoComissao, Tabela } from "@prisma/client";
import { FindQueryProps } from "../types/commom.types";
import { RequestContext } from "../middlewares/auth";

import * as T from "../types/commission-distribution.types";

import UserRoleService from "./user-role.service";
import PrismaUtils from "../utils/prisma.utils";
import httpStatus from "../utils/httpStatus";
import auditService from "./audit.service";
import ApiError from "../utils/apiError";
import prisma from "../prisma/prisma";

export default class CommissionDistributionService {
    context: RequestContext;

    private readonly DISTRIBUTION_NOT_FOUNDED = "Distribuição de comissão não encontrada.";

    constructor(context: RequestContext) {
        this.context = context;
    }

    public createMany = async (
        newCommissionDistributions: T.NewCommissionDistribution[]
    ): Promise<DistribuicaoComissao[]> => {
        await this.validate(newCommissionDistributions);

        const _createdCommissionDistributions = newCommissionDistributions.map(({ roleCommissions }) =>
            prisma.distribuicaoComissao.create({
                data: {
                    empresaId: this.context.currentUserRole.empresaId,
                    roleCommissions: {
                        create: roleCommissions.map((roleCommission) => ({
                            ...roleCommission,
                        })),
                    },
                },
            })
        );

        const _audit = auditService.createAudit({
            data: newCommissionDistributions.flatMap(({ roleCommissions }) =>
                roleCommissions.map((Commissions) => ({ id: Commissions.userRoleId, ...Commissions }))
            ),
            action: Acao.CREATE,
            table: Tabela.DISTRIBUICAO_COMISSAO,
            context: this.context,
        });

        const results = await prisma.$transaction([..._createdCommissionDistributions, _audit]);
        const created = results.slice(0, _createdCommissionDistributions.length) as DistribuicaoComissao[];
        return created;
    };

    public findManyBy = async (
        query: FindQueryProps<T.CommissionDistributionWhere, T.CommissionDistributionSortBy>
    ): Promise<T.CommissionDistributionWithUserRoleCommission[]> => {
        const { userRoleId: userRoleId, role } = query.where ?? {};

        const commissionDistributions = await prisma.distribuicaoComissao.findMany({
            where: {
                roleCommissions: userRoleId || role ? { some: { userRoleId, userRole: { role } } } : undefined,
                empresaId: this.context.currentUserRole.empresaId,
            },
            include: {
                roleCommissions: { include: { userRole: { include: { user: { omit: { password: true } } } } } },
            },
            ...PrismaUtils.extractSortPageInfoFrom(query, "createdAt", "asc"),
        });

        return commissionDistributions;
    };

    public getOneBy = async (id: string): Promise<T.CommissionDistributionWithUserRoleCommission | null> => {
        return prisma.distribuicaoComissao.findUnique({
            where: { id, empresaId: this.context.currentUserRole.empresaId },
            include: {
                roleCommissions: { include: { userRole: { include: { user: { omit: { password: true } } } } } },
            },
        });
    };

    public updateOne = async (
        commissionDistributionData: T.UpdateCommissionDistributionProps
    ): Promise<DistribuicaoComissao> => {
        const distributionToUpdate = await this.getOneBy(commissionDistributionData.id);
        if (!distributionToUpdate) throw new ApiError(httpStatus.NOT_FOUND, this.DISTRIBUTION_NOT_FOUNDED);

        await this.validate([commissionDistributionData], commissionDistributionData.id);

        const _update = prisma.distribuicaoComissao.update({
            where: { id: commissionDistributionData.id, empresaId: this.context.currentUserRole.empresaId },
            data: {
                roleCommissions: {
                    deleteMany: {},
                    create: commissionDistributionData.roleCommissions.map(({ comissao, acelerator, userRoleId }) => ({
                        acelerator,
                        comissao,
                        userRoleId,
                    })),
                },
            },
        });

        const _audit = auditService.createAudit({
            data: [{ id: commissionDistributionData.id, ...commissionDistributionData.roleCommissions }],
            action: Acao.UPDATE,
            table: Tabela.DISTRIBUICAO_COMISSAO,
            context: this.context,
        });

        const [Dist] = await prisma.$transaction([_update, _audit]);
        return Dist;
    };

    public deleteOneBy = async (commissionDistributionId: string) => {
        const distributionToDelete = await this.getOneBy(commissionDistributionId);
        if (!distributionToDelete) throw new ApiError(httpStatus.NOT_FOUND, this.DISTRIBUTION_NOT_FOUNDED);

        const _delete = prisma.distribuicaoComissao.delete({
            where: { id: commissionDistributionId, empresaId: this.context.currentUserRole.empresaId },
        });

        const _audit = auditService.createAudit({
            data: [{ id: commissionDistributionId }],
            action: Acao.DELETE,
            table: Tabela.DISTRIBUICAO_COMISSAO,
            context: this.context,
        });

        await prisma.$transaction([_delete, _audit]);
        return;
    };

    public async getManyMappedBySaleId(
        props: T.CommissionDistributionsMappedBySaleIdProps[]
    ): Promise<T.DistributionsMappedBySaleId> {
        const salePersonIdsPerSale = props.map((prop) =>
            [prop.accountManagerId, prop.insideSalesId].filter((id) => id !== null)
        );
        const solutionArchitectIdsPerSale = props.map(({ solutionArchitectId: architectSolutionId }) =>
            architectSolutionId ? [architectSolutionId] : []
        );
        const comercialAssistantIdsPerSale = props.map(({ comercialAssistantId }) =>
            comercialAssistantId ? [comercialAssistantId] : []
        );
        const comercialManagerIdsPerSale = props.map(({ comercialManagerId }) =>
            comercialManagerId ? [comercialManagerId] : []
        );
        const referrerIdsPerSale = props.map(({ referrerId }) => (referrerId ? [referrerId] : []));

        const salePersonDists = await this.getByEach(salePersonIdsPerSale);
        const architectDists = await this.getByEach(solutionArchitectIdsPerSale);
        const comercialAssistantDists = await this.getByEach(comercialAssistantIdsPerSale);
        const comercialManagerDists = await this.getByEach(comercialManagerIdsPerSale);
        const referrerDists = await this.getByEach(referrerIdsPerSale);

        const commissionDistributionsMappedBySaleId = props.reduce((acc, prop, idx) => {
            const salePersonDist = salePersonDists.at(idx) ?? null;
            const architectDist = architectDists.at(idx) ?? null;
            const comercialAssistantDist = comercialAssistantDists.at(idx) ?? null;
            const comercialManagerDist = comercialManagerDists.at(idx) ?? null;
            const referrerDist = referrerDists.at(idx) ?? null;

            if ((prop.accountManagerId || prop.insideSalesId) && !salePersonDist)
                throw new ApiError(httpStatus.NOT_FOUND, "Para esses vendedores não existe distribuição de comissão.");
            if (prop.comercialAssistantId && !comercialAssistantDist)
                throw new ApiError(httpStatus.NOT_FOUND, "Para esse assistente não existe distribuição de comissão.");
            if (prop.comercialManagerId && !comercialManagerDist)
                throw new ApiError(httpStatus.NOT_FOUND, "Para esse gerente não existe distribuição de comissão.");
            if (prop.solutionArchitectId && !architectDist)
                throw new ApiError(httpStatus.NOT_FOUND, "Para esse arquiteto não existe distribuição de comissão.");
            if (prop.referrerId && !referrerDist)
                throw new ApiError(httpStatus.NOT_FOUND, "Para esse indicador não existe distribuição de comissão.");

            return {
                ...acc,
                [prop.id]: {
                    salePersonDist,
                    comercialManagerDist,
                    architectDist,
                    comercialAssistantDist,
                    referrerDist,
                },
            };
        }, {} as T.DistributionsMappedBySaleId);

        return commissionDistributionsMappedBySaleId;
    }

    public getUniqueByEach = async (userRoleIdsMatrix: string[][]) => {
        const uniqueComissionDistributions = await this.getByEach(userRoleIdsMatrix);

        if (uniqueComissionDistributions.some((commissionDistribution) => !commissionDistribution))
            throw new ApiError(httpStatus.NOT_FOUND, "Distribuição de comissão não encontrada!");

        return uniqueComissionDistributions;
    };

    private getByEach = async (userRoleIdsMatrix: string[][]) => {
        const _commissionDistributionsMatrix = userRoleIdsMatrix.map((userRoleIds) =>
            this.findMatchRolesInDistribution(userRoleIds)
        );

        const commissionDistributionsMatrix = await prisma.$transaction(_commissionDistributionsMatrix);

        const uniqueComissionDistributions = commissionDistributionsMatrix.map((commissionDistributions, idx) =>
            commissionDistributions.find((commissionDistribtion) =>
                this.allRolesInDistribution(commissionDistribtion, userRoleIdsMatrix[idx])
            )
        );

        return uniqueComissionDistributions;
    };

    private validate = async (
        commissionDistributions: T.NewCommissionDistribution[],
        commissionDistributionIdToUpdate?: string
    ) => {
        await this.validateDuplications(commissionDistributions, commissionDistributionIdToUpdate);

        const userRoleIdsMatrix = commissionDistributions.map((cd) => cd.roleCommissions.map((v) => v.userRoleId));
        await this.validateRoles(userRoleIdsMatrix);

        const userRoleIds = commissionDistributions.flatMap((cd) => cd.roleCommissions.map((v) => v.userRoleId));
        await this.validateOrganizationSalePersonRoles(userRoleIds);
    };

    private validateDuplications = async (
        commissionDistributions: T.NewCommissionDistribution[],
        commissionIdToUpdate?: string
    ) => {
        const salePersonRoleIdsMatrix = commissionDistributions.map((cd) =>
            cd.roleCommissions.map((vc) => vc.userRoleId)
        );

        const _commissionDistributionsMatrix = salePersonRoleIdsMatrix.map((salePersonRoleIds) =>
            this.findMatchRolesInDistribution(salePersonRoleIds, commissionIdToUpdate)
        );
        const commissionDistribtionsMatrix = await prisma.$transaction(_commissionDistributionsMatrix);

        const existDuplication = commissionDistribtionsMatrix.some((commissionDistributions, idx) =>
            commissionDistributions.some((commissionDistribution) =>
                this.allRolesInDistribution(commissionDistribution, salePersonRoleIdsMatrix[idx])
            )
        );

        if (existDuplication)
            throw new ApiError(httpStatus.BAD_REQUEST, "Já existe uma distribuição com esses papéis de usuários!");
    };

    private validateRoles = async (userRoleIdsMatrix: string[][]) => {
        const _infoRolesMatrix = userRoleIdsMatrix.map((userRoleIds) =>
            prisma.userRole.findMany({
                where: { id: { in: userRoleIds } },
                include: { user: { select: { name: true } } },
            })
        );

        const infoRolesMatrix = await prisma.$transaction(_infoRolesMatrix);

        userRoleIdsMatrix.forEach((userRoleIds, index) => {
            const infoRoles = infoRolesMatrix.at(index);
            if (!infoRoles) throw new ApiError(httpStatus.NOT_FOUND, "Não existe nenhum infoRole correspondente!");
            if (userRoleIds.length !== infoRoles.length)
                throw new ApiError(httpStatus.NOT_FOUND, "Role de usuário não encontrada!");

            const firstRole = infoRoles.at(0)?.role;
            if (!firstRole) return;
            if (!UserRoleService.comercialRoles.includes(firstRole))
                throw new ApiError(httpStatus.BAD_REQUEST, "Somente papéis comerciais são aceitos!");

            const allRolesAreNotEqual = infoRoles.some((infoRole) => infoRole.role !== firstRole);
            if (allRolesAreNotEqual)
                throw new ApiError(httpStatus.BAD_REQUEST, "Todos os papéis devem ser iguais em uma distrtibuição!");
        });
    };

    private validateOrganizationSalePersonRoles = async (salePersonRolesIds: string[]) => {
        const notOrganizationRole = await prisma.userRole.findFirst({
            where: { id: { in: salePersonRolesIds }, empresaId: { not: this.context.currentUserRole.empresaId } },
        });

        if (notOrganizationRole)
            throw new ApiError(httpStatus.BAD_REQUEST, `Alguns usuários não são válidos para esta ação!`);
    };

    private findMatchRolesInDistribution = (userRoleIds: string[], commissionDistributionIdToIgnore?: string) => {
        return prisma.distribuicaoComissao.findMany({
            include: { roleCommissions: true },
            where: {
                empresaId: this.context.currentUserRole.empresaId,
                roleCommissions: { every: { userRoleId: { in: userRoleIds } } },
                id: { not: commissionDistributionIdToIgnore },
            },
        });
    };

    private allRolesInDistribution = (
        commissionDistribution: T.CommissionDistributionWithUserRoleCommission,
        userRoleIds: string[]
    ) => {
        return userRoleIds.every((userRoleId) => {
            const distributionSalePersonRoleIds = commissionDistribution.roleCommissions.map(
                ({ userRoleId }) => userRoleId
            );
            return distributionSalePersonRoleIds.includes(userRoleId);
        });
    };
}
