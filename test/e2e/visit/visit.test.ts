import AuthSupport from "../../support/auth.support";
import VisitTestCases from "./visit.test-cases";
import server from "../../../src/server";
import request from "supertest";
import "jest-extended";

import { adminRole, salePersonRoleA, superUserSalePersonRole } from "../../../prisma/seeds/models/user-role";
import { visitA, visitB, visitC, visitD } from "../../../prisma/seeds/models/visit";
import { deleteSeedsFromDB, setSeedsInDB } from "../../../prisma/seeds/scripts";
import { dataComAnoAtual } from "../../../test/support/constant-test.support";
import { customerA } from "../../../prisma/seeds/models/customer";
import { ApiTestRoutes } from "../../support/api-test-routes";
import { NewVisit } from "../../../src/types/visit.types";
import { expect, describe, it } from "@jest/globals";
import { Role } from "@prisma/client";

describe("Gerenciando visitas", () => {
    const VISITS_AMOUNT = 5;

    const expectToBeInVisit = {
        clienteId: expect.toBeString(),
        comentarios: expect.toBeString(),
        createdAt: expect.toBeDateString(),
        dataVisita: expect.toBeDateString(),
        tipoVisita: expect.toBeOneOf([expect.toBeString(), null]),
        empresaId: expect.toBeString(),
        gastos: expect.toBeOneOf([
            expect.arrayContaining([
                expect.objectContaining({
                    id: expect.toBeString(),
                    nota: expect.toBeString(),
                    tipoGasto: expect.toBeString(),
                    valor: expect.toBeNumber(),
                    updatedAt: expect.toBeString(),
                    createdAt: expect.toBeDateString(),
                }),
            ]),
            [],
        ]),
        id: expect.toBeString(),
        kmFinal: expect.toBeOneOf([expect.toBeNumber(), null]),
        kmInicial: expect.toBeOneOf([expect.toBeNumber(), null]),
        remoto: expect.toBeBoolean(),
        updatedAt: expect.toBeDateString(),
        salePerson: {
            ativo: expect.toBeBoolean(),
            bloqueado: expect.toBeBoolean(),
            createdAt: expect.toBeDateString(),
            empresaId: expect.toBeString(),
            fixedCommission: expect.toBeBoolean(),
            id: expect.toBeString(),
            role: expect.toBeString(),
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
        salePersonId: expect.toBeString(),
        carroEmpresa: expect.toBeBoolean(),
        visitaPaga: expect.toBeBoolean(),
        cliente: expect.objectContaining({
            cnpj: expect.toBeString(),
            createdAt: expect.toBeDateString(),
            email: expect.toBeString(),
            id: expect.toBeString(),
            comprou: expect.toBeBoolean(),
            name: expect.toBeString(),
            segmentoId: expect.toBeString(),
            responsavelId: expect.toBeString(),
            telefone: expect.toBeString(),
            updatedAt: expect.toBeString(),
        }),
    };

    const newVisit: NewVisit = {
        dataVisita: dataComAnoAtual(2, 18),
        comentarios: "Aqui tem algo",
        remoto: false,
        salePersonId: superUserSalePersonRole.id,
        clienteId: customerA.id,
        visitaPaga: false,
        gastos: [
            {
                nota: "nota_visita_teste",
                tipoGasto: "ALIMENTACAO",
                valor: 30,
                carroEmpresa: null,
                kmInicial: null,
                kmFinal: null,
                tipoViagem: null,
                dataViagem: null,
            },
        ],
    };
    const newVisitRestrictedBySalePersonId: NewVisit = { ...newVisit, salePersonId: salePersonRoleA.id };

    beforeEach(async () => {
        await setSeedsInDB();
    });

    afterEach(async () => {
        await deleteSeedsFromDB();
    });

    //TODO: Verificar como fazer o teste de horário de trabalho. Isto não está mudando o horário do sistema.
    it("Deveria gerar erro 403 caso vendedor tentar criar uma visita fora do horário de trabalho", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.VENDEDOR);

        jest.useFakeTimers();
        const originalDateNow = dataComAnoAtual(3, 6);
        jest.setSystemTime(originalDateNow);
        jest.useRealTimers();

        await request(server)
            .post(ApiTestRoutes.VISIT_ROUTE)
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: [newVisit] })
            .expect(403);
    });

    VisitTestCases.permissionsCreateWithoutRestrictions.forEach(({ role, expected }) =>
        it(`Deveria retornar ${expected.status} ao adicionar uma nova visita sem restrições como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            const res = await request(server)
                .post(ApiTestRoutes.VISIT_ROUTE)
                .set("Authorization", `Bearer ${auth.access.token}`)
                .send({ data: [newVisit] })
                .expect(expected.status);

            if (!expected.allowed) return;

            expect(res.body.length).toBe(1);
            expect(res.body[0].dataVisita).toBe(newVisit.dataVisita.toISOString());
            expect(res.body[0].carroEmpresa).toBe(newVisit.carroEmpresa ?? null);
            expect(res.body[0].kmInicial).toBe(newVisit.kmInicial ?? null);
            expect(res.body[0].kmFinal).toBe(newVisit.kmFinal ?? null);
            expect(res.body[0].comentarios).toBe(newVisit.comentarios);
        })
    );

    VisitTestCases.permissionsCreateRestrictedBySalePersonId.forEach(({ role, expected }) =>
        it(`Deveria retornar ${expected.status} ao adicionar uma nova visita com restrição de salePerson como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            await request(server)
                .post(ApiTestRoutes.VISIT_ROUTE)
                .set("Authorization", `Bearer ${auth.access.token}`)
                .send({ data: [newVisitRestrictedBySalePersonId] })
                .expect(expected.status);
        })
    );

    it("Deveria adicionar uma nova visita remota", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        const res = await request(server)
            .post(ApiTestRoutes.VISIT_ROUTE)
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: [{ ...newVisit, remoto: true }] })
            .expect(201);

        expect(res.body.length).toBe(1);
        expect(res.body[0].dataVisita).toBe(newVisit.dataVisita.toISOString());
        expect(res.body[0].remoto).toBe(true);
        expect(res.body[0].carroEmpresa).toBe(null);
        expect(res.body[0].kmInicial).toBe(null);
        expect(res.body[0].kmFinal).toBe(null);
        expect(res.body[0].comentarios).toBe(newVisit.comentarios);
    });

    it("Deveria retornar erro 404 ao adicionar uma nova visita e no lugar de vendedores passar outra role", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        await request(server)
            .post(ApiTestRoutes.VISIT_ROUTE)
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: [{ ...newVisit, salePersonId: adminRole.id }] })
            .expect(404);
    });

    it("Deveria retornar erro 400 ao adicionar uma nova visita com código de nota existente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        await request(server)
            .post(ApiTestRoutes.VISIT_ROUTE)
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: [{ ...newVisit, gastos: visitA.gastos }] })
            .expect(400);
    });

    VisitTestCases.permissionsReadWithoutRestrictions.forEach(({ role, expected }) =>
        it(`Deveria retornar ${expected.status} ao listar as visitas sem restrição como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            const res = await request(server)
                .get(ApiTestRoutes.VISIT_ROUTE)
                .set("Authorization", `Bearer ${auth.access.token}`)
                .query({ sortBy: "dataVisita", limit: 10, sortType: "asc" })
                .expect(expected.status);

            if (!expected.allowed) return;

            expect(res.body.length).toBe(VISITS_AMOUNT);

            for (let visita of res.body) {
                expect(visita).toStrictEqual(expectToBeInVisit);
            }
        })
    );

    VisitTestCases.permissionsReadRestrictedBySalePersonId.forEach(({ role, expected }) =>
        it(`Deveria retornar ${expected.status} ao listar as visitas com restriçào de salePersonId como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            const res = await request(server)
                .get(ApiTestRoutes.VISIT_ROUTE)
                .set("Authorization", `Bearer ${auth.access.token}`)
                .query({
                    sortBy: "dataVisita",
                    limit: 10,
                    sortType: "asc",
                    where: { codigoNota: visitA.gastos[0].nota, salePersonId: salePersonRoleA.id },
                })
                .expect(expected.status);

            if (!expected.allowed) return;

            expect(res.body.length).toBe(1);

            for (let visita of res.body) {
                expect(visita).toStrictEqual(expectToBeInVisit);
            }
        })
    );

    VisitTestCases.permissionsReadWithoutRestrictions.forEach(({ role, expected }) =>
        it(`Deveria retornar ${expected.status} ao pegar uma única visita sem restrição como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            const res = await request(server)
                .get(ApiTestRoutes.PATCH_VISIT_ROUTE(visitA.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(expected.status);

            if (!expected.allowed) return;

            const visita = res.body;
            expect(visita).toStrictEqual(expectToBeInVisit);
            expect(visita.id).toBe(visitA.id);
        })
    );

    it("Deveria gerar erro 404 ao tentar pegar uma única visita inexistente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        await request(server)
            .get(ApiTestRoutes.PATCH_VISIT_ROUTE("fakeId"))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .expect(404);
    });

    VisitTestCases.permissionsUpdateWithoutRestrictions.forEach(({ role, expected }) =>
        it(`Deveria retornar ${expected.status} ao editar uma visita sem restrições como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            const res = await request(server)
                .patch(ApiTestRoutes.PATCH_VISIT_ROUTE(visitC.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .send({ data: { ...newVisit, gastos: [...newVisit.gastos, ...visitC.gastos] } })
                .expect(expected.status);

            if (!expected.allowed) return;

            expect(res.body.id).toBe(visitC.id);
            expect(res.body.dataVisita).toBe(newVisit.dataVisita.toISOString());
            // expect(res.body.carroEmpresa).toBe(newVisit.carroEmpresa);
            // expect(res.body.kmInicial).toBe(newVisit.kmInicial);
            // expect(res.body.kmFinal).toBe(newVisit.kmFinal);
            expect(res.body.comentarios).toBe(newVisit.comentarios);
        })
    );

    VisitTestCases.permissionsUpdateRestrictedBySalePersonId.forEach(({ role, expected }) =>
        it(`Deveria retornar ${expected.status} ao editar uma visita com restrição de salePersonId como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            await request(server)
                .patch(ApiTestRoutes.PATCH_VISIT_ROUTE(visitC.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .query({ currentSalePersonId: salePersonRoleA.id })
                .send({ data: { ...newVisitRestrictedBySalePersonId, gastos: [...newVisit.gastos, ...visitC.gastos] } })
                .expect(expected.status);
        })
    );

    it("Deveria gerar erro 404 ao tentar editar uma visita no lugar de vendedor colocar outra role", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        await request(server)
            .patch(ApiTestRoutes.PATCH_VISIT_ROUTE(visitB.id))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: { ...newVisit, salePersonId: adminRole.id } })
            .expect(404);
    });

    it("Deveria gerar erro 400 ao tentar editar uma visita com nota já existente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        await request(server)
            .patch(ApiTestRoutes.PATCH_VISIT_ROUTE(visitB.id))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: { ...newVisit, gastos: visitA.gastos } })
            .expect(400);
    });

    it("Deveria gerar erro 404 ao tentar editar uma visita inexistente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        return await request(server)
            .patch(ApiTestRoutes.PATCH_VISIT_ROUTE("fakeId"))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: newVisit })
            .expect(404);
    });

    it("Deveria gerar erro 400 ao tentar editar uma visita que já foi paga", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        return await request(server)
            .patch(ApiTestRoutes.PATCH_VISIT_ROUTE(visitA.id))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: newVisit })
            .expect(400);
    });

    VisitTestCases.permissionsUpdateWithoutRestrictions.forEach(({ role, expected }) =>
        it(`Deveria retornar ${expected.status} ao editar uma ou mais visitas para pagas como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            await request(server)
                .patch(ApiTestRoutes.VISIT_ROUTE)
                .set("Authorization", `Bearer ${auth.access.token}`)
                .send({ data: { visitasId: [visitB.id] } })
                .expect(expected.status);
        })
    );

    it("Deveria retornar erro 404 caso não encontrar alguma visita ao marcar como pagas", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        await request(server)
            .patch(ApiTestRoutes.VISIT_ROUTE)
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: { visitasId: ["fake_id"] } })
            .expect(404);
    });

    it("Deveria retornar erro 404 caso enviado ids de visitas ja pagas", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        await request(server)
            .patch(ApiTestRoutes.VISIT_ROUTE)
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: { visitasId: [visitA.id] } })
            .expect(404);
    });

    VisitTestCases.permissionsDeleteWithoutRestrictions.forEach(({ role, expected }) =>
        it(`Deveria retornar ${expected.status} ao  deletar uma visita sem restrição como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            return await request(server)
                .delete(ApiTestRoutes.PATCH_VISIT_ROUTE(visitB.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(expected.status);
        })
    );

    VisitTestCases.permissionsDeleteRestrictedBySalePersonId.forEach(({ role, expected }) =>
        it(`Deveria retornar ${expected.status} ao  deletar uma visita com restrição de salePersonId como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            return await request(server)
                .delete(ApiTestRoutes.PATCH_VISIT_ROUTE(visitD.id))
                .query({ currentSalePersonId: salePersonRoleA.id })
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(expected.status);
        })
    );

    it("Deveria gerar erro 404 ao tentar deletar uma visita inexistente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        return await request(server)
            .delete(ApiTestRoutes.PATCH_VISIT_ROUTE("fakeId"))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .expect(404);
    });

    it("Deveria gerar erro 400 ao tentar deletar uma visita que já foi paga", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        return await request(server)
            .delete(ApiTestRoutes.PATCH_VISIT_ROUTE(visitA.id))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .expect(400);
    });

    VisitTestCases.permissionsReadRestrictedBySalePersonId.forEach(({ role, expected }) =>
        it(`Deveria retornar ${expected.status} ao gerar relatório de visitas com restrição de salePersonId como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            return await request(server)
                .post(ApiTestRoutes.VISIT_REPORT_ROUTE)
                .set("Authorization", `Bearer ${auth.access.token}`)
                .query({
                    where: {
                        salePersonId: salePersonRoleA.id,
                        gte_dataVisita: dataComAnoAtual(5, 1),
                        lte_dataVisita: dataComAnoAtual(5, 31),
                    },
                })
                .send({ visitsIds: [] })
                .expect(expected.status);
        })
    );

    VisitTestCases.permissionsReadRestrictedBySalePersonId.forEach(({ role, expected }) =>
        it(`Deveria retornar ${expected.status} ao gerar relatório de visitas restricto e enviando ids específicos como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            await request(server)
                .post(ApiTestRoutes.VISIT_REPORT_ROUTE)
                .set("Authorization", `Bearer ${auth.access.token}`)
                .query({
                    where: {
                        salePersonId: salePersonRoleA.id,
                        gte_dataVisita: dataComAnoAtual(5, 1),
                        lte_dataVisita: dataComAnoAtual(5, 31),
                    },
                })
                .send({ visitsIds: [visitA.id, visitD.id] })
                .expect(expected.status);
        })
    );

    VisitTestCases.permissionsReadWithoutRestrictions.forEach(({ role, expected }) =>
        it(`Deveria retornar ${expected.status} ao gerar relatório de visitas sem restrição como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            return await request(server)
                .post(ApiTestRoutes.VISIT_REPORT_ROUTE)
                .set("Authorization", `Bearer ${auth.access.token}`)
                .query({
                    where: {
                        gte_dataVisita: dataComAnoAtual(5, 1),
                        lte_dataVisita: dataComAnoAtual(5, 31),
                    },
                })
                .send({ visitsIds: [] })
                .expect(expected.status);
        })
    );

    VisitTestCases.permissionsReadWithoutRestrictions.forEach(({ role, expected }) =>
        it(`Deveria retornar ${expected.status} ao gerar relatório de visitas sem restrição e enviando ids específicos como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            await request(server)
                .post(ApiTestRoutes.VISIT_REPORT_ROUTE)
                .set("Authorization", `Bearer ${auth.access.token}`)
                .query({
                    where: {
                        gte_dataVisita: dataComAnoAtual(5, 1),
                        lte_dataVisita: dataComAnoAtual(5, 31),
                    },
                })
                .send({ visitsIds: [visitA.id, visitB.id] })
                .expect(expected.status);
        })
    );

    it("Deveria gerar erro 404 ao passar ids de visistas inválido para criar relatório de visitas", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        return await request(server)
            .post(ApiTestRoutes.VISIT_REPORT_ROUTE)
            .set("Authorization", `Bearer ${auth.access.token}`)
            .query({
                where: {
                    gte_dataVisita: dataComAnoAtual(5, 1),
                    lte_dataVisita: dataComAnoAtual(5, 31),
                },
            })
            .send({ visitsIds: ["fake_id", visitB.id] })
            .expect(404);
    });

    VisitTestCases.permissionsReadWithoutRestrictions.forEach(({ role, expected }) =>
        it(`Deveria retornar ${expected.status} ao pegar informações de gastos a pagar por vendedor sem restrição como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            const res = await request(server)
                .get(ApiTestRoutes.VISIT_EXPENSE_ROUTE)
                .set("Authorization", `Bearer ${auth.access.token}`)
                .query({
                    where: {
                        gte_dataVisita: dataComAnoAtual(5, 1),
                        lte_dataVisita: dataComAnoAtual(5, 31),
                    },
                })
                .expect(expected.status);

            if (!expected.allowed) return;

            expect(res.body[0]).toStrictEqual({
                total: expect.toBeOneOf([0, 10]),
                pago: expect.toBeOneOf([0, 10]),
                visitasIdsAPagar: expect.toBeOneOf([[]]),
                salePerson: {
                    ativo: expect.toBeBoolean(),
                    bloqueado: expect.toBeBoolean(),
                    createdAt: expect.toBeDateString(),
                    empresaId: expect.toBeString(),
                    fixedCommission: expect.toBeBoolean(),
                    id: expect.toBeString(),
                    role: expect.toBeString(),
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
            });
        })
    );
});
