import UserRoleTestCases from "./user-role.test-cases";
import AuthSupport from "../../support/auth.support";
import server from "../../../src/server";
import request from "supertest";
import "jest-extended";

import { deleteSeedsFromDB, setSeedsInDB } from "../../../prisma/seeds/scripts";
import { ApiTestRoutes } from "../../support/api-test-routes";
import { Role } from "@prisma/client";

describe("Gerenciando User Roles", () => {
    const USER_ROLES_AMOUNT = 18;
    const SALE_PERSON_ROLES_AMOUNT = 3;

    const expectToBeInUserRoles = {
        ativo: expect.toBeBoolean(),
        bloqueado: expect.toBeBoolean(),
        createdAt: expect.toBeDateString(),
        empresaId: expect.toBeString(),
        id: expect.toBeString(),
        updatedAt: expect.toBeDateString(),
        role: expect.toBeString(),
        fixedCommission: expect.toBeBoolean(),
        userId: expect.toBeString(),
        user: {
            ativo: expect.toBeBoolean(),
            bloqueado: expect.toBeBoolean(),
            createdAt: expect.toBeDateString(),
            email: expect.toBeString(),
            id: expect.toBeString(),
            isEmailVerified: expect.toBeBoolean(),
            name: expect.toBeString(),
            updatedAt: expect.toBeDateString(),
        },
    };

    beforeEach(async () => {
        await setSeedsInDB();
    });

    afterEach(async () => {
        await deleteSeedsFromDB();
    });

    UserRoleTestCases.permissionsReadAny.forEach(({ role, expected }) =>
        it(`Deveria retornar ${expected.status} ao listar todas as roles como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            const res = await request(server)
                .get(ApiTestRoutes.USER_ROLES_ROUTE)
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(expected.status);

            if (!expected.allowed) return;

            expect(res.body.length).toBe(expected.allowed ? USER_ROLES_AMOUNT + 1 : USER_ROLES_AMOUNT);

            for (let userRole of res.body) {
                expect(userRole).toStrictEqual(expectToBeInUserRoles);
            }
        })
    );

    UserRoleTestCases.permissionsReadByRole.forEach(({ role, possibilities }) =>
        possibilities.forEach(({ searchedRole, expected }) =>
            it(`Deveria retornar ${expected.status} ao listar todas as roles de ${searchedRole} como ${role}`, async () => {
                const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

                const res = await request(server)
                    .get(ApiTestRoutes.USER_ROLES_ROUTE)
                    .set("Authorization", `Bearer ${auth.access.token}`)
                    .query({ where: { role: searchedRole } })
                    .expect(expected.status);

                if (!expected.allowed || searchedRole !== Role.VENDEDOR) return;

                expect(res.body.length).toBe(SALE_PERSON_ROLES_AMOUNT);

                for (let userRole of res.body) {
                    expect(userRole).toStrictEqual(expectToBeInUserRoles);
                }
            })
        )
    );

    UserRoleTestCases.permissionsReadByUserRoleId.forEach(({ role, possibilities }) =>
        possibilities.forEach(({ userRoleId, expected }) =>
            it(`Deveria retornar ${expected.status} ao buscar pelo userRoleId ${userRoleId} como ${role}`, async () => {
                const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

                const res = await request(server)
                    .get(ApiTestRoutes.FIND_USER_ROLE_ROUTE(userRoleId))
                    .set("Authorization", `Bearer ${auth.access.token}`)
                    .expect(expected.status);

                if (!expected.allowed) return;

                expect(res.body).toStrictEqual(expectToBeInUserRoles);
                expect(res.body.id).toBe(userRoleId);
            })
        )
    );

    it("Deveria retornar erro 404 ao buscar uma role pelo id inexistente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        await request(server)
            .get(ApiTestRoutes.FIND_USER_ROLE_ROUTE("fake_id"))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .expect(404);
    });
});
