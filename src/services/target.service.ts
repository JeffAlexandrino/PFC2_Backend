import {
    DataUpdateTarget,
    QueryCreateTarget,
    QueryDeleteTarget,
    QueryFindTargets,
    QueryGetTarget,
    QueryUpdateTarget,
} from "../validations/target.validator";
import { TargetWithSalePersonAndTypes, NewTarget } from "../types/target.types";
import { Acao, Comissao, EstadoVenda, Meta, Tabela } from "@prisma/client";
import { ComercialRole } from "../types/user-role.types";
import { IntervalDateType } from "../types/commom.types";
import { RequestContext } from "../middlewares/auth";
import { Calculator } from "../utils/calculator";

import UserRoleService from "./user-role.service";
import PrismaUtils from "../utils/prisma.utils";
import httpStatus from "../utils/httpStatus";
import auditService from "./audit.service";
import ApiError from "../utils/apiError";
import prisma from "../prisma/prisma";

export default class TargetService {
    private readonly context: RequestContext;
    private readonly userRoleService: UserRoleService;

    private readonly targetIncludes = { userRole: true, tiposMeta: true } as const;

    constructor(context: RequestContext) {
        this.context = context;
        this.userRoleService = new UserRoleService(context);
    }

    public createMany = async (newTargets: NewTarget[], query?: QueryCreateTarget) => {
        const userRoleIds = newTargets.map(({ userRoleId }) => userRoleId);

        await this.userRoleService.validateComercialRoles(userRoleIds);
        if (query?.userRole) await this.userRoleService.validateUserRoles(userRoleIds, query.userRole);

        // Verify if a target already exists for any new target (same userRole, overlapping period and same tipoMeta)
        for (const novaMeta of newTargets) {
            const existing = await prisma.meta.findFirst({
                where: {
                    userRoleId: novaMeta.userRoleId,
                    userRole: { empresaId: this.context.currentUserRole.empresaId },
                    dataInicioMeta: { lte: novaMeta.dataFimMeta },
                    dataFimMeta: { gte: novaMeta.dataInicioMeta },
                    tiposMeta: { some: { tipoMeta: { in: novaMeta.tiposMeta.map((t) => t.tipoMeta) } } },
                },
                include: { tiposMeta: true },
            });

            if (existing) {
                throw new ApiError(httpStatus.CONFLICT, "Meta já existente para o período e tipo informado");
            }
        }

        const _createTargets = newTargets.map(({ ...novaMeta }) =>
            prisma.meta.create({
                data: {
                    ...novaMeta,
                    tiposMeta: { create: novaMeta.tiposMeta.map((tipoMeta) => ({ ...tipoMeta })) },
                },
                include: { tiposMeta: true },
            })
        );

        const _audit = auditService.createAudit({
            action: Acao.CREATE,
            table: Tabela.META,
            data: newTargets.map(({ userRoleId }) => {
                return { id: userRoleId, ...newTargets };
            }),
            context: this.context,
        });

        const results = await prisma.$transaction([..._createTargets, _audit]);
        const created = results.slice(0, _createTargets.length) as any[];
        return created;
    };

    public findManyBy = async (query: QueryFindTargets) => {
        const { vendaRenovacao, dataFimMeta, dataInicioMeta, estadoVenda, userRoleId, userRole } = query.where ?? {};

        const targets = await prisma.meta.findMany({
            where: {
                userRole: { empresaId: this.context.currentUserRole.empresaId, role: userRole, id: userRoleId },
                dataInicioMeta: { gte: dataInicioMeta },
                dataFimMeta: { lte: dataFimMeta },
            },
            include: this.targetIncludes,
            ...PrismaUtils.extractSortPageInfoFrom(query, "dataInicioMeta", "desc"),
        });

        const targetsWithValuesAchieved = await this.getTargetsWithAchievedValues(targets, {
            estadoVenda,
            vendaRenovacao,
        });

        return targetsWithValuesAchieved;
    };

    public getOneBy = async (targetId: string, query?: QueryGetTarget) => {
        const target = await prisma.meta.findUnique({
            where: {
                id: targetId,
                userRole: { empresaId: this.context.currentUserRole.empresaId, role: query?.userRole },
            },
            include: this.targetIncludes,
        });
        if (!target) return null;

        const targetWithValuesAchieved = (await this.getTargetsWithAchievedValues([target]))[0];
        return targetWithValuesAchieved;
    };

    public findManyForCommission = async (commission: Pick<Comissao, "userRoleId" | "dataComissao">) => {
        const targets = await prisma.meta.findMany({
            where: {
                dataInicioMeta: { lte: commission.dataComissao },
                dataFimMeta: { gte: commission.dataComissao },
                userRole: { empresaId: this.context.currentUserRole.empresaId },
                userRoleId: commission.userRoleId,
            },
            include: this.targetIncludes,
        });

        return await this.getTargetsWithAchievedValues(targets, { estadoVenda: EstadoVenda.AVAILABLE_PAYMENT });
    };

    public findManyByRoleIdforUserReport = async (userRoleIds: string[], intervalDate?: IntervalDateType) => {
        const targets = await prisma.meta.findMany({
            where: {
                tiposMeta: { some: { tipoMeta: "VALOR_VENDA" } },
                userRole: { empresaId: this.context.currentUserRole.empresaId, id: { in: userRoleIds } },
                dataInicioMeta: { gte: intervalDate?.startDate },
                dataFimMeta: { lte: intervalDate?.endDate },
            },
            include: this.targetIncludes,
        });

        return targets;
    };

    public updateOne = async (targetId: string, updateData: DataUpdateTarget, query?: QueryUpdateTarget) => {
        await this.validateIfExist(targetId, query?.userRole);
        await this.userRoleService.validateComercialRoles([updateData.userRoleId]);

        const _deletedTypesOfTargets = prisma.valorTipoMeta.deleteMany({ where: { metaId: targetId } });

        const _updatedTarget = prisma.meta.update({
            where: { id: targetId },
            data: {
                dataInicioMeta: updateData.dataInicioMeta,
                dataFimMeta: updateData.dataFimMeta,
                userRole: { connect: { id: updateData.userRoleId } },
                tiposMeta: { create: updateData.tiposMeta.map((tipoMeta) => ({ ...tipoMeta })) },
            },
            include: { tiposMeta: true },
        });

        const _audit = auditService.createAudit({
            action: Acao.UPDATE,
            table: Tabela.META,
            data: [{ id: targetId, ...updateData }],
            context: this.context,
        });

        const [_, updatedTarget] = await prisma.$transaction([_deletedTypesOfTargets, _updatedTarget, _audit]);
        return updatedTarget;
    };

    public deleteOneBy = async (targetId: string, query?: QueryDeleteTarget) => {
        await this.validateIfExist(targetId, query?.userRole);

        const _deletedOneMeta = prisma.meta.delete({ where: { id: targetId } });

        const _audit = auditService.createAudit({
            action: Acao.DELETE,
            table: Tabela.META,
            data: [{ id: targetId, ...{ query } }],
            context: this.context,
        });

        await prisma.$transaction([_deletedOneMeta, _audit]);
        return;
    };

    private validateIfExist = async (targetId: string, userRole?: ComercialRole) => {
        const target = await this.getOneBy(targetId, { userRole });
        if (!target) throw new ApiError(httpStatus.NOT_FOUND, "Meta não encontrada");

        return target;
    };

    private getTargetsWithAchievedValues = async (
        targets: TargetWithSalePersonAndTypes[],
        where?: { estadoVenda?: EstadoVenda; vendaRenovacao?: boolean }
    ) => {
        const visitsByTarget = await this.findVisitsByDateMatrix(targets);
        const salesByRevenueDateMatrix = await this.findSalesByRevenueDateMatrix(targets, where);
        const salesByInvoicingTarget = await this.findSalesByInvoicesDateMatrix(targets, where);

        return targets.map((target, index) => {
            const salesByRevenueDate = salesByRevenueDateMatrix[index];
            const salesByInvoiceDate = salesByInvoicingTarget[index];
            const visits = visitsByTarget[index];

            const { valorVenda, valorMargemBruta, valorMarkupLiquido, valorMarkupBruto } = salesByInvoiceDate.reduce(
                (acc, sale) => {
                    const [calculation] = Calculator.getSalesWithCalcs([sale]);

                    return {
                        valorVenda: acc.valorVenda + calculation.valorVenda,
                        valorMargemBruta: acc.valorMargemBruta + calculation.valorMargemBruta,
                        valorMarkupLiquido: acc.valorMarkupLiquido + calculation.valorMarkupLiquido,
                        valorMarkupBruto: acc.valorMarkupBruto + calculation.valorMarkup,
                    };
                },
                {
                    valorVenda: 0,
                    valorMargemBruta: 0,
                    valorMarkupLiquido: 0,
                    valorMarkupBruto: 0,
                }
            );

            const revenueValueReached = salesByRevenueDate.reduce((acc, sale) => {
                const calculations = Calculator.getSaleInvoicesWithCalcs(sale.notasVenda);
                if (!calculations || calculations.length === 0) return acc;

                const saleContribution = sale.notasVenda.reduce((acc, saleInvoice, index) => {
                    const calculation = calculations[index];

                    const billetDate = saleInvoice.datasBoleto.length;
                    if (billetDate === 0) return acc;

                    const billetAtRange = saleInvoice.datasBoleto.filter(
                        ({ data }) => data >= target.dataInicioMeta && data <= target.dataFimMeta
                    ).length;
                    if (billetAtRange === 0) return acc;

                    return acc + calculation.valorMargemBruta * (billetAtRange / billetDate);
                }, 0);
                return acc + saleContribution;
            }, 0);

            const targetsWithReachedValues = target.tiposMeta.map((tipoMeta) => {
                let valorAtingido = 0;
                switch (tipoMeta.tipoMeta) {
                    case "VISITA":
                        valorAtingido = visits.length;
                        break;
                    case "FATURAMENTO":
                        valorAtingido = revenueValueReached;
                        break;
                    case "VALOR_VENDA":
                        valorAtingido = valorVenda;
                        break;
                    case "MARGEM":
                        valorAtingido = valorMargemBruta;
                        break;
                    case "MARKUP_LIQUIDO":
                        valorAtingido = valorMarkupLiquido;
                        break;
                    case "MARKUP_BRUTO":
                        valorAtingido = valorMarkupBruto;
                        break;
                }
                return { ...tipoMeta, valorAtingido };
            });
            return {
                ...target,
                tiposMeta: targetsWithReachedValues,
            };
        });
    };

    private findSalesByRevenueDateMatrix = (
        targets: Pick<Meta, "dataInicioMeta" | "dataFimMeta" | "userRoleId">[],
        where?: { estadoVenda?: EstadoVenda; vendaRenovacao?: boolean }
    ) => {
        const _salesMatrix = targets.map((target) => {
            return prisma.venda.findMany({
                where: {
                    OR: [
                        { accountManagerId: target.userRoleId },
                        { referrerId: target.userRoleId },
                        { solutionArchitectId: target.userRoleId },
                        { comercialAssistantId: target.userRoleId },
                        { comercialManagerId: target.userRoleId },
                    ],
                    estadoVenda: where?.estadoVenda,
                    vendaRenovacao: where?.vendaRenovacao,
                    notasVenda: {
                        some: {
                            datasBoleto: { some: { data: { gte: target.dataInicioMeta, lte: target.dataFimMeta } } },
                        },
                    },
                },
                include: {
                    notasVenda: {
                        include: { vendasProduto: true, vendasServico: true, datasBoleto: true },
                        where: {
                            datasBoleto: { some: { data: { gte: target.dataInicioMeta, lte: target.dataFimMeta } } },
                        },
                    },
                },
            });
        });

        return Promise.all(_salesMatrix);
    };

    private findSalesByInvoicesDateMatrix = (
        targets: Pick<Meta, "dataInicioMeta" | "dataFimMeta" | "userRoleId">[],
        where?: { estadoVenda?: EstadoVenda; vendaRenovacao?: boolean }
    ) => {
        const _invoicesMatrix = targets.map((target) => {
            return prisma.venda.findMany({
                where: {
                    OR: [
                        { accountManagerId: target.userRoleId },
                        { referrerId: target.userRoleId },
                        { solutionArchitectId: target.userRoleId },
                        { comercialAssistantId: target.userRoleId },
                        { comercialManagerId: target.userRoleId },
                    ],
                    estadoVenda: where?.estadoVenda,
                    vendaRenovacao: where?.vendaRenovacao,
                    notasVenda: {
                        some: {
                            dataFaturamento: {
                                gte: target.dataInicioMeta,
                                lte: target.dataFimMeta,
                            },
                        },
                    },
                },
                include: {
                    notasVenda: {
                        include: { vendasServico: true, vendasProduto: true },
                        where: {
                            dataFaturamento: {
                                gte: target.dataInicioMeta,
                                lte: target.dataFimMeta,
                            },
                        },
                    },
                },
            });
        });

        return prisma.$transaction(_invoicesMatrix);
    };

    private findVisitsByDateMatrix = (targets: Pick<Meta, "dataInicioMeta" | "dataFimMeta" | "userRoleId">[]) => {
        const _visitsMatrix = targets.map((target) => {
            return prisma.visita.findMany({
                where: {
                    salePersonId: target.userRoleId,
                    dataVisita: {
                        gte: target.dataInicioMeta,
                        lte: target.dataFimMeta,
                    },
                },
            });
        });
        return prisma.$transaction(_visitsMatrix);
    };
}
