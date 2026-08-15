import { NewCommissionDistributionWithOrgId } from "../../../src/types/commission-distribution.types";
import { comercialAssistantRole, comercialManagerRole, referrerRole } from "./user-role";
import { salePersonRoleA, salePersonRoleB, solutionArchitectRole } from "./user-role";
import { organizationA } from "./organization";

export type CommissionDistributionTypeSeed = NewCommissionDistributionWithOrgId & { id: string };

export const commissionDistA: CommissionDistributionTypeSeed = {
    id: "commissionDistributionA",
    roleCommissions: [{ comissao: 5, acelerator: 5, userRoleId: salePersonRoleA.id }],
    empresaId: organizationA.id,
};

export const commissionDistB: CommissionDistributionTypeSeed = {
    id: "commissionDistributionB",
    roleCommissions: [{ comissao: 5, acelerator: 5, userRoleId: salePersonRoleB.id }],
    empresaId: organizationA.id,
};

export const commissionDistAB: CommissionDistributionTypeSeed = {
    id: "commissionDistributionAB",
    roleCommissions: [
        { comissao: 2.5, acelerator: 0, userRoleId: salePersonRoleA.id },
        { comissao: 2.5, acelerator: 0, userRoleId: salePersonRoleB.id },
    ],
    empresaId: organizationA.id,
};

export const commissionDistManager: CommissionDistributionTypeSeed = {
    id: "distComercialManager",
    roleCommissions: [{ comissao: 5, acelerator: 0, userRoleId: comercialManagerRole.id }],
    empresaId: organizationA.id,
};

export const commissionDistArchitect: CommissionDistributionTypeSeed = {
    id: "distSolutionArchitect",
    roleCommissions: [{ comissao: 1, acelerator: 0, userRoleId: solutionArchitectRole.id }],
    empresaId: organizationA.id,
};

export const commissionDistAssistant: CommissionDistributionTypeSeed = {
    id: "distComercialAssistant",
    roleCommissions: [{ comissao: 0.5, acelerator: 0, userRoleId: comercialAssistantRole.id }],
    empresaId: organizationA.id,
};

export const commissionDistReferrer: CommissionDistributionTypeSeed = {
    id: "distReferrer",
    roleCommissions: [{ comissao: 0.5, acelerator: 0, userRoleId: referrerRole.id }],
    empresaId: organizationA.id,
};
