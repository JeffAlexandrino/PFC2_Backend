import { Role } from "@prisma/client";
import {
    rolesThatCanAddorUpdateContracts,
    rolesThatCanManageAllContracts,
    rolesThatCanReadAllContracts,
} from "../../support/role-permissions.support";

type PermissionCreate = { role: Role; expected: { status: 201 | 403; allowed: boolean } };
type PermissionReadOrUpdate = { role: Role; expected: { status: 200 | 403; allowed: boolean } };
type PermissionDelete = { role: Role; expected: { status: 204 | 403; allowed: boolean } };

export default class ContractCases {
    public static permissionsCreate: PermissionCreate[] = Object.values(Role).map((role) => ({
        role,
        expected: {
            status: rolesThatCanAddorUpdateContracts.includes(role) ? 201 : 403,
            allowed: rolesThatCanAddorUpdateContracts.includes(role),
        },
    }));

    public static permissionsRead: PermissionReadOrUpdate[] = Object.values(Role).map((role) => ({
        role,
        expected: {
            status: rolesThatCanReadAllContracts.includes(role) ? 200 : 403,
            allowed: rolesThatCanReadAllContracts.includes(role),
        },
    }));
    public static permissionsUpdate: PermissionReadOrUpdate[] = Object.values(Role).map((role) => ({
        role,
        expected: {
            status: rolesThatCanAddorUpdateContracts.includes(role) ? 200 : 403,
            allowed: rolesThatCanAddorUpdateContracts.includes(role),
        },
    }));

    public static permissionsDelete: PermissionDelete[] = Object.values(Role).map((role) => ({
        role,
        expected: {
            status: rolesThatCanManageAllContracts.includes(role) ? 204 : 403,
            allowed: rolesThatCanManageAllContracts.includes(role),
        },
    }));
}
