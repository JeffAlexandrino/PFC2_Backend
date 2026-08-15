import SeedSupport from "../../support/seed.support";

import { superUserAdminRole, superUserComercialAssistantRole } from "../../../prisma/seeds/models/user-role";
import { admin, DEFAULT_PASSWORD, deletedUser, userWihoutRoles } from "../../../prisma/seeds/models/user";
import { Role } from "@prisma/client";

export const loginCases: {
    email: string;
    password: string;
    expected: { amountRoles?: number; status: number; allowed: boolean };
}[] = [
    { email: admin.email, password: DEFAULT_PASSWORD, expected: { status: 200, allowed: true, amountRoles: 2 } },
    { email: deletedUser.email, password: DEFAULT_PASSWORD, expected: { status: 401, allowed: false } },
    { email: userWihoutRoles.email, password: DEFAULT_PASSWORD, expected: { status: 401, allowed: false } },
];

export const changePassRoleCases: { newPassword: string; role: Role; userEmail: string; expectedStatus: number }[] =
    Object.values(Role).map((role) => ({
        role,
        newPassword: "123321",
        expectedStatus: 204,
        userEmail: SeedSupport.getUserWithUniqueRoleBy(role).email,
    }));

export const superUserChangeCurrentRoleCases: {
    currentRole: Role;
    newRoleId: string;
    expected: { status: number; allowed: boolean };
}[] = Object.values(Role).map((role) => ({
    expected: { status: 200, allowed: true },
    currentRole: role,
    newRoleId: role !== Role.ADMIN ? superUserComercialAssistantRole.id : superUserAdminRole.id,
}));
