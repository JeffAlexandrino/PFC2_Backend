import { COMERCIAL_ROLES, FindManyWithSalesAndVisitsProps } from "../types/user-role.types";
import { UserRoleSortBy, UserRoleWhere } from "../types/user-role.types";
import { Role, EstadoVenda, Acao, Tabela } from "@prisma/client";
import { FindQueryProps } from "../types/commom.types";
import { RequestContext } from "../middlewares/auth";

import PrismaUtils from "../utils/prisma.utils";
import httpStatus from "../utils/httpStatus";
import auditService from "./audit.service";
import SaleService from "./sale.service";
import ApiError from "../utils/apiError";
import prisma from "../prisma/prisma";

export default class UserRoleService {
    private readonly context: RequestContext;
    private readonly userRoleIncludes = { user: { omit: { password: true } } };
    public static readonly notComercialRoles: Role[] = [Role.ADMIN, Role.COMMISSIONING_ANALYST];
    public static readonly comercialRoles: Role[] = COMERCIAL_ROLES;

    constructor(context: RequestContext) {
        this.context = context;
    }

    public findManyBy = async (query: FindQueryProps<UserRoleWhere, UserRoleSortBy>) => {
        const { bloqueado, lte_updatedAt, gte_updatedAt, ...restWhere } = query.where ?? {};
        return await prisma.userRole.findMany({
            where: {
                ...restWhere,
                bloqueado: bloqueado === "true" ? true : bloqueado === "false" ? false : undefined,
                updatedAt: { lte: lte_updatedAt, gte: gte_updatedAt },
                empresaId: this.context.currentUserRole.empresaId,
                ativo: true,
                user: { ativo: true },
            },
            include: this.userRoleIncludes,
            ...PrismaUtils.extractSortPageInfoFrom(query, "role", "asc"),
        });
    };

    public getOneBy = async (userRoleId: string) => {
        return await prisma.userRole.findUnique({
            where: { id: userRoleId, empresaId: this.context.currentUserRole.empresaId },
            include: this.userRoleIncludes,
        });
    };

    public validateUserRoles = async (userRoleIds: string[], role: Role) => {
        const uniqueUserRoleIds = [...new Set(userRoleIds)];

        const userRoles = await prisma.userRole.findMany({
            where: { id: { in: uniqueUserRoleIds }, role, empresaId: this.context.currentUserRole.empresaId },
        });

        if (userRoles.length !== uniqueUserRoleIds.length)
            throw new ApiError(httpStatus.NOT_FOUND, "Algumas das roles não foram encontradas.");
    };

    public validateComercialRoles = async (userRoleIds: string[]) => {
        const uniqueUserRoleIds = [...new Set(userRoleIds)];

        const userRoles = await prisma.userRole.findMany({
            where: {
                id: { in: uniqueUserRoleIds },
                role: { in: UserRoleService.comercialRoles },
                empresaId: this.context.currentUserRole.empresaId,
            },
        });
        if (userRoles.length !== uniqueUserRoleIds.length)
            throw new ApiError(httpStatus.NOT_FOUND, "Algumas das roles não foram encontradas.");
    };

    public findManyWithSalesAndVisits = async (props: FindManyWithSalesAndVisitsProps) => {
        const { gte_dataVenda, lte_dataVenda, gte_invoiceDate, lte_invoiceDate, ...rest } = props;

        const where = {
            ...SaleService.getUserRoleSaleWhere(rest),
            estadoVenda: rest.estadoVenda,
            dataVenda: { gte: gte_dataVenda, lte: lte_dataVenda },
            notasVenda: {
                some: {
                    datasBoleto: { some: { data: { gte: gte_invoiceDate, lte: lte_invoiceDate } } },
                },
            },
        };

        const include = {
            notasVenda: { include: { vendasServico: true, vendasProduto: true, comissoes: true, datasBoleto: true } },
        };

        return await prisma.userRole.findMany({
            where: {
                role: rest.role,
                empresaId: this.context.currentUserRole.empresaId,
                ativo: true,
                user: { ativo: true },
            },
            include: {
                user: { select: { name: true, id: true, email: true } },
                accountManagerSales: { where, include },
                comercialManagerSales: { where, include },
                comercialAssistantSales: { where, include },
                solutionArchitectSales: { where, include },
                referrerSales: { where, include },
                visitas: { where: { dataVisita: { gte: rest.gte_dataVisita, lte: rest.lte_dataVisita } } },
            },
        });
    };

    public async deactivateUserRolesAndCommissions() {
        const empresaId = this.context.currentUserRole.empresaId;

        const inactiveUserRoles = await prisma.userRole.findMany({
            where: { empresaId, user: { ativo: false }, ativo: true },
            select: { id: true, userId: true },
        });

        if (inactiveUserRoles.length === 0) return { updatedUserRoles: 0, updatedCommissions: 0, skippedUsersCount: 0 };

        const userRoleIds = inactiveUserRoles.map((r) => r.id);
        const userRoleIdToUserId = Object.fromEntries(inactiveUserRoles.map((r) => [r.id, r.userId]));

        const vendasPagas = await prisma.venda.findMany({
            where: {
                empresaId,
                estadoVenda: EstadoVenda.PAID,
                OR: [
                    { accountManagerId: { in: userRoleIds } },
                    { insideSalesId: { in: userRoleIds } },
                    { comercialAssistantId: { in: userRoleIds } },
                    { comercialManagerId: { in: userRoleIds } },
                    { solutionArchitectId: { in: userRoleIds } },
                    { referrerId: { in: userRoleIds } },
                ],
            },
            select: {
                accountManagerId: true,
                insideSalesId: true,
                comercialAssistantId: true,
                comercialManagerId: true,
                solutionArchitectId: true,
                referrerId: true,
            },
        });

        const userIdsWithPaidSales = new Set<string>();
        vendasPagas.forEach((sale) => {
            [
                sale.accountManagerId,
                sale.insideSalesId,
                sale.comercialAssistantId,
                sale.comercialManagerId,
                sale.solutionArchitectId,
                sale.referrerId,
            ]
                .filter(Boolean)
                .forEach((urId) => {
                    const userId = userRoleIdToUserId[urId as string];
                    if (userId) userIdsWithPaidSales.add(userId);
                });
        });

        const userRolesToDeactivate = inactiveUserRoles.filter((r) => !userIdsWithPaidSales.has(r.userId));
        const userRoleIdsToDeactivate = userRolesToDeactivate.map((r) => r.id);

        const skippedUsersCount = new Set(
            inactiveUserRoles.filter((r) => userIdsWithPaidSales.has(r.userId)).map((r) => r.userId)
        ).size;

        const updatedUserRoles =
            userRoleIdsToDeactivate.length > 0
                ? await this.deactivateUserRoles(userRoleIdsToDeactivate, empresaId)
                : { count: 0 };

        const updatedCommissions =
            userRoleIdsToDeactivate.length > 0
                ? await this.deactivateUserRolesCommissions(userRoleIdsToDeactivate)
                : { count: 0 };

        return {
            updatedUserRoles: updatedUserRoles.count,
            updatedCommissions: updatedCommissions.count,
            skippedUsersCount,
        };
    }

    private async deactivateUserRoles(
        userRoleIdsToDeactivate: string[],
        empresaId: string
    ): Promise<{ count: number }> {
        const _deact = prisma.userRole.updateMany({
            where: { id: { in: userRoleIdsToDeactivate }, empresaId },
            data: { ativo: false },
        });

        const _audit = auditService.createAudit({
            action: Acao.DELETE,
            table: Tabela.PAPEL_USUARIO,
            data: userRoleIdsToDeactivate.map((id) => ({ id })),
            context: this.context,
        });

        const [deactivated] = await prisma.$transaction([_deact, _audit]);
        return deactivated;
    }

    private async deactivateUserRolesCommissions(userRoleIdsToDeactivate: string[]): Promise<{ count: number }> {
        const _deact = prisma.comissao.updateMany({
            where: {
                userRoleId: { in: userRoleIdsToDeactivate },
                venda: { estadoVenda: { not: EstadoVenda.PAID } },
            },
            data: { ativo: false },
        });

        const _audit = auditService.createAudit({
            action: Acao.DELETE,
            table: Tabela.COMISSAO,
            data: userRoleIdsToDeactivate.map((id) => ({ id })),
            context: this.context,
        });

        const [deactivated] = await prisma.$transaction([_deact, _audit]);
        return deactivated;
    }
}
