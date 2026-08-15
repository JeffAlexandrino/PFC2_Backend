import CommissionCases from "./commission.test-cases";
import AuthSupport from "../../support/auth.support";
import server from "../../../src/server";
import request from "supertest";
import "jest-extended";

import {
    commissionA,
    commissionB,
    commissionC,
    commissionE,
    commissionL,
    commissionM,
    commissionN,
} from "../../../prisma/seeds/models/commission";

import { deleteSeedsFromDB, setSeedsInDB } from "../../../prisma/seeds/scripts";
import { salePersonA, salePersonB } from "../../../prisma/seeds/models/user";
import { dataComAnoAtual } from "../../support/constant-test.support";
import { ApiTestRoutes } from "../../support/api-test-routes";
import { Comissao, Role } from "@prisma/client";

describe("Gerenciando comissões", () => {
    const expectToBeInUser = {
        ativo: expect.toBeBoolean(),
        bloqueado: expect.toBeBoolean(),
        createdAt: expect.toBeDateString(),
        email: expect.toBeString(),
        id: expect.toBeString(),
        isEmailVerified: expect.toBeBoolean(),
        name: expect.toBeString(),
        updatedAt: expect.toBeDateString(),
    };

    const expectToBeInUserRole = {
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
    };

    const expectToBeInCommission = {
        id: expect.toBeString(),
        createdAt: expect.toBeDateString(),
        updatedAt: expect.toBeDateString(),
        notaVenda: {
            vendasProduto: expect.arrayContaining([
                expect.objectContaining({
                    id: expect.toBeString(),
                    fornecedores: expect.arrayContaining([
                        expect.objectContaining({
                            id: expect.toBeString(),
                            name: expect.toBeString(),
                            cnpj: expect.toBeString(),
                            email: expect.toBeString(),
                            empresaId: expect.toBeString(),
                            createdAt: expect.toBeDateString(),
                            updatedAt: expect.toBeDateString(),
                        }),
                    ]),
                }),
            ]),
            vendasServico: expect.arrayContaining([]),
            codigo: expect.toBeOneOf([expect.toBeString(), null]),
            dedutiveisDistribuidor: expect.toBeNumber(),
            impostoNota: expect.toBeNumber(),
            tipoFaturamento: expect.toBeString(),
            numOportunidadeCRM: expect.toBeOneOf([expect.toBeString(), null]),
            numPedidoDistribuidor: expect.toBeOneOf([expect.toBeString(), null]),
            markup: expect.toBeNumber(),
            createdAt: expect.toBeDateString(),
            dataFaturamento: expect.toBeDateString(),
            formaPagamentoId: expect.toBeString(),
            formaParcelamento: expect.toBeNumber(),
            id: expect.toBeString(),
            updatedAt: expect.toBeDateString(),
            vendaId: expect.toBeString(),
            comissoes: expect.arrayContaining([
                expect.objectContaining({
                    id: expect.toBeString(),
                    dataComissao: expect.toBeDateString(),
                    comissaoPaga: expect.toBeBoolean(),
                    userRoleId: expect.toBeString(),
                }),
            ]),
        },
        notaVendaId: expect.toBeString(),
        userRole: expectToBeInUserRole,
        userRoleId: expect.toBeString(),
        venda: {
            cliente: {
                cnpj: expect.toBeString(),
                createdAt: expect.toBeDateString(),
                email: expect.toBeString(),
                empresaId: expect.toBeString(),
                comprou: expect.toBeBoolean(),
                id: expect.toBeString(),
                name: expect.toBeString(),
                segmentoId: expect.toBeString(),
                responsavelId: expect.toBeString(),
                origem: expect.toBeString(),
                telefone: expect.toBeString(),
                updatedAt: expect.toBeString(),
            },
            accountManagerId: expect.toBeString(),
            referrerId: expect.toBeOneOf([expect.toBeString(), null]),
            insideSalesId: expect.toBeOneOf([expect.toBeString(), null]),
            comercialManagerId: expect.toBeOneOf([expect.toBeString(), null]),
            solutionArchitectId: expect.toBeOneOf([expect.toBeString(), null]),
            comercialAssistantId: expect.toBeOneOf([expect.toBeString(), null]),
            accountManager: expect.objectContaining(expectToBeInUserRole),
            insideSales: expect.toBeOneOf([expect.objectContaining(expectToBeInUserRole), null]),
            referrer: expect.toBeOneOf([expect.objectContaining(expectToBeInUserRole), null]),
            solutionArchitect: expect.toBeOneOf([expect.objectContaining(expectToBeInUserRole), null]),
            comercialAssistant: expect.toBeOneOf([expect.objectContaining(expectToBeInUserRole), null]),
            id: expect.toBeString(),
            estadoVenda: expect.toBeString(),
            dataVenda: expect.toBeDateString(),
            empresaId: expect.toBeString(),
            clienteId: expect.toBeString(),
            numOportunidadeCRM: expect.toBeOneOf([expect.toBeString(), null]),
            numPedidoDistribuidor: expect.toBeOneOf([expect.toBeString(), null]),
            vendaRenovacao: expect.toBeBoolean(),
            contratoId: expect.toBeOneOf([expect.toBeString(), null]),
            contrato: expect.toBeOneOf([null, { name: expect.toBeString() }]),
            createdAt: expect.toBeDateString(),
            updatedAt: expect.toBeDateString(),
        },
        vendaId: expect.toBeString(),
        comissao: expect.toBeNumber(),
        distributorPaid: expect.toBeOneOf([expect.toBeBoolean(), null]),
        dataComissao: expect.toBeDateString(),
        valorMargemBrutaBase: expect.toBeNumber(),
        acelerador: expect.toBeNumber(),
        approvedAt: expect.toBeOneOf([expect.toBeDateString(), null]),
        porcentCommissionApproved: expect.toBeOneOf([expect.toBeNumber(), null]),
        porcentAcceleratorApproved: expect.toBeOneOf([expect.toBeNumber(), null]),
        comissaoPaga: expect.toBeBoolean(),
        ativo: expect.toBeBoolean(),
    };

    beforeEach(async () => {
        await setSeedsInDB();
    });

    afterEach(async () => {
        await deleteSeedsFromDB();
    });

    CommissionCases.permissionsReadAll.forEach(({ role, expected }) =>
        it(`Deveria retornar ${expected.status} ao listar as comissões como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            const res = await request(server)
                .get(ApiTestRoutes.COMMISSION_ROUTE)
                .set("Authorization", `Bearer ${auth.access.token}`)
                .query({ sortBy: "dataComissao", limit: 5, sortType: "asc" })
                .expect(expected.status);

            if (!expected.allowed) return;

            expect(res.body.length).toEqual(5);

            for (let commission of res.body) {
                expect(commission).toStrictEqual(expectToBeInCommission);
            }
        })
    );

    CommissionCases.permissionsReadByUserId.forEach(({ role, commissions }) =>
        commissions.forEach(({ commissionRole, expectedStatus, userId }) =>
            it(`Deveria retornar ${expectedStatus} ao listar as comissões filtrando por userId de ${commissionRole} como ${role}`, async () => {
                const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

                await request(server)
                    .get(ApiTestRoutes.COMMISSION_ROUTE)
                    .set("Authorization", `Bearer ${auth.access.token}`)
                    .query({ sortBy: "dataComissao", where: { userId } })
                    .expect(expectedStatus);
            })
        )
    );

    CommissionCases.permissionsUpdateAll.forEach(({ role, expected }) =>
        it(`Deveria retornar ${expected.status} ao pagar uma comissão como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            await request(server)
                .patch(ApiTestRoutes.COMMISSION_TOGGLE_SUPPLIER_PAID)
                .send({ data: { saleInvoiceId: commissionB.notaVendaId, commissionDate: commissionB.dataComissao } })
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(expected.status);

            await request(server)
                .patch(ApiTestRoutes.COMMISSION_APPROVE_MANY_ROUTE)
                .send({ data: { comissoesId: [commissionB.id] } })
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(expected.status);

            if (!expected.allowed) return;

            await request(server)
                .patch(ApiTestRoutes.PATCH_COMMISSION_ROUTE(commissionB.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(200);

            const resCommissionB = await request(server)
                .get(ApiTestRoutes.PATCH_COMMISSION_ROUTE(commissionB.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(200);

            expect(resCommissionB.body.comissaoPaga).toBe(true);
        })
    );

    it("Deveria gerar erro 400 ao tentar pagar uma comissão já paga", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        await request(server)
            .patch(ApiTestRoutes.PATCH_COMMISSION_ROUTE(commissionA.id))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .expect(400);
    });

    it("Deveria gerar erro 400 ao tentar pagar comissão inexistente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        return await request(server)
            .patch(ApiTestRoutes.PATCH_COMMISSION_ROUTE("fakeId"))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .expect(400);
    });

    it("Deveria retornar 400 ao tentar pagar comissões que não foram aprovadas", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        await request(server)
            .patch(ApiTestRoutes.COMMISSION_ROUTE)
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: { comissoesId: [commissionB.id, commissionC.id] } })
            .expect(400);
    });

    CommissionCases.permissionsUpdateAll.forEach(({ role, expected }) =>
        it(`Deveria retornar ${expected.status} ao pagar muitas comissões como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            await request(server)
                .patch(ApiTestRoutes.COMMISSION_TOGGLE_SUPPLIER_PAID)
                .send({ data: { saleInvoiceId: commissionB.notaVendaId, commissionDate: commissionB.dataComissao } })
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(expected.status);

            await request(server)
                .patch(ApiTestRoutes.COMMISSION_APPROVE_MANY_ROUTE)
                .send({ data: { comissoesId: [commissionB.id, commissionE.id] } })
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(expected.status);

            if (!expected.allowed) return;

            await request(server)
                .patch(ApiTestRoutes.COMMISSION_ROUTE)
                .send({ data: { comissoesId: [commissionB.id, commissionE.id] } })
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(204);

            const resCommissionB = await request(server)
                .get(ApiTestRoutes.PATCH_COMMISSION_ROUTE(commissionB.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(200);
            const resCommissionE = await request(server)
                .get(ApiTestRoutes.PATCH_COMMISSION_ROUTE(commissionE.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(200);

            expect(resCommissionB.body.comissaoPaga).toBe(true);
            expect(resCommissionE.body.comissaoPaga).toBe(true);
        })
    );

    it("Deveria gerar erro 400 ao tentar pagar muitas comissões com algumas já pagas", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        await request(server)
            .patch(ApiTestRoutes.COMMISSION_ROUTE)
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: { comissoesId: [commissionA.id, commissionB.id] } })
            .expect(400);
    });

    it("Deveria gerar erro 400 ao tentar pagar comissões inexistentes", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        await request(server)
            .patch(ApiTestRoutes.COMMISSION_ROUTE)
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: { comissoesId: [commissionB.id, commissionC.id, "id_fake"] } })
            .expect(400);
    });

    CommissionCases.permissionsReadAll.forEach(({ role, expected }) =>
        it(`Deveria retornar ${expected.status} ao pegar uma única comissão como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            const res = await request(server)
                .get(ApiTestRoutes.PATCH_COMMISSION_ROUTE(commissionA.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(expected.status);

            if (!expected.allowed) return;

            expect(res.body).toStrictEqual(expectToBeInCommission);
            expect(res.body.id).toBe(commissionA.id);
            expect(res.body.comissaoPaga).toBe(commissionA.comissaoPaga);
        })
    );

    it("Deveria gerar erro 404 ao pegar uma comissão inexistente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        await request(server)
            .get(ApiTestRoutes.PATCH_COMMISSION_ROUTE("fakeId"))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .expect(404);
    });

    CommissionCases.permissionsReadAll.forEach(({ role, expected }) =>
        it(`Deveria retornar ${expected.status} ao tentar gerar relatório de comissões como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            return await request(server)
                .post(ApiTestRoutes.REPORT_COMMISSION_ROUTE)
                .set("Authorization", `Bearer ${auth.access.token}`)
                .query({
                    where: {
                        gte_dataComissao: dataComAnoAtual(5, 1).toISOString(),
                        lte_dataComissao: dataComAnoAtual(5, 31).toISOString(),
                    },
                })
                .send({})
                .expect(expected.status);
        })
    );

    CommissionCases.permissionsReadAll.forEach(({ role, expected }) =>
        it(`Deveria retornar ${expected.status} ao tentar gerar relatório de algumas comissões selecionadas como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            return await request(server)
                .post(ApiTestRoutes.REPORT_COMMISSION_ROUTE)
                .set("Authorization", `Bearer ${auth.access.token}`)
                .query({
                    where: {
                        gte_dataComissao: dataComAnoAtual(5, 1).toISOString(),
                        lte_dataComissao: dataComAnoAtual(5, 30).toISOString(),
                    },
                })
                .send({ commissionsIds: [commissionA.id, commissionB.id] })
                .expect(expected.status);
        })
    );

    CommissionCases.permissionsReadByUserId.forEach(({ role, commissions }) =>
        commissions.forEach(({ expectedStatus, userId, commissionRole }) =>
            it(`Deveria retornar ${expectedStatus} ao gerar relatório filtrando por userId de ${commissionRole} como ${role}`, async () => {
                const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

                return await request(server)
                    .post(ApiTestRoutes.REPORT_COMMISSION_ROUTE)
                    .set("Authorization", `Bearer ${auth.access.token}`)
                    .query({
                        where: {
                            userId,
                            gte_dataComissao: dataComAnoAtual(5, 1).toISOString(),
                            lte_dataComissao: dataComAnoAtual(5, 31).toISOString(),
                        },
                    })
                    .expect(expectedStatus);
            })
        )
    );

    CommissionCases.permissionsReadAll.forEach(({ role, expected }) =>
        it(`Deveria retornar ${expected.status} ao buscar todas as comissões a pagar como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            const res = await request(server)
                .get(ApiTestRoutes.COMMISSION_INFO_PER_ROLE_ROUTE)
                .set("Authorization", `Bearer ${auth.access.token}`)
                .query({
                    where: {
                        gte_dataComissao: dataComAnoAtual(5, 1).toISOString(),
                        lte_dataComissao: dataComAnoAtual(5, 31).toISOString(),
                    },
                })
                .expect(expected.status);

            if (!expected.allowed) return;

            expect(res.body.length).toBe(2);

            for (const info of res.body) {
                expect(info).toStrictEqual({
                    expectedValue: expect.toBeNumber(),
                    approvedValue: expect.toBeNumber(),
                    pago: expect.toBeNumber(),
                    comissoesIdsAPagar: expect.toBeArray(),
                    user: expectToBeInUser,
                });
            }

            expect(res.body[0].user.id).toBe(salePersonA.id);
            expect(res.body[0].expectedValue).toBeCloseTo(870.308);
            expect(res.body[0].pago).toBeCloseTo(26.04);
            //expect(res.body[0].comissoesIdsAPagar).toStrictEqual([commissionG.id, commissionI.id]); //Vem em ordem diferente e gera erro

            expect(res.body[1].user.id).toBe(salePersonB.id);
            expect(res.body[1].expectedValue).toBeCloseTo(0);
            expect(res.body[1].pago).toBeCloseTo(26.04);
            expect(res.body[1].comissoesIdsAPagar).toStrictEqual([]);
        })
    );

    CommissionCases.permissionsReadByUserId.forEach(({ role, commissions }) =>
        commissions.forEach(({ expectedStatus, userId, commissionRole }) =>
            it(`Deveria retornar ${expectedStatus} ao buscar as comissões a pagar para userId de ${commissionRole} como ${role}`, async () => {
                const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

                await request(server)
                    .get(ApiTestRoutes.COMMISSION_INFO_PER_ROLE_ROUTE)
                    .set("Authorization", `Bearer ${auth.access.token}`)
                    .query({
                        where: {
                            userId,
                            gte_dataComissao: dataComAnoAtual(5, 1),
                            lte_dataComissao: dataComAnoAtual(5, 31),
                        },
                    })
                    .expect(expectedStatus);
            })
        )
    );

    CommissionCases.permissionsUpdateAll.forEach(({ role, expected }) =>
        it(`Deveria retornar ${expected.status} ao aprovar commissionamento como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            await request(server)
                .patch(ApiTestRoutes.COMMISSION_APPROVE_MANY_ROUTE)
                .set("Authorization", `Bearer ${auth.access.token}`)
                .send({ data: { comissoesId: [commissionL.id, commissionM.id, commissionN.id] } })
                .expect(expected.status);

            if (!expected.allowed) return;

            const resL = await request(server)
                .get(ApiTestRoutes.PATCH_COMMISSION_ROUTE(commissionL.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(200);

            const resM = await request(server)
                .get(ApiTestRoutes.PATCH_COMMISSION_ROUTE(commissionM.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(200);

            const resN = await request(server)
                .get(ApiTestRoutes.PATCH_COMMISSION_ROUTE(commissionN.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(200);

            const commissionLUdpated: Comissao = resL.body;
            expect(commissionLUdpated.porcentCommissionApproved).toBeCloseTo(100);
            expect(commissionLUdpated.porcentAcceleratorApproved).toBeCloseTo(0);

            const commissionMUdpated: Comissao = resM.body;
            expect(commissionMUdpated.porcentCommissionApproved).toBeCloseTo(100);
            expect(commissionMUdpated.porcentAcceleratorApproved).toBeCloseTo(0);

            const commissionNUdpated: Comissao = resN.body;
            expect(commissionNUdpated.porcentCommissionApproved).toBeCloseTo(100);
            expect(commissionNUdpated.porcentAcceleratorApproved).toBeCloseTo(0);
        })
    );

    it("Deveria retornar erro 400 ao aprovar comissão inexistente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        await request(server)
            .patch(ApiTestRoutes.COMMISSION_APPROVE_MANY_ROUTE)
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: { comissoesId: ["fake_id"] } })
            .expect(400);
    });

    it("Deveria retornar erro 400 ao aprovar comissão já paga", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        await request(server)
            .patch(ApiTestRoutes.COMMISSION_APPROVE_MANY_ROUTE)
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: { comissoesId: [commissionA.id] } })
            .expect(400);
    });

    CommissionCases.permissionsUpdateAll.forEach(({ role, expected }) =>
        it(`Deveria retornar ${expected.status} ao marcar comissão como paga pelo fornecedor como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            await request(server)
                .patch(ApiTestRoutes.COMMISSION_TOGGLE_SUPPLIER_PAID)
                .set("Authorization", `Bearer ${auth.access.token}`)
                .send({ data: { commissionDate: commissionC.dataComissao, saleInvoiceId: commissionC.notaVendaId } })
                .expect(expected.status);

            if (!expected.allowed) return;

            const resSaleInvoice = await request(server)
                .get(ApiTestRoutes.COMMISSION_ROUTE)
                .query({ where: { saleInvoiceId: commissionC.notaVendaId } })
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(200);

            const allCommissionAffected = resSaleInvoice.body.filter(
                (commission: Comissao) => commission.distributorPaid === true
            );

            expect(allCommissionAffected.length).toBe(2);
            allCommissionAffected.forEach((commission: Comissao) => {
                expect(commission.dataComissao).toBe(commissionC.dataComissao.toISOString());
            });
        })
    );

    it(`Deveria retornar 400 ao marcar comissao como paga pelo fornecedor, uma commissão já paga`, async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        await request(server)
            .patch(ApiTestRoutes.COMMISSION_TOGGLE_SUPPLIER_PAID)
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: { commissionDate: commissionA.dataComissao, saleInvoiceId: commissionA.notaVendaId } })
            .expect(400);
    });

    CommissionCases.permissionsUpdateAll.forEach(({ role, expected }) =>
        it(`Deveria retornar ${expected.status} ao marcar pago uma comissão como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            await request(server)
                .patch(ApiTestRoutes.COMMISSION_TOGGLE_SUPPLIER_PAID)
                .set("Authorization", `Bearer ${auth.access.token}`)
                .send({ data: { commissionDate: commissionC.dataComissao, saleInvoiceId: commissionC.notaVendaId } })
                .expect(expected.status);

            if (!expected.allowed) return;

            const resSaleInvoice = await request(server)
                .get(ApiTestRoutes.COMMISSION_ROUTE)
                .query({ where: { saleInvoiceId: commissionC.notaVendaId } })
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(200);

            const allCommissionAffected = resSaleInvoice.body.filter(
                (commission: Comissao) => commission.distributorPaid === true
            );

            expect(allCommissionAffected.length).toBe(2);
            allCommissionAffected.forEach((commission: Comissao) => {
                expect(commission.dataComissao).toBe(commissionC.dataComissao.toISOString());
            });
        })
    );
});
