import AuthSupport from "../../support/auth.support";
import server from "../../../src/server";
import request from "supertest";
import "jest-extended";

import { deleteSeedsFromDB, setSeedsInDB } from "../../../prisma/seeds/scripts";
import { ApiTestRoutes } from "../../support/api-test-routes";
import { auditByTablePermissions } from "./audit.test-cases";

describe("Gerenciando auditoria", () => {
    const expectToBeInAudit = {
        id: expect.toBeString(),
        dadoId: expect.toBeString(),
        dado: expect.toBeObject(),
        acao: expect.toBeOneOf(["CREATE", "UPDATE", "DELETE"]),
        tabela: expect.toBeString(),
        data: expect.toBeDateString(),
        userId: expect.toBeString(),
        usuario: expect.objectContaining({
            ativo: expect.toBeBoolean(),
            bloqueado: expect.toBeBoolean(),
            email: expect.toBeString(),
            id: expect.toBeString(),
            name: expect.toBeString(),
            createdAt: expect.toBeDateString(),
            updatedAt: expect.toBeDateString(),
        }),
        empresaId: expect.toBeString(),
    };

    beforeEach(async () => {
        await setSeedsInDB();
    });

    afterEach(async () => {
        await deleteSeedsFromDB();
    });

    auditByTablePermissions.forEach(({ table, permissions }) =>
        permissions.forEach(({ role, expectedStatus, isAllowed }) => {
            it(`Deveria receber status ${expectedStatus} ao auditar a tabela ${table} como ${role}`, async () => {
                const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

                const res = await request(server)
                    .get(ApiTestRoutes.AUDIT_ROUTE)
                    .set("Authorization", `Bearer ${auth.access.token}`)
                    .query({ sortBy: "data", limit: 10, sortType: "asc", where: { tabela: table } })
                    .expect(expectedStatus);

                if (!isAllowed) return;

                for (let auditoria of res.body) {
                    expect(auditoria).toStrictEqual(expectToBeInAudit);
                }
            });
        })
    );
});
