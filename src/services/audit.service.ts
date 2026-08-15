import { AuditSortBy, AuditWhere, CreateAuditProps } from "../types/audit.types";
import { FindQueryProps } from "../types/commom.types";
import { RequestContext } from "../middlewares/auth";

import prisma from "../prisma/prisma";

const createAudit = (logs: CreateAuditProps) => {
    return prisma.auditoria.createMany({
        data: logs.data.map(({ id, ...restData }) => ({
            tabela: logs.table,
            userId: logs.context.currentUserRole.userId, // Era logs.context.user.id
            acao: logs.action,
            dado: restData,
            dadoId: id,
            empresaId: logs.context.currentUserRole.empresaId,
        })),
    });
};

const queryAudit = async (query: FindQueryProps<AuditWhere, AuditSortBy>, context: RequestContext) => {
    const page = query.page;
    const limit = query.limit;
    const sortBy = query.sortBy ?? "data";
    const sortType = query.sortType ?? "asc";

    const audits = await prisma.auditoria.findMany({
        where: { ...query.where, empresaId: context.currentUserRole.empresaId },
        include: { usuario: true },
        orderBy: sortBy ? { [sortBy]: sortType } : undefined,
        take: limit,
        skip: page !== undefined && limit !== undefined ? page * limit : undefined,
    });
    return audits;
};

export default { queryAudit, createAudit };
