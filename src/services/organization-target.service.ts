import {
    DataUpdateOrganizationTarget,
    QueryFindOrganizationTargets,
} from "../validations/organization-target.validator";
import { ActualValuesTypes, NewTargetEmpresa as NewTargetEmpresa } from "../types/organization-target.types";
import { Acao, Comissao, Tabela } from "@prisma/client";
import { RequestContext } from "../middlewares/auth";

import PrismaUtils from "../utils/prisma.utils";
import httpStatus from "../utils/httpStatus";
import auditService from "./audit.service";
import ApiError from "../utils/apiError";
import prisma from "../prisma/prisma";

export default class OrganizationTargetService {
    private readonly context: RequestContext;

    private readonly targetIncludes = { tiposMeta: true } as const;

    constructor(context: RequestContext) {
        this.context = context;
    }

    public createMany = async (newTargets: NewTargetEmpresa[]) => {
        const userRoleContext = this.context.currentUserRole;

        // Verify if a target already exists for any new target (same organization, overlapping period and same tipoMeta)
        for (const novaMeta of newTargets) {
            const existing = await prisma.metaEmpresa.findFirst({
                where: {
                    empresaId: userRoleContext.empresaId,
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
            prisma.metaEmpresa.create({
                data: {
                    ...novaMeta,
                    empresaId: userRoleContext.empresaId,
                    tiposMeta: { create: novaMeta.tiposMeta.map((tipoMeta) => ({ ...tipoMeta, valorAtual: 0 })) },
                },
                include: { tiposMeta: true },
            })
        );

        const _audit = auditService.createAudit({
            action: Acao.CREATE,
            table: Tabela.META_EMPRESA,
            data: newTargets.map((target) => {
                return { id: userRoleContext.empresaId, target };
            }),
            context: this.context,
        });

        const results = await prisma.$transaction([..._createTargets, _audit]);
        const created = results.slice(0, _createTargets.length) as any[];
        return created;
    };

    public findManyBy = async (query: QueryFindOrganizationTargets) => {
        const { dataFimMeta, dataInicioMeta, tipoMeta } = query.where ?? {};

        const targets = await prisma.metaEmpresa.findMany({
            where: {
                empresaId: this.context.currentUserRole.empresaId,
                dataInicioMeta: { gte: dataInicioMeta },
                dataFimMeta: { lte: dataFimMeta },
                tiposMeta: { some: { tipoMeta: tipoMeta } },
            },
            include: this.targetIncludes,
            ...PrismaUtils.extractSortPageInfoFrom(query, "dataInicioMeta", "desc"),
        });

        return targets;
    };

    public getOneBy = async (targetId: string) => {
        const target = await prisma.metaEmpresa.findUnique({
            where: {
                id: targetId,
                empresaId: this.context.currentUserRole.empresaId,
            },
            include: this.targetIncludes,
        });
        if (!target) return null;

        return target;
    };

    public updateOne = async (targetId: string, updateData: DataUpdateOrganizationTarget) => {
        await this.validateIfExist(targetId);

        const _deletedTypesOfTargets = prisma.valorTipoMetaEmpresa.deleteMany({ where: { metaEmpresaId: targetId } });

        const _updatedTarget = prisma.metaEmpresa.update({
            where: { id: targetId },
            data: {
                dataInicioMeta: updateData.dataInicioMeta,
                dataFimMeta: updateData.dataFimMeta,
                tiposMeta: {
                    create: updateData.tiposMeta.map((tipoMeta) => ({
                        ...tipoMeta,
                    })),
                },
            },
            include: { tiposMeta: true },
        });

        const _audit = auditService.createAudit({
            action: Acao.UPDATE,
            table: Tabela.META_EMPRESA,
            data: [{ id: targetId, ...updateData }],
            context: this.context,
        });

        const [_, updatedTarget] = await prisma.$transaction([_deletedTypesOfTargets, _updatedTarget, _audit]);
        return updatedTarget;
    };

    public deleteOneBy = async (targetId: string) => {
        await this.validateIfExist(targetId);

        const _deletedOneMeta = prisma.metaEmpresa.delete({
            where: { id: targetId, empresaId: this.context.currentUserRole.empresaId },
        });

        const _audit = auditService.createAudit({
            action: Acao.DELETE,
            table: Tabela.META_EMPRESA,
            data: [{ id: targetId }],
            context: this.context,
        });

        await prisma.$transaction([_deletedOneMeta, _audit]);
        return;
    };

    private validateIfExist = async (targetId: string) => {
        const target = await this.getOneBy(targetId);
        if (!target) throw new ApiError(httpStatus.NOT_FOUND, "Meta Empresa não encontrada");

        return target;
    };
}
