import SeedSupport from "../../support/seed.support";

import { rolesThatCanReadAnyUserRole } from "../../support/role-permissions.support";
import { COMERCIAL_ROLES } from "../../../src/types/user-role.types";
import { Role } from "@prisma/client";

type PermissionReadAny = { role: Role; expected: { status: 200 | 403; allowed: boolean } };
type PermissionReadByRole = {
    role: Role;
    possibilities: { searchedRole: Role; expected: { status: 200 | 403; allowed: boolean } }[];
};
type PermissionReadByUserRoleId = {
    role: Role;
    possibilities: { userRoleId: string; expected: { status: 200 | 403; allowed: boolean } }[];
};

export default class UserRoleTestCases {
    public static permissionsReadAny: PermissionReadAny[] = Object.values(Role).map((role) => ({
        role,
        expected: {
            status: rolesThatCanReadAnyUserRole.includes(role) ? 200 : 403,
            allowed: rolesThatCanReadAnyUserRole.includes(role),
        },
    }));

    public static permissionsReadByRole: PermissionReadByRole[] = Object.values(Role).map((role) => ({
        role,
        possibilities: Object.values(Role).map((searchedRole) => ({
            searchedRole,
            expected: {
                status:
                    rolesThatCanReadAnyUserRole.includes(role) || COMERCIAL_ROLES.includes(searchedRole as any)
                        ? 200
                        : 403,
                allowed: rolesThatCanReadAnyUserRole.includes(role) || COMERCIAL_ROLES.includes(searchedRole as any),
            },
        })),
    }));

    public static permissionsReadByUserRoleId: PermissionReadByUserRoleId[] = Object.values(Role).map((role) => ({
        role,
        possibilities: Object.values(Role).map((searchedRole) => ({
            userRoleId: SeedSupport.getRoleIdFromUserWithUniqueRoleBy(searchedRole),
            expected: {
                status: rolesThatCanReadAnyUserRole.includes(role) || role === searchedRole ? 200 : 403,
                allowed: rolesThatCanReadAnyUserRole.includes(role) || role === searchedRole,
            },
        })),
    }));
}
