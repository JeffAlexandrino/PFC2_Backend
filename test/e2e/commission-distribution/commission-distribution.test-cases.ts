import SeedSupport from "../../support/seed.support";

import { COMERCIAL_ROLES, ComercialRole } from "../../../src/types/user-role.types";
import {
    rolesThatCanManageAllComDist,
    rolesThatCanUpdateorCreateAllComDist,
    rolesThatCanViewAllComDist,
} from "../../support/role-permissions.support";
import { Role } from "@prisma/client";

type CreateDistributionsPerRole = { role: Role; expected: { status: number; allowed: boolean } };
type FindAllDistributionsPerRole = { role: Role; expected: { status: number; allowed: boolean } };
type FindDistributionsFilteredByUserRoleIdPerRole = {
    role: Role;
    distributions: {
        distRole: ComercialRole;
        includedUserRoleId: string;
        expectedStatus: number;
    }[];
};
type GetOneDistributionPerRole = { role: Role; expected: { status: number; allowed: boolean } };
type UpdateDistributionsPerRole = { role: Role; expected: { status: number; allowed: boolean } };
type DeleteDistributionPerRole = { role: Role; expected: { status: number } };

export default class DistributionCases {
    public static createPerRole: CreateDistributionsPerRole[] = Object.values(Role).map((role) => ({
        role,
        expected: {
            status: rolesThatCanUpdateorCreateAllComDist.includes(role) ? 201 : 403,
            allowed: rolesThatCanUpdateorCreateAllComDist.includes(role),
        },
    }));

    public static findAllPerRole: FindAllDistributionsPerRole[] = Object.values(Role).map((role) => ({
        role,
        expected: {
            status: rolesThatCanViewAllComDist.includes(role) ? 200 : 403,
            allowed: rolesThatCanViewAllComDist.includes(role),
        },
    }));

    public static findFilteredByUserRoleIdPerRole: FindDistributionsFilteredByUserRoleIdPerRole[] = Object.values(
        Role
    ).map((role) => ({
        role,
        distributions: COMERCIAL_ROLES.map((comercialRole) => ({
            expectedStatus: rolesThatCanViewAllComDist.includes(role) || role === comercialRole ? 200 : 403,
            includedUserRoleId: SeedSupport.getRoleIdFromUserWithUniqueRoleBy(comercialRole),
            distRole: comercialRole,
        })),
    }));

    public static getOnePerRole: GetOneDistributionPerRole[] = Object.values(Role).map((role) => ({
        role,
        expected: {
            status: rolesThatCanViewAllComDist.includes(role) ? 200 : 403,
            allowed: rolesThatCanViewAllComDist.includes(role),
        },
    }));

    public static updatePerRole: UpdateDistributionsPerRole[] = Object.values(Role).map((role) => ({
        role,
        expected: {
            status: rolesThatCanUpdateorCreateAllComDist.includes(role) ? 200 : 403,
            allowed: rolesThatCanUpdateorCreateAllComDist.includes(role),
        },
    }));

    public static deletePerRole: DeleteDistributionPerRole[] = Object.values(Role).map((role) => ({
        role,
        expected: { status: rolesThatCanManageAllComDist.includes(role) ? 204 : 403 },
    }));
}
