import { organizationA, organizationB } from "./organization";
import { Role, UserRole } from "@prisma/client";
import {
    admin,
    comercialAssistant,
    comercialManager,
    commissioningAnalyst,
    financialManagerUser,
    monitor,
    referrer,
    salePersonA,
    salePersonB,
    solutionArchitect,
    superUser,
} from "./user";

export type NewUserRoleWithOrgIdSeed = Pick<UserRole, "role" | "empresaId" | "userId"> & { id: string };

export const monitorRole: NewUserRoleWithOrgIdSeed = {
    id: "monitorRole",
    userId: monitor.id,
    empresaId: organizationA.id,
    role: Role.MONITOR,
};

export const adminRole: NewUserRoleWithOrgIdSeed = {
    id: "adminRole",
    userId: admin.id,
    empresaId: organizationA.id,
    role: Role.ADMIN,
};

export const adminRoleB: NewUserRoleWithOrgIdSeed = {
    id: "adminRoleB",
    userId: admin.id,
    empresaId: organizationB.id,
    role: Role.ADMIN,
};

export const commissioningAnalystRole: NewUserRoleWithOrgIdSeed = {
    id: "commissioningAnalistRole",
    userId: commissioningAnalyst.id,
    empresaId: organizationA.id,
    role: Role.COMMISSIONING_ANALYST,
};

export const solutionArchitectRole: NewUserRoleWithOrgIdSeed = {
    id: "solutionArchitectRole",
    userId: solutionArchitect.id,
    empresaId: organizationA.id,
    role: Role.SOLUTION_ARCHITECT,
};

export const comercialAssistantRole: NewUserRoleWithOrgIdSeed = {
    id: "comercialAssistantRole",
    userId: comercialAssistant.id,
    empresaId: organizationA.id,
    role: Role.COMERCIAL_ASSISTANT,
};

export const comercialManagerRole: NewUserRoleWithOrgIdSeed = {
    id: "comercialManagerRole",
    userId: comercialManager.id,
    empresaId: organizationA.id,
    role: Role.COMERCIAL_MANAGER,
};

export const referrerRole: NewUserRoleWithOrgIdSeed = {
    id: "referrerRole",
    userId: referrer.id,
    empresaId: organizationA.id,
    role: Role.REFERRER,
};

export const salePersonRoleA: NewUserRoleWithOrgIdSeed = {
    id: "salePersonRoleA",
    userId: salePersonA.id,
    empresaId: organizationA.id,
    role: Role.VENDEDOR,
};

export const salePersonRoleB: NewUserRoleWithOrgIdSeed = {
    id: "salePersonRoleB",
    userId: salePersonB.id,
    empresaId: organizationA.id,
    role: Role.VENDEDOR,
};

export const superUserAdminRole: NewUserRoleWithOrgIdSeed = {
    id: "superUserAdminRole",
    userId: superUser.id,
    empresaId: organizationA.id,
    role: Role.ADMIN,
};

export const superUserCommissioningAnalystRole: NewUserRoleWithOrgIdSeed = {
    id: "superUserCommissioningAnalistRole",
    userId: superUser.id,
    empresaId: organizationA.id,
    role: Role.COMMISSIONING_ANALYST,
};

export const superUserSolutionArchitectRole: NewUserRoleWithOrgIdSeed = {
    id: "superUserSolutionArchitectRole",
    userId: superUser.id,
    empresaId: organizationA.id,
    role: Role.SOLUTION_ARCHITECT,
};

export const superUserComercialAssistantRole: NewUserRoleWithOrgIdSeed = {
    id: "superUserComercialAssistantRole",
    userId: superUser.id,
    empresaId: organizationA.id,
    role: Role.COMERCIAL_ASSISTANT,
};

export const superUserComercialManagerRole: NewUserRoleWithOrgIdSeed = {
    id: "superUserComercialManagerRole",
    userId: superUser.id,
    empresaId: organizationA.id,
    role: Role.COMERCIAL_MANAGER,
};

export const superUserSalePersonRole: NewUserRoleWithOrgIdSeed = {
    id: "superUserSalePersonRole",
    userId: superUser.id,
    empresaId: organizationA.id,
    role: Role.VENDEDOR,
};

export const superUserReferrerRole: NewUserRoleWithOrgIdSeed = {
    id: "superUserReferrerRole",
    userId: superUser.id,
    empresaId: organizationA.id,
    role: Role.REFERRER,
};

export const superUserMonitorRole: NewUserRoleWithOrgIdSeed = {
    id: "superUserMonitorRole",
    userId: superUser.id,
    empresaId: organizationA.id,
    role: Role.MONITOR,
};

export const canBeDeletedRole: NewUserRoleWithOrgIdSeed = {
    id: "canBeDeletedRole",
    userId: salePersonA.id,
    empresaId: organizationA.id,
    role: Role.SOLUTION_ARCHITECT,
};

export const financialManagerUserRole: NewUserRoleWithOrgIdSeed = {
    id: "financialManagerUserRole",
    userId: financialManagerUser.id,
    empresaId: organizationA.id,
    role: Role.FINANCIAL_MANAGER,
};