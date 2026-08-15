import DistributionCases from "./commission-distribution.test-cases";
import AuthSupport from "../../support/auth.support";
import server from "../../../src/server";
import request from "supertest";
import "jest-extended";

import {
    adminRole,
    commissioningAnalystRole,
    salePersonRoleA,
    superUserSalePersonRole,
} from "../../../prisma/seeds/models/user-role";
import { commissionDistA, commissionDistAB } from "../../../prisma/seeds/models/commissionDistribution";
import { NewCommissionDistribution } from "../../../src/types/commission-distribution.types";
import { deleteSeedsFromDB, setSeedsInDB } from "../../../prisma/seeds/scripts";
import { organizationA } from "../../../prisma/seeds/models/organization";
import { NOT_COMERCIAL_ROLES } from "../../../src/types/user-role.types";
import { ApiTestRoutes } from "../../support/api-test-routes";
import { Role } from "@prisma/client";

describe("Gerenciando distribuições de comissão", () => {
    const newDistribution: NewCommissionDistribution = {
        roleCommissions: [
            { comissao: 2.5, userRoleId: salePersonRoleA.id, acelerator: 0 },
            { comissao: 2.5, userRoleId: superUserSalePersonRole.id, acelerator: 0 },
        ],
    };

    const newDistributionDuplicate: NewCommissionDistribution = {
        roleCommissions: commissionDistA.roleCommissions.map(({ comissao, acelerator, userRoleId }) => ({
            acelerator,
            comissao,
            userRoleId,
        })),
    };

    const expectToBeInDistributions = {
        id: expect.toBeString(),
        empresaId: expect.toBeString(),
        roleCommissions: expect.arrayContaining([
            expect.objectContaining({
                comissao: expect.toBeNumber(),
                acelerator: expect.toBeNumber(),
                id: expect.toBeString(),
                distribuicaoComissaoId: expect.toBeString(),
                createdAt: expect.toBeDateString(),
                updatedAt: expect.toBeDateString(),
                userRole: {
                    ativo: expect.toBeBoolean(),
                    bloqueado: expect.toBeBoolean(),
                    createdAt: expect.toBeDateString(),
                    empresaId: expect.toBeString(),
                    id: expect.toBeString(),
                    role: expect.toBeString(),
                    fixedCommission: expect.toBeBoolean(),
                    updatedAt: expect.toBeDateString(),
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
                    userId: expect.toBeString(),
                },
                userRoleId: expect.toBeString(),
            }),
        ]),
        createdAt: expect.toBeDateString(),
        updatedAt: expect.toBeDateString(),
    };

    beforeEach(async () => {
        await setSeedsInDB();
    });

    afterEach(async () => {
        await deleteSeedsFromDB();
    });

    DistributionCases.createPerRole.map(({ role, expected }) =>
        it(`Deveria retornar ${expected.status} ao adicionar uma nova distribuição como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            const resAdd = await request(server)
                .post(ApiTestRoutes.COMMISSION_DISTRIBUTION_ROUTE)
                .set("Authorization", `Bearer ${auth.access.token}`)
                .send({ data: [newDistribution] })
                .expect(expected.status);

            if (!expected.allowed) return;

            expect(resAdd.body.length).toBe(1);
            expect(resAdd.body[0]).toStrictEqual({
                id: expect.toBeString(),
                empresaId: organizationA.id,
                createdAt: expect.toBeDateString(),
                updatedAt: expect.toBeDateString(),
            });
        })
    );

    NOT_COMERCIAL_ROLES.forEach((notComercialRole) =>
        it(`Deveria retornar erro 400 ao tentar adicionar uma distribuição para ${notComercialRole}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

            const invalidRoleCommissions = [
                {
                    ...newDistribution.roleCommissions[0],
                    userRoleId: notComercialRole === Role.ADMIN ? adminRole.id : commissioningAnalystRole.id,
                },
            ];

            await request(server)
                .post(ApiTestRoutes.COMMISSION_DISTRIBUTION_ROUTE)
                .set("Authorization", `Bearer ${auth.access.token}`)
                .send({ data: [{ ...newDistribution, roleCommissions: invalidRoleCommissions }] })
                .expect(400);
        })
    );

    it("Deveria gerar erro 400 ao tentar adicionar uma distribuição duplicada", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        return await request(server)
            .post(ApiTestRoutes.COMMISSION_DISTRIBUTION_ROUTE)
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: [newDistributionDuplicate] })
            .expect(400);
    });

    DistributionCases.findAllPerRole.forEach(({ role, expected }) =>
        it(`Deveria retornar ${expected.status} ao listar as distribuições de comissão como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            const res = await request(server)
                .get(ApiTestRoutes.COMMISSION_DISTRIBUTION_ROUTE)
                .set("Authorization", `Bearer ${auth.access.token}`)
                .query({ sortBy: "createdAt", limit: 10, sortType: "asc" })
                .expect(expected.status);

            if (!expected.allowed) return;

            expect(res.body.length).toBe(7);

            for (let distribuicao of res.body) {
                expect(distribuicao).toStrictEqual(expectToBeInDistributions);
            }
        })
    );

    DistributionCases.findFilteredByUserRoleIdPerRole.forEach(({ role, distributions: distributionIds }) =>
        distributionIds.forEach(({ distRole, includedUserRoleId, expectedStatus }) =>
            it(`Deveria retornar ${expectedStatus} ao buscar a distribuições para ${distRole} como ${role}`, async () => {
                const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

                return await request(server)
                    .get(ApiTestRoutes.COMMISSION_DISTRIBUTION_ROUTE)
                    .query({ where: { role: distRole, userRoleId: includedUserRoleId } })
                    .set("Authorization", `Bearer ${auth.access.token}`)
                    .expect(expectedStatus);
            })
        )
    );

    DistributionCases.getOnePerRole.forEach(({ role, expected }) =>
        it(`Deveria retornar ${expected.status} ao pegar uma distribuição sem passar userRoleId como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            const res = await request(server)
                .get(ApiTestRoutes.PATCH_COMMISSION_DISTRIBUTION_ROUTE(commissionDistA.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(expected.status);

            if (!expected.allowed) return;

            expect(res.body).toStrictEqual(expectToBeInDistributions);
            expect(res.body.id).toBe(commissionDistA.id);
        })
    );

    it("Deveria retornar erro 404 ao tentar pegar uma única distribuição de comissão inexistente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        return await request(server)
            .get(ApiTestRoutes.PATCH_COMMISSION_DISTRIBUTION_ROUTE("fakeId"))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .expect(404);
    });

    DistributionCases.updatePerRole.forEach(({ role, expected }) =>
        it(`Deveria retornar ${expected.status} ao editar uma distribuição de comissão como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            const resUpdate = await request(server)
                .patch(ApiTestRoutes.PATCH_COMMISSION_DISTRIBUTION_ROUTE(commissionDistA.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .send({ data: newDistribution })
                .expect(expected.status);

            if (!expected.allowed) return;

            expect(resUpdate.body).toStrictEqual({
                id: expect.toBeString(),
                empresaId: organizationA.id,
                createdAt: expect.toBeDateString(),
                updatedAt: expect.toBeDateString(),
            });
        })
    );

    NOT_COMERCIAL_ROLES.forEach((notComercialRole) =>
        it(`Deveria gerar erro 400 ao tentar editar uma distribuição para ${notComercialRole}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

            const invalidRoleCommissions = [
                {
                    ...newDistribution.roleCommissions[0],
                    userRoleId: notComercialRole === Role.ADMIN ? adminRole.id : commissioningAnalystRole.id,
                },
            ];

            return await request(server)
                .patch(ApiTestRoutes.PATCH_COMMISSION_DISTRIBUTION_ROUTE(commissionDistAB.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .send({ data: { ...newDistribution, roleCommissions: invalidRoleCommissions } })
                .expect(400);
        })
    );

    it("Deveria gerar erro 404 ao tentar editar uma distribuição de comissão inexistente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        return await request(server)
            .patch(ApiTestRoutes.PATCH_COMMISSION_DISTRIBUTION_ROUTE("fakeId"))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: newDistribution })
            .expect(404);
    });

    DistributionCases.deletePerRole.map(({ role, expected }) =>
        it(`Deveria retornar ${expected.status} ao deletar uma distribuição de comissão como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            return await request(server)
                .delete(ApiTestRoutes.PATCH_COMMISSION_DISTRIBUTION_ROUTE(commissionDistAB.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(expected.status);
        })
    );

    it("Deveria retornar erro 404 ao tentar deletar uma distribuição de comissão inexistente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        return await request(server)
            .delete(ApiTestRoutes.PATCH_COMMISSION_DISTRIBUTION_ROUTE("fakeId"))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .expect(404);
    });
});
