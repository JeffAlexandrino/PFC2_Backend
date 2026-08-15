import {
    rolesThatCanManageVisit,
    rolesThatCanAddorUpdateVisitWithRestrictions,
    rolesThatCanAddorUpdateVisitWithoutRestrictions,
    rolesThatCanReadVisitWithoutRestrictions,
    rolesThatCanReadVisitWithRestrictions,
} from "../../support/role-permissions.support";
import { Role } from "@prisma/client";

type PermissionCreate = { role: Role; expected: { status: 201 | 403; allowed: boolean } };
type PermissionUpdate = { role: Role; expected: { status: 200 | 403; allowed: boolean } };
type PermissionDelete = { role: Role; expected: { status: 204 | 403; allowed: boolean } };

export default class VisitTestCases {
    public static permissionsReadWithoutRestrictions: PermissionUpdate[] = Object.values(Role).map((role) => ({
        role,
        expected: {
            status: rolesThatCanReadVisitWithoutRestrictions.includes(role) ? 200 : 403,
            allowed: rolesThatCanReadVisitWithoutRestrictions.includes(role),
        },
    }));
    public static permissionsCreateWithoutRestrictions: PermissionCreate[] = Object.values(Role).map((role) => ({
        role,
        expected: {
            status: rolesThatCanAddorUpdateVisitWithoutRestrictions.includes(role) ? 201 : 403,
            allowed: rolesThatCanAddorUpdateVisitWithoutRestrictions.includes(role),
        },
    }));
    public static permissionsUpdateWithoutRestrictions: PermissionUpdate[] = Object.values(Role).map((role) => ({
        role,
        expected: {
            status: rolesThatCanAddorUpdateVisitWithoutRestrictions.includes(role) ? 200 : 403,
            allowed: rolesThatCanAddorUpdateVisitWithoutRestrictions.includes(role),
        },
    }));
    public static permissionsDeleteWithoutRestrictions: PermissionDelete[] = Object.values(Role).map((role) => ({
        role,
        expected: {
            status: rolesThatCanManageVisit.includes(role) ? 204 : 403,
            allowed: rolesThatCanManageVisit.includes(role),
        },
    }));

    // Permissions for visits restricted by salePersonId
    public static permissionsReadRestrictedBySalePersonId: PermissionUpdate[] = Object.values(Role).map((role) => ({
        role,
        expected: {
            status: rolesThatCanReadVisitWithRestrictions.includes(role) ? 200 : 403,
            allowed: rolesThatCanReadVisitWithRestrictions.includes(role),
        },
    }));
    public static permissionsCreateRestrictedBySalePersonId: PermissionCreate[] = Object.values(Role).map((role) => ({
        role,
        expected: {
            status: rolesThatCanAddorUpdateVisitWithRestrictions.includes(role) ? 201 : 403,
            allowed: rolesThatCanAddorUpdateVisitWithRestrictions.includes(role),
        },
    }));
    public static permissionsUpdateRestrictedBySalePersonId: PermissionUpdate[] = Object.values(Role).map((role) => ({
        role,
        expected: {
            status: rolesThatCanAddorUpdateVisitWithRestrictions.includes(role) ? 200 : 403,
            allowed: rolesThatCanAddorUpdateVisitWithRestrictions.includes(role),
        },
    }));
    public static permissionsDeleteRestrictedBySalePersonId: PermissionDelete[] = Object.values(Role).map((role) => ({
        role,
        expected: {
            status: rolesThatCanManageVisit.includes(role) ? 204 : 403,
            allowed: rolesThatCanManageVisit.includes(role),
        },
    }));
}
