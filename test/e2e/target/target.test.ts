import AuthSupport from "../../support/auth.support";
import SeedSupport from "../../support/seed.support";
import TargetTestCases from "./target.test-cases";
import server from "../../../src/server";
import request from "supertest";
import "jest-extended";

import { deleteSeedsFromDB, setSeedsInDB } from "../../../prisma/seeds/scripts";
import { dataComAnoAtual } from "../../../test/support/constant-test.support";
import { DataCreateTarget } from "../../../src/validations/target.validator";
import { salePersonRoleA } from "../../../prisma/seeds/models/user-role";
import { ApiTestRoutes } from "../../support/api-test-routes";
import { targetA } from "../../../prisma/seeds/models/target";
import { Role } from "@prisma/client";

describe("Gerenciando metas", () => {
    const TARGETS_AMOUNT = 10;

    const expectToBeInTargets = {
        id: expect.toBeString(),
        dataInicioMeta: expect.toBeDateString(),
        dataFimMeta: expect.toBeDateString(),

        userRoleId: expect.toBeString(),
        userRole: expect.objectContaining({
            ativo: expect.toBeBoolean(),
            role: expect.toBeOneOf(Object.values(Role)),
            fixedCommission: expect.toBeBoolean(),
            createdAt: expect.toBeDateString(),
            id: expect.toBeString(),
            updatedAt: expect.toBeDateString(),
            userId: expect.toBeString(),
            empresaId: expect.toBeString(),
        }),
        createdAt: expect.toBeDateString(),
        updatedAt: expect.toBeDateString(),
        tiposMeta: expect.toBeOneOf([
            expect.arrayContaining([
                expect.objectContaining({
                    tipoMeta: expect.toBeString(),
                    aceleratorTriggerValue: expect.toBeNumber(),
                    commissionTriggerValue: expect.toBeNumber(),
                    valorAtingido: expect.toBeNumber(),
                }),
            ]),
            [],
        ]),
    };

    const newTarget: DataCreateTarget = {
        dataInicioMeta: dataComAnoAtual(8, 1),
        dataFimMeta: dataComAnoAtual(8, 30),
        userRoleId: salePersonRoleA.id,
        tiposMeta: [{ tipoMeta: "VISITA", aceleratorTriggerValue: 10, commissionTriggerValue: 2 }],
    };

    beforeEach(async () => {
        await setSeedsInDB();
    });

    afterEach(async () => {
        await deleteSeedsFromDB();
    });

    TargetTestCases.readAnyCases.forEach(({ role, expected }) =>
        it(`Deveria retornar ${expected.status} ao listar qualquer meta como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            const res = await request(server)
                .get(ApiTestRoutes.TARGETS_ROUTE)
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(expected.status);

            if (!expected.allowed) return;

            expect(res.body.length).toBe(TARGETS_AMOUNT);

            for (let meta of res.body) {
                expect(meta).toStrictEqual(expectToBeInTargets);
            }
        })
    );

    TargetTestCases.readByUserRoleIdAndRoleCases.forEach(({ role, possibilities }) =>
        possibilities.forEach(({ expected, comercialRole, userRoleId }) =>
            it(`Deveria retornar ${expected.status} ao listar metas do role ${comercialRole} e ${userRoleId} como ${role}`, async () => {
                const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

                await request(server)
                    .get(ApiTestRoutes.TARGETS_ROUTE)
                    .set("Authorization", `Bearer ${auth.access.token}`)
                    .query({ where: { userRole: comercialRole, userRoleId } })
                    .expect(expected.status);
            })
        )
    );

    it(`Deveria retornar 403 ao listar metas de outros gerentes como gerente`, async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.COMERCIAL_MANAGER);

        await request(server)
            .get(ApiTestRoutes.TARGETS_ROUTE)
            .set("Authorization", `Bearer ${auth.access.token}`)
            .query({ where: { userRole: Role.COMERCIAL_MANAGER } })
            .expect(403);
    });

    TargetTestCases.readAnyCases.forEach(({ role, expected }) =>
        it(`Deveria retornar ${expected.status} ao pegar uma única meta como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            const res = await request(server)
                .get(ApiTestRoutes.PATCH_TARGETS_ROUTE(targetA.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(expected.status);

            if (!expected.allowed) return;

            expect(res.body).toStrictEqual(expectToBeInTargets);
            expect(res.body.id).toBe(targetA.id);
            expect(res.body.userRoleId).toBe(targetA.userRoleId);
            expect(res.body.tiposMeta.length).toBe(targetA.tiposMeta.length);
        })
    );

    it("Deveria retornar erro 404 ao buscar uma meta inexistente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        await request(server)
            .get(ApiTestRoutes.PATCH_TARGETS_ROUTE("fakeId"))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .expect(404);
    });

    TargetTestCases.createAnyCases.forEach(({ expected, role }) =>
        it(`Devaria retornar ${expected.status} ao adicionar qualquer meta como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            const req = await request(server)
                .post(ApiTestRoutes.TARGETS_ROUTE)
                .set("Authorization", `Bearer ${auth.access.token}`)
                .send({ data: [newTarget] })
                .expect(expected.status);

            if (!expected.allowed) return;

            expect(req.body.length).toBe(1);
            expect(req.body[0].dataInicioMeta).toBe(newTarget.dataInicioMeta.toISOString());
            expect(req.body[0].dataFimMeta).toBe(newTarget.dataFimMeta.toISOString());
            expect(req.body[0].userRoleId).toBe(newTarget.userRoleId);
            expect(req.body[0].tiposMeta.length).toBe(1);
            expect(req.body[0].tiposMeta[0].tipoMeta).toBe(newTarget.tiposMeta[0].tipoMeta);
            expect(req.body[0].tiposMeta[0].aceleratorTriggerValue).toBe(newTarget.tiposMeta[0].aceleratorTriggerValue);
        })
    );

    TargetTestCases.createByUserRoleCases.forEach(({ role, possibilities }) =>
        possibilities.forEach(({ expected, comercialRole }) =>
            it(`Devaria retornar ${expected.status} ao adicionar uma nova meta para ${comercialRole} como ${role}`, async () => {
                const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

                const comercialUserRoleId = SeedSupport.getRoleIdFromUserWithUniqueRoleBy(comercialRole);
                await request(server)
                    .post(ApiTestRoutes.TARGETS_ROUTE)
                    .set("Authorization", `Bearer ${auth.access.token}`)
                    .query({ userRole: comercialRole })
                    .send({ data: [{ ...newTarget, userRoleId: comercialUserRoleId }] })
                    .expect(expected.status);
            })
        )
    );

    TargetTestCases.createOrUpdateNotComercialCases.forEach(({ notComercialUserRoleId, expected }) =>
        it(`Deveria retornar ${expected.status} ao adicionar uma nova meta com um userRole não comercial`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

            await request(server)
                .post(ApiTestRoutes.TARGETS_ROUTE)
                .set("Authorization", `Bearer ${auth.access.token}`)
                .send({ data: [{ ...newTarget, userRoleId: notComercialUserRoleId }] })
                .expect(expected.status);
        })
    );

    it("Devaria retornar erro 404 ao adicionar uma nova meta com userRoles inexistentes", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        await request(server)
            .post(ApiTestRoutes.TARGETS_ROUTE)
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: [{ ...newTarget, userRoleId: "fake_id" }] })
            .expect(404);
    });

    TargetTestCases.updateAnyCases.forEach(({ role, expected }) =>
        it(`Deveria retornar ${expected.status} ao editar uma meta como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            await request(server)
                .patch(ApiTestRoutes.PATCH_TARGETS_ROUTE(targetA.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .send({ data: newTarget })
                .expect(expected.status);

            if (!expected.allowed) return;

            const res = await request(server)
                .get(ApiTestRoutes.PATCH_TARGETS_ROUTE(targetA.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(200);

            expect(res.body.id).toBe(targetA.id);
            expect(res.body.userRoleId).toBe(newTarget.userRoleId);
            expect(res.body.tiposMeta.length).toBe(newTarget.tiposMeta.length);
        })
    );

    TargetTestCases.updateByUserRoleCases.forEach(({ role, possibilities }) =>
        possibilities.forEach(({ comercialRole, expected }) =>
            it(`Deveria retornar ${expected.status} ao editar uma meta de ${comercialRole} como ${role}`, async () => {
                const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

                const comercialUserRoleId = SeedSupport.getRoleIdFromUserWithUniqueRoleBy(comercialRole);
                const targetId = SeedSupport.getTargetIdFromComercialRole(comercialRole);

                await request(server)
                    .patch(ApiTestRoutes.PATCH_TARGETS_ROUTE(targetId))
                    .set("Authorization", `Bearer ${auth.access.token}`)
                    .query({ userRole: comercialRole })
                    .send({ data: { ...newTarget, userRoleId: comercialUserRoleId } })
                    .expect(expected.status);
            })
        )
    );

    TargetTestCases.createOrUpdateNotComercialCases.forEach(({ notComercialUserRoleId, expected }) =>
        it(`Deveria retornar ${expected.status} ao editar uma meta com um userRole não comercial`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

            await request(server)
                .post(ApiTestRoutes.PATCH_TARGETS_ROUTE(targetA.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .send({ data: { ...newTarget, userRoleId: notComercialUserRoleId } })
                .expect(expected.status);
        })
    );

    it("Deveria gerar erro 404 ao tentar editar uma meta inexistente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        return await request(server)
            .patch(ApiTestRoutes.PATCH_TARGETS_ROUTE("fake_id"))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: newTarget })
            .expect(404);
    });

    it("Deveria gerar erro 404 ao tentar editar uma meta com userRoles inexistentes", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        return await request(server)
            .patch(ApiTestRoutes.PATCH_TARGETS_ROUTE(targetA.id))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: { ...newTarget, userRoleId: "fake_id" } })
            .expect(404);
    });

    TargetTestCases.deleteAnyCases.forEach(({ role, expected }) =>
        it(`Deveria retornar ${expected.status} ao deletar uma meta como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            return await request(server)
                .delete(ApiTestRoutes.PATCH_TARGETS_ROUTE(targetA.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(expected.status);
        })
    );

    TargetTestCases.deleteByUserRoleCases.forEach(({ role, possibilities }) =>
        possibilities.forEach(({ comercialRole, expected }) =>
            it(`Deveria retornar ${expected.status} ao deletar uma meta de ${comercialRole} como ${role}`, async () => {
                const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

                const targetId = SeedSupport.getTargetIdFromComercialRole(comercialRole);

                return await request(server)
                    .delete(ApiTestRoutes.PATCH_TARGETS_ROUTE(targetId))
                    .query({ userRole: comercialRole })
                    .set("Authorization", `Bearer ${auth.access.token}`)
                    .expect(expected.status);
            })
        )
    );

    it("Deveria gerar erro 404 ao tentar deletar uma meta inexistente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        return await request(server)
            .delete(ApiTestRoutes.PATCH_TARGETS_ROUTE("fake_id"))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .expect(404);
    });
});
