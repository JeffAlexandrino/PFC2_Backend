import SeedSupport from "../../support/seed.support";

import { rolesThatCanReadAllDash } from "../../support/role-permissions.support";
import { COMERCIAL_ROLES } from "../../../src/types/user-role.types";
import { Role } from "@prisma/client";

type PermissionReadAll = { role: Role; expected: { status: 200 | 403; allowed: boolean } };
type PermissionReadFilteringByComercialRoleId = {
    role: Role;
    filters: { comercialRoleId: string; comercialRole: Role; expected: { status: 200 | 403; allowed: boolean } }[];
};

export default class DashboardCases {
    public static permissionsReadAll: PermissionReadAll[] = Object.values(Role).map((role) => ({
        role,
        expected: {
            status: rolesThatCanReadAllDash.includes(role) ? 200 : 403,
            allowed: rolesThatCanReadAllDash.includes(role),
        },
    }));

    public static permissionsReadFilteringByComercialUserRoleId: PermissionReadFilteringByComercialRoleId[] =
        Object.values(Role).map((role) => ({
            role,
            filters: COMERCIAL_ROLES.map((comercialRole) => ({
                comercialRoleId: SeedSupport.getRoleIdFromUserWithUniqueRoleBy(comercialRole),
                comercialRole,
                expected: {
                    status: rolesThatCanReadAllDash.includes(role) || role === comercialRole ? 200 : 403,
                    allowed: rolesThatCanReadAllDash.includes(role) || role === comercialRole,
                },
            })),
        }));
}
