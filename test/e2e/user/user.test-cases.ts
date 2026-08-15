import { onlyComercialNotManagerRoles, rolesThatCanReadAnyUser } from "../../support/role-permissions.support";
import { Case, CaseWithPossibilities } from "../../test.types";
import { Role } from "@prisma/client";

import SeedSupport from "../../support/seed.support";

export default class UserTestCases {
    public static createAnyCases: Case[] = Object.values(Role).map((role) => ({
        role,
        expected: { status: Role.ADMIN === role ? 201 : 403, allowed: Role.ADMIN === role },
    }));

    public static createByUserRolesCases: CaseWithPossibilities[] = Object.values(Role).map((role) => ({
        role,
        possibilities: Object.values(Role).map((userRole) => ({
            userRole,
            expected: {
                status:
                    Role.ADMIN === role ||
                    (Role.COMERCIAL_MANAGER === role && onlyComercialNotManagerRoles.includes(userRole))
                        ? 201
                        : 403,
                allowed:
                    Role.ADMIN === role ||
                    (Role.COMERCIAL_MANAGER === role && onlyComercialNotManagerRoles.includes(userRole)),
            },
        })),
    }));

    public static updateAnyCases: Case[] = Object.values(Role).map((role) => ({
        role,
        expected: {
            status: Role.ADMIN === role ? 200 : 403,
            allowed: Role.ADMIN === role,
        },
    }));

    public static updateByUserRolesCases: CaseWithPossibilities[] = Object.values(Role).map((role) => ({
        role,
        possibilities: Object.values(Role).map((userRole) => ({
            userRole,
            expected: {
                status:
                    Role.ADMIN === role ||
                    (Role.COMERCIAL_MANAGER === role && onlyComercialNotManagerRoles.includes(userRole))
                        ? 200
                        : 403,
                allowed:
                    Role.ADMIN === role ||
                    (Role.COMERCIAL_MANAGER === role && onlyComercialNotManagerRoles.includes(userRole)),
            },
        })),
    }));

    public static deleteAnyCases: Case[] = Object.values(Role).map((role) => ({
        role,
        expected: { status: Role.ADMIN === role ? 204 : 403, allowed: Role.ADMIN === role },
    }));

    public static deleteByUserRolesCases: CaseWithPossibilities[] = Object.values(Role).map((role) => ({
        role,
        possibilities: Object.values(Role).map((userRole) => ({
            userRole,
            expected: {
                status:
                    Role.ADMIN === role ||
                    (Role.COMERCIAL_MANAGER === role && onlyComercialNotManagerRoles.includes(userRole))
                        ? 204
                        : 403,
                allowed:
                    Role.ADMIN === role ||
                    (Role.COMERCIAL_MANAGER === role && onlyComercialNotManagerRoles.includes(userRole as any)),
            },
        })),
    }));

    public static readAnyCases: Case[] = Object.values(Role).map((role) => ({
        role,
        expected: {
            status: 200,
            allowed: rolesThatCanReadAnyUser.includes(role),
        },
    }));

    public static readByUserIdCases: CaseWithPossibilities[] = Object.values(Role).map((role) => ({
        role,
        possibilities: Object.values(Role).map((restrictedRole) => ({
            userId: SeedSupport.getUserWithUniqueRoleBy(restrictedRole).id,
            expected: { status: 200, allowed: true },
        })),
    }));
}
