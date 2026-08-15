import {
    commissioningAnalyst,
    financialManagerUser,
    monitor,
    referrer,
    salePersonA,
    solutionArchitect,
} from "../../prisma/seeds/models/user";
import {
    adminRole,
    comercialAssistantRole,
    comercialManagerRole,
    salePersonRoleA,
    solutionArchitectRole,
    commissioningAnalystRole,
    referrerRole,
    monitorRole,
    financialManagerUserRole,
} from "../../prisma/seeds/models/user-role";
import { architectTarget, assistantTarget, managerTarget } from "../../prisma/seeds/models/target";
import { admin, comercialAssistant, comercialManager } from "../../prisma/seeds/models/user";
import { referrerTarget, targetA } from "../../prisma/seeds/models/target";
import { ComercialRole } from "../../src/types/user-role.types";
import { Role } from "@prisma/client";

export default class SeedSupport {
    public static getTargetIdFromComercialRole(comercialRole: ComercialRole): string {
        switch (comercialRole) {
            case "COMERCIAL_MANAGER":
                return managerTarget.id;
            case "COMERCIAL_ASSISTANT":
                return assistantTarget.id;
            case "SOLUTION_ARCHITECT":
                return architectTarget.id;
            case "VENDEDOR":
                return targetA.id;
            case "REFERRER":
                return referrerTarget.id;
        }
    }

    public static getRoleIdFromUserWithUniqueRoleBy(role: Role): string {
        switch (role) {
            case "COMERCIAL_MANAGER":
                return comercialManagerRole.id;
            case "COMERCIAL_ASSISTANT":
                return comercialAssistantRole.id;
            case "SOLUTION_ARCHITECT":
                return solutionArchitectRole.id;
            case "VENDEDOR":
                return salePersonRoleA.id;
            case "ADMIN":
                return adminRole.id;
            case "COMMISSIONING_ANALYST":
                return commissioningAnalystRole.id;
            case "REFERRER":
                return referrerRole.id;
            case "MONITOR":
                return monitorRole.id;
            case "FINANCIAL_MANAGER":
                return financialManagerUserRole.id;
        }
    }

    public static getIdFromUserWithUniqueComercialRoleBy(comercialRole: ComercialRole): string {
        switch (comercialRole) {
            case "COMERCIAL_MANAGER":
                return comercialManager.id;
            case "COMERCIAL_ASSISTANT":
                return comercialAssistant.id;
            case "SOLUTION_ARCHITECT":
                return solutionArchitect.id;
            case "VENDEDOR":
                return salePersonA.id;
            case "REFERRER":
                return referrer.id;
        }
    }

    public static getUserWithUniqueRoleBy(role: Role) {
        switch (role) {
            case "ADMIN":
                return { ...admin, roles: [Role.ADMIN] };
            case "COMMISSIONING_ANALYST":
                return { ...commissioningAnalyst, roles: [Role.COMMISSIONING_ANALYST] };
            case "COMERCIAL_MANAGER":
                return { ...comercialManager, roles: [Role.COMERCIAL_MANAGER] };
            case "COMERCIAL_ASSISTANT":
                return { ...comercialAssistant, roles: [Role.COMERCIAL_ASSISTANT] };
            case "SOLUTION_ARCHITECT":
                return { ...solutionArchitect, roles: [Role.SOLUTION_ARCHITECT] };
            case "VENDEDOR":
                return { ...salePersonA, roles: [Role.VENDEDOR, Role.SOLUTION_ARCHITECT] };
            case "REFERRER":
                return { ...referrer, roles: [Role.REFERRER] };
            case "MONITOR":
                return { ...monitor, roles: [Role.MONITOR] };
            case "FINANCIAL_MANAGER":
                return { ...financialManagerUser, roles: [Role.FINANCIAL_MANAGER] };
        }
    }
}
