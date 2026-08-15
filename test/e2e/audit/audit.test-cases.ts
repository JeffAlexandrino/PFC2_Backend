import { HIGH_ACCESS_ROLES } from "../../support/role-permissions.support";
import { Role, Tabela } from "@prisma/client";

export const auditByTablePermissions: {
    table: Tabela;
    permissions: { role: Role; expectedStatus: number; isAllowed: boolean }[];
}[] = [
    {
        table: Tabela.COMISSAO,
        permissions: HIGH_ACCESS_ROLES.map((role) => ({ role, expectedStatus: 200, isAllowed: true })),
    },
    {
        table: Tabela.CLIENTE,
        permissions: HIGH_ACCESS_ROLES.map((role) => ({ role, expectedStatus: 200, isAllowed: true })),
    },
    {
        table: Tabela.USUARIO,
        permissions: Object.values(Role).map((role) => ({
            role,
            expectedStatus: HIGH_ACCESS_ROLES.includes(role) ? 200 : 403,
            isAllowed: HIGH_ACCESS_ROLES.includes(role),
        })),
    },
    {
        table: Tabela.FORNECEDOR,
        permissions: HIGH_ACCESS_ROLES.map((role) => ({ role, expectedStatus: 200, isAllowed: true })),
    },
    {
        table: Tabela.PRODUTO,
        permissions: HIGH_ACCESS_ROLES.map((role) => ({ role, expectedStatus: 200, isAllowed: true })),
    },
    {
        table: Tabela.SERVICO,
        permissions: HIGH_ACCESS_ROLES.map((role) => ({ role, expectedStatus: 200, isAllowed: true })),
    },
    {
        table: Tabela.VISITA,
        permissions: Object.values(Role).map((role) => ({
            role,
            expectedStatus: HIGH_ACCESS_ROLES.includes(role) ? 200 : 403,
            isAllowed: HIGH_ACCESS_ROLES.includes(role),
        })),
    },
    {
        table: Tabela.VENDA,
        permissions: HIGH_ACCESS_ROLES.map((role) => ({ role, expectedStatus: 200, isAllowed: true })),
    },
];
