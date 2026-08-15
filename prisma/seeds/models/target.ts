import { comercialAssistantRole, comercialManagerRole, referrerRole, salePersonRoleA } from "./user-role";
import { dataComAnoAtual, dataComAnoAnterior } from "../../../test/support/constant-test.support";
import { DataCreateTarget } from "../../../src/validations/target.validator";
import { salePersonRoleB, solutionArchitectRole } from "./user-role";

type TargetTypeSeed = DataCreateTarget & { id: string };

export const targetA: TargetTypeSeed = {
    id: "targetA",
    dataInicioMeta: dataComAnoAtual(5, 1),
    dataFimMeta: dataComAnoAtual(6, 30),
    tiposMeta: [{ tipoMeta: "VISITA", aceleratorTriggerValue: 10, commissionTriggerValue: 0 }],
    userRoleId: salePersonRoleA.id,
};

export const targetB: TargetTypeSeed = {
    id: "targetB",
    dataInicioMeta: dataComAnoAtual(4, 1),
    dataFimMeta: dataComAnoAtual(9, 30),
    tiposMeta: [{ tipoMeta: "FATURAMENTO", aceleratorTriggerValue: 50000, commissionTriggerValue: 0 }],
    userRoleId: salePersonRoleA.id,
};

export const targetC: TargetTypeSeed = {
    id: "targetC",
    dataInicioMeta: dataComAnoAtual(5, 1),
    dataFimMeta: dataComAnoAtual(6, 30),
    tiposMeta: [{ tipoMeta: "MARGEM", aceleratorTriggerValue: 1000000, commissionTriggerValue: 0 }],
    userRoleId: salePersonRoleA.id,
};

export const targetD: TargetTypeSeed = {
    id: "targetD",
    dataInicioMeta: dataComAnoAtual(5, 1),
    dataFimMeta: dataComAnoAtual(6, 30),
    tiposMeta: [{ tipoMeta: "MARGEM", aceleratorTriggerValue: 1000000, commissionTriggerValue: 0 }],
    userRoleId: salePersonRoleB.id,
};

export const targetE: TargetTypeSeed = {
    id: "targetE",
    dataInicioMeta: dataComAnoAtual(5, 1),
    dataFimMeta: dataComAnoAtual(6, 30),
    tiposMeta: [{ tipoMeta: "FATURAMENTO", aceleratorTriggerValue: 10000, commissionTriggerValue: 5000 }],
    userRoleId: salePersonRoleA.id,
};

export const targetF: TargetTypeSeed = {
    id: "targetF",
    dataInicioMeta: dataComAnoAtual(7, 1),
    dataFimMeta: dataComAnoAtual(7, 30),
    tiposMeta: [{ tipoMeta: "FATURAMENTO", aceleratorTriggerValue: 5000, commissionTriggerValue: 3000 }],
    userRoleId: salePersonRoleA.id,
};

export const managerTarget: DataCreateTarget & { id: string } = {
    id: "managerTarget",
    dataInicioMeta: dataComAnoAtual(5, 1),
    dataFimMeta: dataComAnoAtual(6, 30),
    tiposMeta: [{ tipoMeta: "FATURAMENTO", aceleratorTriggerValue: 50000, commissionTriggerValue: 0 }],
    userRoleId: comercialManagerRole.id,
};

export const referrerTarget: DataCreateTarget & { id: string } = {
    id: "referrerTarget",
    dataInicioMeta: dataComAnoAtual(5, 1),
    dataFimMeta: dataComAnoAtual(6, 30),
    tiposMeta: [{ tipoMeta: "FATURAMENTO", aceleratorTriggerValue: 50000, commissionTriggerValue: 0 }],
    userRoleId: referrerRole.id,
};

export const assistantTarget: DataCreateTarget & { id: string } = {
    id: "assistantTarget",
    dataInicioMeta: dataComAnoAnterior(5, 1),
    dataFimMeta: dataComAnoAnterior(5, 30),
    tiposMeta: [{ tipoMeta: "FATURAMENTO", aceleratorTriggerValue: 50000, commissionTriggerValue: 0 }],
    userRoleId: comercialAssistantRole.id,
};

export const architectTarget: DataCreateTarget & { id: string } = {
    id: "architectTarget",
    dataInicioMeta: dataComAnoAnterior(5, 1),
    dataFimMeta: dataComAnoAnterior(5, 30),
    tiposMeta: [{ tipoMeta: "FATURAMENTO", aceleratorTriggerValue: 50000, commissionTriggerValue: 0 }],
    userRoleId: solutionArchitectRole.id,
};
