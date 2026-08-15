import {
    rolesThatCanCreateOrUpdateAnyTargets,
    rolesThatCanCreateOrUpdateComercialTargets,
    rolesThatCanManageTargets,
    rolesThatCanReadComercialTargets,
    rolesThatCanReadTargetWithoutRestriction,
} from "../../support/role-permissions.support";
import { COMERCIAL_ROLES } from "../../../src/types/user-role.types";
import { Case, CaseWithPossibilities } from "../../test.types";
import { Role } from "@prisma/client";

import SeedSupport from "../../support/seed.support";

export default class TargetTestCases {
    public static createAnyCases: Case[] = Object.values(Role).map((role) => ({
        role,
        expected: {
            status: rolesThatCanManageTargets.includes(role) ? 201 : 403,
            allowed: rolesThatCanManageTargets.includes(role),
        },
    }));

    public static createByUserRoleCases: CaseWithPossibilities[] = Object.values(Role).map((role) => ({
        role,
        possibilities: COMERCIAL_ROLES.map((comercialRole) => ({
            comercialRole,
            expected: {
                status: rolesThatCanCreateOrUpdateComercialTargets.includes(role) && comercialRole !== role ? 201 : 403,
                allowed: rolesThatCanCreateOrUpdateComercialTargets.includes(role) && comercialRole !== role,
            },
        })),
    }));

    public static createOrUpdateNotComercialCases: Case[] = rolesThatCanCreateOrUpdateAnyTargets.map((role) => ({
        notComercialUserRoleId: SeedSupport.getRoleIdFromUserWithUniqueRoleBy(role),
        expected: { status: 404, allowed: false },
    }));

    public static updateAnyCases: Case[] = Object.values(Role).map((role) => ({
        role,
        expected: {
            status: rolesThatCanManageTargets.includes(role) ? 200 : 403,
            allowed: rolesThatCanManageTargets.includes(role),
        },
    }));

    public static updateByUserRoleCases: CaseWithPossibilities[] = Object.values(Role).map((role) => ({
        role,
        possibilities: COMERCIAL_ROLES.map((comercialRole) => ({
            comercialRole,
            expected: {
                status: rolesThatCanCreateOrUpdateComercialTargets.includes(role) && comercialRole !== role ? 200 : 403,
                allowed: rolesThatCanCreateOrUpdateComercialTargets.includes(role) && comercialRole !== role,
            },
        })),
    }));

    public static deleteAnyCases: Case[] = Object.values(Role).map((role) => ({
        role,
        expected: {
            status: rolesThatCanManageTargets.includes(role) ? 204 : 403,
            allowed: rolesThatCanManageTargets.includes(role),
        },
    }));

    public static deleteByUserRoleCases: CaseWithPossibilities[] = Object.values(Role).map((role) => ({
        role,
        possibilities: COMERCIAL_ROLES.map((comercialRole) => ({
            comercialRole,
            expected: {
                status: rolesThatCanCreateOrUpdateComercialTargets.includes(role) && comercialRole !== role ? 204 : 403,
                allowed: rolesThatCanCreateOrUpdateComercialTargets.includes(role) && comercialRole !== role,
            },
        })),
    }));

    public static readAnyCases: Case[] = Object.values(Role).map((role) => ({
        role,
        expected: {
            status: rolesThatCanReadTargetWithoutRestriction.includes(role) ? 200 : 403,
            allowed: rolesThatCanReadTargetWithoutRestriction.includes(role),
        },
    }));

    public static readByUserRoleIdAndRoleCases: CaseWithPossibilities[] = Object.values(Role).map((role) => ({
        role,
        possibilities: COMERCIAL_ROLES.map((comercialRole) => ({
            comercialRole,
            userRoleId: SeedSupport.getRoleIdFromUserWithUniqueRoleBy(comercialRole),
            expected: {
                status: rolesThatCanReadComercialTargets.includes(role) || role === comercialRole ? 200 : 403,
                allowed: rolesThatCanReadComercialTargets.includes(role) || role === comercialRole,
            },
        })),
    }));
}
