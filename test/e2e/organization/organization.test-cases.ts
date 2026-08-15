import { Role } from "@prisma/client";

type PermissionUpdate = { role: Role; expected: { status: 200 | 403; allowed: boolean } };

export default class OrganizationTestCases {
    public static permissionsUpdate: PermissionUpdate[] = Object.values(Role).map((role) => ({
        role,
        expected: { status: role === Role.ADMIN ? 200 : 403, allowed: role === Role.ADMIN },
    }));
}
