import OrganizationTestCases from "./organization.test-cases";
import SeedSupport from "../../support/seed.support";
import AuthSupport from "../../support/auth.support";
import server from "../../../src/server";
import request from "supertest";
import "jest-extended";

import { organizationA, organizationB } from "../../../prisma/seeds/models/organization";
import { deleteSeedsFromDB, setSeedsInDB } from "../../../prisma/seeds/scripts";
import { NewOrganization } from "../../../src/types/organization.types";
import { ApiTestRoutes } from "../../support/api-test-routes";
import { superUser } from "../../../prisma/seeds/models/user";
import { Role } from "@prisma/client";

describe("Gerenciando organização", () => {
    const newOrganization: NewOrganization = {
        name: "Nova Organização",
        cnpj: "02281027000125",
    };

    beforeEach(async () => {
        await setSeedsInDB();
    });

    afterEach(async () => {
        await deleteSeedsFromDB();
    });

    //TODO: fix skipped test
    OrganizationTestCases.permissionsUpdate.forEach(({ role, expected }) =>
        it.skip(`Deveria retornar ${expected.status} ao editar a organização como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            const res = await request(server)
                .patch(ApiTestRoutes.PATCH_ORGANIZATION_ROUTE(organizationA.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .send({ data: newOrganization })
                .expect(expected.status);

            if (!expected.allowed) return;

            expect(res.body).toStrictEqual({
                id: organizationA.id,
                name: newOrganization.name,
                cnpj: newOrganization.cnpj,
                empresaLogoId: expect.toBeOneOf([null, expect.toBeString()]),
                createdAt: expect.toBeDateString(),
                updatedAt: expect.toBeDateString(),
            });
        })
    );

    it("Deveria retornar erro 404 ao tentar editar uma organização inexistente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        await request(server)
            .patch(ApiTestRoutes.PATCH_ORGANIZATION_ROUTE("fakeId"))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: newOrganization })
            .expect(404);
    });

    it("Deveria retornar erro 400 ao tentar editar uma organização com cnpj já existente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        await request(server)
            .patch(ApiTestRoutes.PATCH_ORGANIZATION_ROUTE(organizationA.id))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: { ...newOrganization, cnpj: organizationB.cnpj } })
            .expect(400);
    });

    Object.values(Role).forEach((role) =>
        it(`Deveria listar as organizações às quais o usuário faz parte como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);
            const userId = SeedSupport.getUserWithUniqueRoleBy(role).id;

            const res = await request(server)
                .get(ApiTestRoutes.ORGANIZATION_ROUTE)
                .set("Authorization", `Bearer ${auth.access.token}`)
                .query({ where: { userId } })
                .expect(200);
            expect(res.body.length).not.toBe(0);
            for (let organization of res.body) {
                expect(organization).toStrictEqual({
                    name: expect.toBeString(),
                    cnpj: expect.toBeString(),
                    id: expect.toBeString(),
                    empresaLogoId: expect.toBeOneOf([null, expect.toBeString()]),
                    createdAt: expect.toBeDateString(),
                    updatedAt: expect.toBeDateString(),
                    userRoles: expect.arrayContaining([
                        expect.objectContaining({
                            id: expect.toBeString(),
                            userId: expect.toBeString(),
                            empresaId: expect.toBeString(),
                            role: expect.toBeString(),
                            fixedCommission: expect.toBeBoolean(),
                            ativo: expect.toBeBoolean(),
                            bloqueado: expect.toBeBoolean(),
                            createdAt: expect.toBeDateString(),
                            updatedAt: expect.toBeDateString(),
                        }),
                    ]),
                });
            }
        })
    );

    Object.values(Role).forEach((role) =>
        it(`Deveria gerar erro 403 ao tentar listar as organizações de outro usuário como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            await request(server)
                .get(ApiTestRoutes.ORGANIZATION_ROUTE)
                .set("Authorization", `Bearer ${auth.access.token}`)
                .query({ where: { userId: superUser.id } })
                .expect(403);
        })
    );
});
