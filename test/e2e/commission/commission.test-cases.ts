import SeedSupport from "../../support/seed.support";

import {
    rolesThatCanManageComissions,
    rolesThatCanCreateorUpdateComissions,
    rolesThatCanViewAllComissions,
} from "../../support/role-permissions.support";
import { COMERCIAL_ROLES, ComercialRole } from "../../../src/types/user-role.types";
import { Role } from "@prisma/client";

type FindCommissionsPerRole = { role: Role; expected: { status: number; allowed: boolean } };
type FindCommissionsByRolePerRole = {
    role: Role;
    commissions: { commissionRole: ComercialRole; expectedStatus: number; userId: string }[];
};
type PayCommissionsPerRole = { role: Role; expected: { status: number; allowed: boolean } };

export default class CommissionCases {
    public static permissionsReadAll: FindCommissionsPerRole[] = Object.values(Role).map((role) => ({
        role,
        expected: {
            status: rolesThatCanViewAllComissions.includes(role) ? 200 : 403,
            allowed: rolesThatCanViewAllComissions.includes(role),
        },
    }));

    public static permissionsReadByUserId: FindCommissionsByRolePerRole[] = Object.values(Role).map((role) => ({
        role,
        commissions: COMERCIAL_ROLES.map((comercialRole) => ({
            commissionRole: comercialRole,
            expectedStatus: rolesThatCanViewAllComissions.includes(role) || role === comercialRole ? 200 : 403,
            userId: SeedSupport.getIdFromUserWithUniqueComercialRoleBy(comercialRole),
        })),
    }));

    public static permissionsUpdateAll: PayCommissionsPerRole[] = Object.values(Role).map((role) => ({
        role,
        expected: {
            status: rolesThatCanCreateorUpdateComissions.includes(role) ? 204 : 403,
            allowed: rolesThatCanCreateorUpdateComissions.includes(role),
        },
    }));

    public static permissionsManageAll: PayCommissionsPerRole[] = Object.values(Role).map((role) => ({
        role,
        expected: {
            status: rolesThatCanManageComissions.includes(role) ? 204 : 403,
            allowed: rolesThatCanManageComissions.includes(role),
        },
    }));
}
