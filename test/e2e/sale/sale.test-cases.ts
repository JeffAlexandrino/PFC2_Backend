import {
    comercialAssistantRole,
    comercialManagerRole,
    referrerRole,
    salePersonRoleA,
    solutionArchitectRole,
} from "../../../prisma/seeds/models/user-role";
import {
    rolesThatCanManageAllSalesInAnyStatus,
    rolesThatCanReadAllSales,
} from "../../support/role-permissions.support";
import { COMERCIAL_ROLES } from "../../../src/types/user-role.types";
import { Case, CaseWithPossibilities } from "../../test.types";
import { EstadoVenda, Role } from "@prisma/client";

import SeedSupport from "../../support/seed.support";

type permissionCreateAnyCases = {
    role: Role;
    possibilities: { userRoleId: string; expected: { status: 200 | 400; allowed: boolean } }[];
};

export default class SaleTestCases {
    public static createAnyCases: Case[] = Object.values(Role).map((role) => ({
        role,
        expected: {
            status: rolesThatCanManageAllSalesInAnyStatus.includes(role) ? 201 : 403,
            allowed: rolesThatCanManageAllSalesInAnyStatus.includes(role),
        },
    }));

    public static updateAnyCases: Case[] = Object.values(Role).map((role) => ({
        role,
        expected: {
            status: rolesThatCanManageAllSalesInAnyStatus.includes(role) ? 200 : 403,
            allowed: rolesThatCanManageAllSalesInAnyStatus.includes(role),
        },
    }));

    public static updateByStatusAndUserRoleCases: Case[] = Object.values(Role).map((role) => ({
        role,
        status: EstadoVenda.INITIAL,
        accountManagerId: salePersonRoleA.id,
        expected: {
            status:
                rolesThatCanManageAllSalesInAnyStatus.includes(role) ||
                role === Role.VENDEDOR ||
                role === Role.COMMISSIONING_ANALYST
                    ? 200
                    : 403,
            allowed:
                rolesThatCanManageAllSalesInAnyStatus.includes(role) ||
                role === Role.VENDEDOR ||
                role === Role.COMMISSIONING_ANALYST,
        },
    }));

    public static deleteAnyCases: Case[] = Object.values(Role).map((role) => ({
        role,
        expected: {
            status: rolesThatCanManageAllSalesInAnyStatus.includes(role) ? 204 : 403,
            allowed: rolesThatCanManageAllSalesInAnyStatus.includes(role),
        },
    }));

    public static deleteByStatusAndUserRoleCases: Case[] = Object.values(Role).map((role) => ({
        role,
        status: EstadoVenda.INITIAL,
        accountManagerId: salePersonRoleA.id,
        expected: {
            status:
                rolesThatCanManageAllSalesInAnyStatus.includes(role) ||
                role === Role.VENDEDOR ||
                role === Role.COMMISSIONING_ANALYST
                    ? 204
                    : 403,
            allowed:
                rolesThatCanManageAllSalesInAnyStatus.includes(role) ||
                role === Role.VENDEDOR ||
                role === Role.COMMISSIONING_ANALYST,
        },
    }));

    public static createWithStatusAndUserRoleCases: Case[] = Object.values(Role).map((role) => ({
        role,
        status: EstadoVenda.INITIAL,
        accountManagerId: salePersonRoleA.id,
        expected: {
            status:
                rolesThatCanManageAllSalesInAnyStatus.includes(role) ||
                role === Role.VENDEDOR ||
                role === Role.COMMISSIONING_ANALYST
                    ? 201
                    : 403,
            allowed:
                rolesThatCanManageAllSalesInAnyStatus.includes(role) ||
                role === Role.VENDEDOR ||
                role === Role.COMMISSIONING_ANALYST,
        },
    }));

    public static participantsSalesCases: Case[] = [
        { participant: {}, expected: { status: 400, allowed: false } },
        { participant: { insideSalesId: salePersonRoleA.id }, expected: { status: 400, allowed: false } },
        { participant: { comercialAssistantId: comercialAssistantRole.id }, expected: { status: 400, allowed: false } },
        { participant: { solutionArchitectId: solutionArchitectRole.id }, expected: { status: 400, allowed: false } },
        { participant: { referrerId: referrerRole.id }, expected: { status: 400, allowed: false } },
        { participant: { accountManagerId: salePersonRoleA.id }, expected: { status: 201, allowed: true } },
        { participant: { comercialManagerId: comercialManagerRole.id }, expected: { status: 201, allowed: true } },
    ];

    public static readAnyCases: Case[] = Object.values(Role).map((role) => ({
        role,
        expected: {
            status: rolesThatCanReadAllSales.includes(role) ? 200 : 403,
            allowed: rolesThatCanReadAllSales.includes(role),
        },
    }));

    public static readByUserRoleCases: CaseWithPossibilities[] = Object.values(Role).map((role) => ({
        role,
        possibilities: COMERCIAL_ROLES.map((comercialRole) => ({
            salePersonId:
                comercialRole === Role.VENDEDOR
                    ? SeedSupport.getRoleIdFromUserWithUniqueRoleBy(comercialRole)
                    : undefined,
            referrerId:
                comercialRole === Role.REFERRER
                    ? SeedSupport.getRoleIdFromUserWithUniqueRoleBy(comercialRole)
                    : undefined,
            solutionArchitectId:
                comercialRole === Role.SOLUTION_ARCHITECT
                    ? SeedSupport.getRoleIdFromUserWithUniqueRoleBy(comercialRole)
                    : undefined,
            comercialManagerId:
                comercialRole === Role.COMERCIAL_MANAGER
                    ? SeedSupport.getRoleIdFromUserWithUniqueRoleBy(comercialRole)
                    : undefined,
            comercialAssistantId:
                comercialRole === Role.COMERCIAL_ASSISTANT
                    ? SeedSupport.getRoleIdFromUserWithUniqueRoleBy(comercialRole)
                    : undefined,
            expected: {
                status: comercialRole === role || rolesThatCanReadAllSales.includes(role) ? 200 : 403,
                allowed: comercialRole === role || rolesThatCanReadAllSales.includes(role),
            },
        })),
    }));
}
