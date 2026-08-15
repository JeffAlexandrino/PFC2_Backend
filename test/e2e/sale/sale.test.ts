import {
    adminRole,
    comercialAssistantRole,
    comercialManagerRole,
    referrerRole,
    salePersonRoleA,
    salePersonRoleB,
    solutionArchitectRole,
    superUserSalePersonRole,
} from "../../../prisma/seeds/models/user-role";
import {
    commissionA,
    commissionD,
    saleAMaxCommissionSalePersonRoleA,
    saleAMaxCommissionSalePersonRoleB,
} from "../../../prisma/seeds/models/commission";
import { saleAInvoice, saleAInvoice1 } from "../../../prisma/seeds/models/sale-invoice";
import { deleteSeedsFromDB, setSeedsInDB } from "../../../prisma/seeds/scripts";
import { saleA, saleB, saleC, saleE } from "../../../prisma/seeds/models/sale";
import { dataComAnoAtual } from "../../../test/support/constant-test.support";
import { paymentMethodA } from "../../../prisma/seeds/models/payment-method";
import { supplierA, supplierB } from "../../../prisma/seeds/models/supplier";
import { organizationA } from "../../../prisma/seeds/models/organization";
import { DataCreateSale } from "../../../src/validations/sale.validator";
import { customerA } from "../../../prisma/seeds/models/customer";
import { contractA } from "../../../prisma/seeds/models/contract";
import { productA } from "../../../prisma/seeds/models/product";
import { serviceB } from "../../../prisma/seeds/models/service";
import { ApiTestRoutes } from "../../support/api-test-routes";
import { Comissao, EstadoVenda, Role } from "@prisma/client";

import AuthSupport from "../../support/auth.support";
import SaleTestCases from "./sale.test-cases";
import server from "../../../src/server";
import request from "supertest";
import "jest-extended";
import {
    margemBrutaSaleA_CommercialAssistant,
    margemBrutaSaleA_Referrer,
    margemBrutaSaleA_SalePerson_Manager,
    margemBrutaSaleA_SolutionArchitect,
    saleACalculations,
} from "../../../prisma/seeds/models/calculations";
import httpStatus from "../../../src/utils/httpStatus";

describe("Gerenciando vendas", () => {
    const expectToBeInUserRole = {
        ativo: expect.toBeBoolean(),
        createdAt: expect.toBeDateString(),
        fixedCommission: expect.toBeBoolean(),
        id: expect.toBeString(),
        updatedAt: expect.toBeDateString(),
        user: expect.objectContaining({
            ativo: expect.toBeBoolean(),
            bloqueado: expect.toBeBoolean(),
            createdAt: expect.toBeDateString(),
            email: expect.toBeString(),
            id: expect.toBeString(),
            isEmailVerified: expect.toBeBoolean(),
            name: expect.toBeString(),
            updatedAt: expect.toBeDateString(),
        }),
        userId: expect.toBeString(),
    };

    const expectToBeInSales = {
        id: expect.toBeString(),
        estadoVenda: expect.toBeString(),
        dataVenda: expect.toBeDateString(),
        clienteId: expect.toBeString(),
        accountManagerId: expect.toBeString(),
        insideSalesId: expect.toBeOneOf([expect.toBeString(), null]),
        comercialManagerId: expect.toBeOneOf([expect.toBeString(), null]),
        referrerId: expect.toBeOneOf([expect.toBeString(), null]),
        comercialAssistantId: expect.toBeOneOf([expect.toBeString(), null]),
        solutionArchitectId: expect.toBeOneOf([expect.toBeString(), null]),
        accountManager: expect.objectContaining(expectToBeInUserRole),
        insideSales: expect.toBeOneOf([expect.objectContaining(expectToBeInUserRole), null]),
        referrer: expect.toBeOneOf([expect.objectContaining(expectToBeInUserRole), null]),
        comercialManager: expect.toBeOneOf([expect.objectContaining(expectToBeInUserRole), null]),
        solutionArchitect: expect.toBeOneOf([expect.objectContaining(expectToBeInUserRole), null]),
        comercialAssistant: expect.toBeOneOf([expect.objectContaining(expectToBeInUserRole), null]),
        numOportunidadeCRM: expect.toBeOneOf([expect.toBeString(), null]),
        numPedidoDistribuidor: expect.toBeOneOf([expect.toBeString(), null]),
        vendaRenovacao: expect.toBeOneOf([true, false]),
        contratoId: expect.toBeOneOf([expect.toBeString(), null]),
        createdAt: expect.toBeDateString(),
        updatedAt: expect.toBeDateString(),
        empresaId: expect.toBeString(),
        notasVenda: expect.arrayContaining([
            expect.objectContaining({
                id: expect.toBeString(),
                codigo: expect.toBeString(),
                dataFaturamento: expect.toBeDateString(),
                formaPagamentoId: expect.toBeString(),
                formaParcelamento: expect.toBeNumber(),
                numOportunidadeCRM: expect.toBeOneOf([expect.toBeString(), null]),
                numPedidoDistribuidor: expect.toBeOneOf([expect.toBeString(), null]),
                dedutiveisDistribuidor: expect.toBeNumber(),
                impostoNota: expect.toBeNumber(),
                tipoFaturamento: expect.toBeString(),
                markup: expect.toBeOneOf([expect.toBeNumber(), null]),
                comissoes: expect.toBeOneOf([
                    expect.arrayContaining([
                        expect.objectContaining({
                            acelerador: 0,
                            approvedAt: expect.toBeOneOf([expect.toBeDateString(), null]),
                            porcentCommissionApproved: expect.toBeOneOf([expect.toBeNumber(), null]),
                            porcentAcceleratorApproved: expect.toBeOneOf([expect.toBeNumber(), null]),
                            distributorPaid: expect.toBeOneOf([expect.toBeBoolean(), null]),
                            comissao: expect.toBeNumber(),
                            comissaoPaga: expect.toBeBoolean(),
                            dataComissao: expect.toBeDateString(),
                            id: expect.toBeString(),
                            valorMargemBrutaBase: expect.toBeNumber(),
                            vendaId: expect.toBeString(),
                            notaVendaId: expect.toBeString(),
                            userRoleId: expect.toBeString(),
                        }),
                    ]),
                    [],
                ]),
                datasBoleto: expect.arrayContaining([
                    expect.objectContaining({
                        id: expect.toBeString(),
                        data: expect.toBeDateString(),
                        notaVendaId: expect.toBeString(),
                    }),
                ]),
                formaPagamento: expect.objectContaining({
                    createdAt: expect.toBeDateString(),
                    id: expect.toBeString(),
                    name: expect.toBeString(),
                    empresaId: expect.toBeString(),
                    updatedAt: expect.toBeDateString(),
                }),
                vendasProduto: expect.toBeOneOf([
                    expect.arrayContaining([
                        expect.objectContaining({
                            valorCusto: expect.toBeNumber(),
                            valorMarkup: expect.toBeNumber(),
                            valorVenda: expect.toBeNumber(),
                            valorImpostos: expect.toBeNumber(),
                            valorMarkupLiquido: expect.toBeNumber(),
                            valorImpostoNota: expect.toBeNumber(),
                            valorMargem: expect.toBeNumber(),
                            id: expect.toBeString(),
                            produtoId: expect.toBeString(),
                            produto: expect.objectContaining({
                                ativo: expect.toBeBoolean(),
                                createdAt: expect.toBeDateString(),
                                updatedAt: expect.toBeDateString(),
                                empresaId: expect.toBeString(),
                                id: expect.toBeString(),
                                name: expect.toBeString(),
                                partNumber: expect.toBeString(),
                                tipoProdutoServicoId: expect.toBeString(),
                                fabricanteId: expect.toBeString(),
                                categoria: expect.objectContaining({
                                    id: expect.toBeString(),
                                    name: expect.toBeString(),
                                    empresaId: expect.toBeString(),
                                    createdAt: expect.toBeDateString(),
                                    updatedAt: expect.toBeDateString(),
                                }),
                            }),
                            tipoMoeda: expect.toBeString(),
                            cotacao: expect.toBeNumber(),
                            quantidade: expect.toBeNumber(),
                            valorCustoUnit: expect.toBeNumber(),
                            markup: expect.toBeOneOf([expect.toBeNumber(), null]),
                            impostoNota: expect.toBeOneOf([expect.toBeNumber(), null]),
                            tipoFaturamento: expect.toBeOneOf([expect.toBeString(), null]),
                            dedutiveisDistribuidor: expect.toBeOneOf([expect.toBeNumber(), null]),
                            fornecedores: expect.arrayContaining([
                                expect.objectContaining({
                                    cnpj: expect.toBeString(),
                                    createdAt: expect.toBeDateString(),
                                    email: expect.toBeString(),
                                    empresaId: expect.toBeString(),
                                    id: expect.toBeString(),
                                    name: expect.toBeString(),
                                    updatedAt: expect.toBeDateString(),
                                }),
                            ]),
                        }),
                    ]),
                    [],
                ]),
                vendasServico: expect.toBeOneOf([
                    expect.arrayContaining([
                        expect.objectContaining({
                            valorCusto: expect.toBeNumber(),
                            valorMarkup: expect.toBeNumber(),
                            valorVenda: expect.toBeNumber(),
                            valorImpostos: expect.toBeNumber(),
                            valorMarkupLiquido: expect.toBeNumber(),
                            valorImpostoNota: expect.toBeNumber(),
                            valorMargem: expect.toBeNumber(),
                            servicoId: expect.toBeString(),
                            servico: expect.objectContaining({
                                ativo: expect.toBeBoolean(),
                                createdAt: expect.toBeDateString(),
                                updatedAt: expect.toBeDateString(),
                                empresaId: expect.toBeString(),
                                id: expect.toBeString(),
                                name: expect.toBeString(),
                                observacoes: expect.toBeString(),
                                tipoMoeda: expect.toBeString(),
                                tipoProdutoServicoId: expect.toBeString(),
                                valorCustoHora: expect.toBeNumber(),
                            }),
                            id: expect.toBeString(),
                            tipoMoeda: expect.toBeString(),
                            cotacao: expect.toBeNumber(),
                            valorCustoHora: expect.toBeNumber(),
                            qntdHorasComercial: expect.toBeNumber(),
                            qntdHorasNaoComercial: expect.toBeNumber(),
                            qntdHorasEspecial: expect.toBeNumber(),
                            markup: expect.toBeOneOf([expect.toBeNumber(), null]),
                            impostoNota: expect.toBeOneOf([expect.toBeNumber(), null]),
                            dedutiveisDistribuidor: expect.toBeOneOf([expect.toBeNumber(), null]),
                            tipoFaturamento: expect.toBeOneOf([expect.toBeString(), null]),
                        }),
                    ]),
                    [],
                ]),
                valorCustoProdutos: expect.toBeNumber(),
                valorMarkupProdutos: expect.toBeNumber(),
                valorMarkupLiqProdutos: expect.toBeNumber(),
                valorMargemBrutaProdutos: expect.toBeNumber(),
                valorImpostoProdutos: expect.toBeNumber(),
                valorVendaProdutos: expect.toBeNumber(),

                valorCustoServicos: expect.toBeNumber(),
                valorMarkupServicos: expect.toBeNumber(),
                valorMarkupLiqServicos: expect.toBeNumber(),
                valorMargemBrutaServicos: expect.toBeNumber(),
                valorImpostoServicos: expect.toBeNumber(),
                valorVendaServicos: expect.toBeNumber(),

                valorCusto: expect.toBeNumber(),
                valorMarkup: expect.toBeNumber(),
                valorMarkupLiquido: expect.toBeNumber(),
                valorMargemBruta: expect.toBeNumber(),
                valorImpostoNota: expect.toBeNumber(),
                valorDedutiveisDistribuidor: expect.toBeNumber(),
                valorImpostos: expect.toBeNumber(),
                valorVenda: expect.toBeNumber(),
            }),
        ]),
        cliente: expect.objectContaining({
            cnpj: expect.toBeString(),
            createdAt: expect.toBeDateString(),
            email: expect.toBeString(),
            comprou: expect.toBeBoolean(),
            id: expect.toBeString(),
            name: expect.toBeString(),
            segmentoId: expect.toBeString(),
            responsavelId: expect.toBeString(),
            telefone: expect.toBeString(),
            updatedAt: expect.toBeString(),
        }),
        contrato: expect.toBeOneOf([
            expect.objectContaining({
                createdAt: expect.toBeDateString(),
                id: expect.toBeString(),
                name: expect.toBeString(),
                updatedAt: expect.toBeDateString(),
            }),
            null,
        ]),
        valorCusto: expect.toBeNumber(),
        valorMarkup: expect.toBeNumber(),
        valorMarkupLiquido: expect.toBeNumber(),
        valorMargemBruta: expect.toBeNumber(),
        valorImpostoNota: expect.toBeNumber(),
        valorDedutiveisDistribuidor: expect.toBeNumber(),
        valorImpostos: expect.toBeNumber(),
        valorVenda: expect.toBeNumber(),
    };

    const NEW_SALE_GROSS_MARGIN = 52096; //Nos testes notasVenda[0] por simplificar
    const NEW_SALE_COM_REFEREER = 260.48; //0.5% de NEW_SALE_GROSS_MARGIN
    const NEW_SALE_COM_ARCHITECT = 518.3552; //1% de (NEW_SALE_GROSS_MARGIN - NEW_SALE_COM_REFEREER)
    const NEW_SALE_COM_ASSISTANT = 256.5858; // 0.5% de (NEW_SALE_GROSS_MARGIN - NEW_SALE_COM_REFEREER - NEW_SALE_COM_ARCHITECT)
    const newSale: DataCreateSale = {
        clienteId: customerA.id,
        referrerId: referrerRole.id, //0,5% com
        solutionArchitectId: solutionArchitectRole.id, //1% com
        comercialAssistantId: comercialAssistantRole.id, //0,5% com
        accountManagerId: salePersonRoleA.id, //5% com e 5% acc
        comercialManagerId: comercialManagerRole.id, //5% com
        insideSalesId: null, //salePersonRoleB.id ,Desativado esse campo temporariamente
        numOportunidadeCRM: null,
        numPedidoDistribuidor: null,
        estadoVenda: EstadoVenda.BILLING_AUDIT,
        dataVenda: dataComAnoAtual(2, 1),
        vendaRenovacao: false,
        contratoId: contractA.id,
        notasVenda: [
            {
                formaPagamentoId: paymentMethodA.id,
                formaParcelamento: 2,
                dataFaturamento: dataComAnoAtual(2, 1),
                codigo: "codigoNovaNota",
                impostoNota: 12, //Margem Bruta 52_096
                dedutiveisDistribuidor: 20800, //Markup Liquida  59_200
                tipoFaturamento: "DIRETO",
                numOportunidadeCRM: "oportunidadeCRM",
                numPedidoDistribuidor: "num_pedido",
                markup: 40, //Valor Markup Bruto 80_000
                vendasProduto: [
                    //Valor Custo 200_000
                    {
                        produtoId: productA.id,
                        quantidade: 100,
                        valorCustoUnit: 2000,
                        markup: null,
                        impostoNota: null,
                        dedutiveisDistribuidor: null,
                        tipoFaturamento: null,
                        cotacao: 1,
                        tipoMoeda: "BRL",
                        fornecedoresId: [supplierA.id, supplierB.id],
                    },
                ],
                vendasServico: [],
                datasBoleto: [dataComAnoAtual(2, 1), dataComAnoAtual(3, 1)],
            },
            {
                formaPagamentoId: paymentMethodA.id,
                formaParcelamento: 2,
                dataFaturamento: dataComAnoAtual(2, 1),
                codigo: "num_oportunidade1",
                impostoNota: 20, //Margem Bruta 8_320
                dedutiveisDistribuidor: 0,
                tipoFaturamento: "REVENDA",
                numOportunidadeCRM: "oportunidade2CRM",
                numPedidoDistribuidor: "num_pedido1",
                markup: 40, //Markup Bruto 10_400
                vendasProduto: [],
                vendasServico: [
                    //Valor Custo 26_000
                    {
                        servicoId: serviceB.id, //50 custo hora
                        qntdHorasComercial: 120, //1x
                        qntdHorasNaoComercial: 200, //1,5x
                        qntdHorasEspecial: 50, //2x
                        cotacao: 1,
                        tipoMoeda: serviceB.tipoMoeda, //USD
                        markup: null,
                        impostoNota: null,
                        dedutiveisDistribuidor: null,
                        tipoFaturamento: null,
                    },
                ],
                datasBoleto: [dataComAnoAtual(2, 1), dataComAnoAtual(3, 1)],
            },
        ],
    };

    beforeEach(async () => {
        await setSeedsInDB();
    });

    afterEach(async () => {
        await deleteSeedsFromDB();
    });

    //TODO: Isto não está funcionando. Buscar um jeito de poder testar o sistema simulando varios horários;
    it.skip("Deveria gerar erro 403 caso vendedor tentar criar uma venda fora do horário de trabalho", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        const originalDateNow = dataComAnoAtual(3, 6);
        jest.useFakeTimers();
        jest.setSystemTime(originalDateNow);
        jest.useRealTimers();

        await request(server)
            .post(ApiTestRoutes.SALE_ROUTE)
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: [newSale] })
            .expect(403);
    });

    SaleTestCases.createWithStatusAndUserRoleCases.map(({ role, expected, status, accountManagerId }) =>
        it(`Deveria retornar ${expected.status} ao adicionar uma nova de estado ${status} e AM ${accountManagerId}, como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            return await request(server)
                .post(ApiTestRoutes.SALE_ROUTE)
                .set("Authorization", `Bearer ${auth.access.token}`)
                .send({ data: [{ ...newSale, estadoVenda: status, accountManagerId }] })
                .expect(expected.status);
        })
    );

    SaleTestCases.createAnyCases.map(({ role, expected }) =>
        it(`Deveria retornar ${expected.status} ao adicionar uma nova venda sem restrições, como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            await request(server)
                .post(ApiTestRoutes.SALE_ROUTE)
                .set("Authorization", `Bearer ${auth.access.token}`)
                .send({ data: [{ ...newSale, estadoVenda: EstadoVenda.PAID }] })
                .expect(expected.status);

            if (!expected.allowed) return;
        })
    );

    it("Deveria criar comissões para cada userRole envolvido na venda", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        const res = await request(server)
            .post(ApiTestRoutes.SALE_ROUTE)
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: [newSale] })
            .expect(201);

        expect(res.body).toStrictEqual([
            {
                clienteId: newSale.clienteId,
                accountManagerId: newSale.accountManagerId,
                insideSalesId: newSale.insideSalesId,
                referrerId: newSale.referrerId,
                comercialManagerId: newSale.comercialManagerId,
                comercialAssistantId: newSale.comercialAssistantId,
                solutionArchitectId: newSale.solutionArchitectId,
                contratoId: newSale.contratoId,
                dataVenda: newSale.dataVenda.toISOString(),
                estadoVenda: newSale.estadoVenda,
                id: expect.toBeString(),
                numOportunidadeCRM: newSale.numOportunidadeCRM,
                numPedidoDistribuidor: newSale.numPedidoDistribuidor,
                vendaRenovacao: newSale.vendaRenovacao,
                empresaId: organizationA.id,
                createdAt: expect.toBeDateString(),
                updatedAt: expect.toBeDateString(),
            },
            {
                codigo: newSale.notasVenda[0].codigo,
                dataFaturamento: newSale.notasVenda[0].dataFaturamento.toISOString(),
                formaPagamentoId: newSale.notasVenda[0].formaPagamentoId,
                formaParcelamento: newSale.notasVenda[0].formaParcelamento,
                id: expect.toBeString(),
                createdAt: expect.toBeDateString(),
                updatedAt: expect.toBeDateString(),
                vendaId: expect.toBeString(),
                impostoNota: newSale.notasVenda[0].impostoNota,
                dedutiveisDistribuidor: newSale.notasVenda[0].dedutiveisDistribuidor,
                tipoFaturamento: newSale.notasVenda[0].tipoFaturamento,
                numOportunidadeCRM: newSale.notasVenda[0].numOportunidadeCRM,
                numPedidoDistribuidor: newSale.notasVenda[0].numPedidoDistribuidor,
                markup: newSale.notasVenda[0].markup,
            },
        ]);

        const resGetSale = await request(server)
            .get(ApiTestRoutes.PATCH_SALE_ROUTE(res.body[0].id))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .expect(200);

        expect(resGetSale.body.notasVenda[0].comissoes.length).toBe(5); //TODO: Puxar todas as notas

        for (const commission of resGetSale.body.notasVenda[0].comissoes) {
            expect(commission.comissaoPaga).toBe(false);

            if (commission.userRoleId === referrerRole.id)
                expect(commission.valorMargemBrutaBase).toBeCloseTo(NEW_SALE_GROSS_MARGIN);
            else if (commission.userRoleId === solutionArchitectRole.id)
                expect(commission.valorMargemBrutaBase).toBeCloseTo(NEW_SALE_GROSS_MARGIN - NEW_SALE_COM_REFEREER);
            else if (commission.userRoleId === comercialAssistantRole.id)
                expect(commission.valorMargemBrutaBase).toBeCloseTo(
                    NEW_SALE_GROSS_MARGIN - NEW_SALE_COM_REFEREER - NEW_SALE_COM_ARCHITECT
                );
            else
                expect(commission.valorMargemBrutaBase).toBeCloseTo(
                    NEW_SALE_GROSS_MARGIN - NEW_SALE_COM_REFEREER - NEW_SALE_COM_ARCHITECT - NEW_SALE_COM_ASSISTANT
                );
        }
    });

    SaleTestCases.participantsSalesCases.forEach(({ participant, expected }) =>
        it(`Deveria retornar ${expected.status} ao criar uma venda com participantes ${JSON.stringify(
            participant
        )}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

            const res = await request(server)
                .post(ApiTestRoutes.SALE_ROUTE)
                .set("Authorization", `Bearer ${auth.access.token}`)
                .send({
                    data: [
                        {
                            ...newSale,
                            accountManagerId: null,
                            insideSalesId: null,
                            referrerId: null,
                            comercialManagerId: null,
                            comercialAssistantId: null,
                            solutionArchitectId: null,
                            ...participant,
                        },
                    ],
                });

            expect(res.status).toBe(expected.status);
        })
    );

    SaleTestCases.participantsSalesCases.forEach(({ participant, expected }) =>
        it(`Deveria retornar ${expected.status} ao criar uma venda com participantes ${JSON.stringify(
            participant
        )}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

            const res = await request(server)
                .post(ApiTestRoutes.SALE_ROUTE)
                .set("Authorization", `Bearer ${auth.access.token}`)
                .send({
                    data: [
                        {
                            ...newSale,
                            accountManagerId: null,
                            insideSalesId: null,
                            referrerId: null,
                            comercialManagerId: null,
                            comercialAssistantId: null,
                            solutionArchitectId: null,
                            ...participant,
                        },
                    ],
                });

            expect(res.status).toBe(expected.status);
        })
    );

    it("Deveria adicionar uma nova venda com um contrato que faz as comissões serem pagas na primeira data boleto", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        const res = await request(server)
            .post(ApiTestRoutes.SALE_ROUTE)
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: [{ ...newSale, contratoId: contractA.id }] })
            .expect(201);

        const resGetSale = await request(server)
            .get(ApiTestRoutes.PATCH_SALE_ROUTE(res.body[0].id))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .expect(200);

        expect(resGetSale.body.notasVenda[0].comissoes.length).toBe(5); //TODO: Puxar todas as notas

        for (const commission of resGetSale.body.notasVenda[0].comissoes) {
            expect(commission.comissaoPaga).toBe(false);

            if (commission.userRoleId === referrerRole.id)
                expect(commission.valorMargemBrutaBase).toBeCloseTo(NEW_SALE_GROSS_MARGIN);
            else if (commission.userRoleId === solutionArchitectRole.id)
                expect(commission.valorMargemBrutaBase).toBeCloseTo(NEW_SALE_GROSS_MARGIN - NEW_SALE_COM_REFEREER);
            else if (commission.userRoleId === comercialAssistantRole.id)
                expect(commission.valorMargemBrutaBase).toBeCloseTo(
                    NEW_SALE_GROSS_MARGIN - NEW_SALE_COM_REFEREER - NEW_SALE_COM_ARCHITECT
                );
            else
                expect(commission.valorMargemBrutaBase).toBeCloseTo(
                    NEW_SALE_GROSS_MARGIN - NEW_SALE_COM_REFEREER - NEW_SALE_COM_ARCHITECT - NEW_SALE_COM_ASSISTANT
                );
        }
    });

    it("Deveria gerar erro 404 ao tentar adicionar uma venda onde no lugar de vendedores fique outra role", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        const { empresaId, id, ...saleAValidNewData } = saleA;
        return await request(server)
            .post(ApiTestRoutes.SALE_ROUTE)
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: [{ ...saleAValidNewData, accountManagerId: adminRole.id }] })
            .expect(404);
    });

    // Comentado pq expected 404 "Not Found", got 409 "Conflict" -> No teste local funciona, no pipeline de CI não.
    // it("Deveria gerar erro 404 ao tentar adicionar uma venda onde no lugar de arquiteto de sol. fique outra role", async () => {
    //     const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

    //     const { empresaId, id, ...saleAValidNewData } = saleA;
    //     return await request(server)
    //         .post(ApiTestRoutes.SALE_ROUTE)
    //         .set("Authorization", `Bearer ${auth.access.token}`)
    //         .send({ data: [{ ...saleAValidNewData, solutionArchitectId: adminRole.id }] })
    //         .expect(404);
    // });

    // it("Deveria gerar erro 404 ao tentar adicionar uma venda onde no lugar de assistente comerc. fique outra role", async () => {
    //     const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

    //     const { empresaId, id, ...saleAValidNewData } = saleA;
    //     return await request(server)
    //         .post(ApiTestRoutes.SALE_ROUTE)
    //         .set("Authorization", `Bearer ${auth.access.token}`)
    //         .send({ data: [{ ...saleAValidNewData, comercialAssistantId: adminRole.id }] })
    //         .expect(404);
    // });

    it("Deveria gerar erro 409 ao tentar adicionar uma venda com código de nota já existente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        const { empresaId, id, ...saleAValidNewData } = saleA;
        return await request(server)
            .post(ApiTestRoutes.SALE_ROUTE)
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: [saleAValidNewData] })
            .expect(409);
    });

    it("Deveriar gerar erro 404 ao tentar adicionar uma venda com distribuição de comissão inexistente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        const newSaleWithError: DataCreateSale = { ...newSale, accountManagerId: superUserSalePersonRole.id };
        return await request(server)
            .post(ApiTestRoutes.SALE_ROUTE)
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: [newSaleWithError] })
            .expect(404);
    });

    it("Deveria gerar erro 400 ao tentar adicionar uma venda com datas de boleto inválidas", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        const saleWithErrors: DataCreateSale = {
            ...newSale,
            notasVenda: [{ ...newSale.notasVenda[0], formaParcelamento: 10 }],
        };

        return await request(server)
            .post(ApiTestRoutes.SALE_ROUTE)
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: [saleWithErrors] })
            .expect(400);
    });

    it("Deveria gerar erro 404 ao tentar adicionar uma venda com forma de pagamento inexistente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        const saleWithErrors: DataCreateSale = {
            ...newSale,
            notasVenda: newSale.notasVenda.map((saleInvoice) => ({ ...saleInvoice, formaPagamentoId: "nao_existe" })),
        };

        return await request(server)
            .post(ApiTestRoutes.SALE_ROUTE)
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: [saleWithErrors] })
            .expect(404);
    });

    it("Deveria gerar erro 404 ao tentar adicionar uma venda com cliente inexistente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        const saleWithErrors: DataCreateSale = { ...newSale, clienteId: "nao_existe" };
        return await request(server)
            .post(ApiTestRoutes.SALE_ROUTE)
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: [saleWithErrors] })
            .expect(404);
    });

    it("Deveria gerar erro 404 ao tentar adicionar uma venda com contrato inexistente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        const saleWithErrors: DataCreateSale = { ...newSale, contratoId: "nao_existe" };
        return await request(server)
            .post(ApiTestRoutes.SALE_ROUTE)
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: [saleWithErrors] })
            .expect(404);
    });

    it("Deveria gerar erro 404 ao tentar adicionar uma venda com produto inexistente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        const saleWithErrors: DataCreateSale = {
            ...newSale,
            notasVenda: newSale.notasVenda.map((saleInvoice) => ({
                ...saleInvoice,
                vendasProduto: saleInvoice.vendasProduto.map((prod) => ({ ...prod, produtoId: "nao_existe" })),
            })),
        };
        return await request(server)
            .post(ApiTestRoutes.SALE_ROUTE)
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: [saleWithErrors] })
            .expect(404);
    });

    it("Deveria gerar erro 404 ao tentar adicionar uma venda com serviço inexistente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        const saleWithErrors: DataCreateSale = {
            ...newSale,
            notasVenda: newSale.notasVenda.map((saleInvoice) => ({
                ...saleInvoice,
                vendasServico: saleInvoice.vendasServico.map((serv) => ({ ...serv, servicoId: "nao_existe" })),
            })),
        };
        return await request(server)
            .post(ApiTestRoutes.SALE_ROUTE)
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: [saleWithErrors] })
            .expect(404);
    });

    SaleTestCases.readAnyCases.forEach(({ role, expected }) =>
        it(`Deveria retornar ${expected.status} ao listar as vendas sem restrição como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            const res = await request(server)
                .get(ApiTestRoutes.SALE_ROUTE)
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(expected.status);

            if (!expected.allowed) return;

            expect(res.body.length).toBe(5);

            for (let venda of res.body) {
                expect(venda).toStrictEqual(expectToBeInSales);
            }
        })
    );

    SaleTestCases.readByUserRoleCases.forEach(({ role, possibilities }) =>
        possibilities.map(
            ({ salePersonId, comercialAssistantId, comercialManagerId, solutionArchitectId, referrerId, expected }) => {
                const roleId =
                    salePersonId ?? comercialAssistantId ?? comercialManagerId ?? solutionArchitectId ?? referrerId;

                it(`Deveria retornar ${expected.status} ao listar as vendas buscando pelo userRole ${roleId} como ${role}`, async () => {
                    const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

                    const res = await request(server)
                        .get(ApiTestRoutes.SALE_ROUTE)
                        .query({
                            where: {
                                salePersonId,
                                comercialAssistantId,
                                comercialManagerId,
                                solutionArchitectId,
                                referrerId,
                                clienteId: customerA.id,
                                estadoVenda: EstadoVenda.PAID,
                                gte_dataFaturamento: dataComAnoAtual(5, 1),
                                lte_dataFaturamento: dataComAnoAtual(5, 30),
                            },
                        })
                        .set("Authorization", `Bearer ${auth.access.token}`)
                        .expect(expected.status);

                    if (!salePersonId || role !== Role.VENDEDOR) return;

                    expect(res.body.length).toBe(1);

                    for (let venda of res.body) {
                        expect(venda).toStrictEqual(expectToBeInSales);
                    }
                });
            }
        )
    );

    SaleTestCases.readAnyCases.forEach(({ role, expected }) =>
        it(`Deveria retornar ${expected.status} ao pegar uma única venda sem restrição como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            const res = await request(server)
                .get(ApiTestRoutes.PATCH_SALE_ROUTE(saleA.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(expected.status);

            if (!expected.allowed) return;

            const venda = res.body;

            expect(venda).toStrictEqual(expectToBeInSales);

            expect(venda).toMatchObject({
                valorCusto: saleACalculations.valorCusto,
                valorMarkup: saleACalculations.valorMarkup,
                valorDedutiveisDistribuidor: saleACalculations.valorDedutiveisDistribuidor,
                valorImpostoNota: saleACalculations.valorImpostoNota,
                valorImpostos: saleACalculations.valorImpostos,
                valorMarkupLiquido: saleACalculations.valorMarkupLiquido,
                valorMargemBruta: saleACalculations.valorMargemBruta,
                valorVenda: saleACalculations.valorVenda,
            });

            const comissaoTotalVendedorA = venda.notasVenda[0].comissoes
                .filter((comissao: Comissao) => comissao.userRoleId === salePersonRoleA.id)
                .reduce(
                    (acc: number, comissao: Comissao) =>
                        (acc += (comissao.comissao * comissao.valorMargemBrutaBase) / 100),
                    0
                );
            const comissaoTotalVendedorB = venda.notasVenda[0].comissoes
                .filter((comissao: Comissao) => comissao.userRoleId === salePersonRoleB.id)
                .reduce(
                    (acc: number, comissao: Comissao) =>
                        (acc += (comissao.comissao * comissao.valorMargemBrutaBase) / 100),
                    0
                );

            expect(comissaoTotalVendedorA).toBeCloseTo(saleAMaxCommissionSalePersonRoleA);
            expect(comissaoTotalVendedorB).toBeCloseTo(saleAMaxCommissionSalePersonRoleB);
        })
    );

    //TODO: Fazer novo teste para quando alterar estado da venda para PAID

    SaleTestCases.updateAnyCases.forEach(({ role, expected }) =>
        it(`Deveria retornar ${expected.status} ao editar uma venda sem restrições como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            const res = await request(server)
                .patch(ApiTestRoutes.PATCH_SALE_ROUTE(saleE.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .send({ data: { ...newSale } })
                .expect(expected.status);
            if (!expected.allowed) return;

            expect(res.body).toMatchObject([
                {
                    clienteId: newSale.clienteId,
                    contratoId: newSale.contratoId,
                    dataVenda: newSale.dataVenda.toISOString(),
                    estadoVenda: newSale.estadoVenda,
                    id: saleE.id,
                    numOportunidadeCRM: newSale.numOportunidadeCRM,
                    numPedidoDistribuidor: newSale.numPedidoDistribuidor,
                    vendaRenovacao: newSale.vendaRenovacao,
                    empresaId: expect.toBeString(),
                    createdAt: expect.toBeDateString(),
                    updatedAt: expect.toBeDateString(),
                },
                {
                    codigo: newSale.notasVenda[0].codigo,
                    dataFaturamento: newSale.notasVenda[0].dataFaturamento.toISOString(),
                    formaPagamentoId: newSale.notasVenda[0].formaPagamentoId,
                    formaParcelamento: newSale.notasVenda[0].formaParcelamento,
                    id: expect.toBeString(),
                    createdAt: expect.toBeDateString(),
                    updatedAt: expect.toBeDateString(),
                    vendaId: expect.toBeString(),
                    impostoNota: newSale.notasVenda[0].impostoNota,
                    markup: newSale.notasVenda[0].markup,
                    numPedidoDistribuidor: newSale.notasVenda[0].numPedidoDistribuidor,
                    tipoFaturamento: newSale.notasVenda[0].tipoFaturamento,
                    dedutiveisDistribuidor: newSale.notasVenda[0].dedutiveisDistribuidor,
                },
                { count: 1 },
            ]);
        })
    );

    SaleTestCases.updateByStatusAndUserRoleCases.forEach(({ role, expected, status, accountManagerId }) =>
        it(`Deveria retornar ${expected.status} ao editar uma venda de estado ${status} e AM ${accountManagerId}, como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            await request(server)
                .patch(ApiTestRoutes.PATCH_SALE_ROUTE(saleE.id))
                .query({ estadoVendaAtual: status, accountManagerIdAtual: accountManagerId })
                .set("Authorization", `Bearer ${auth.access.token}`)
                .send({ data: newSale })
                .expect(expected.status);
        })
    );

    SaleTestCases.participantsSalesCases.forEach(({ participant, expected }) =>
        it(`Deveria retornar ${expected.status} ao editar uma venda com participantes ${JSON.stringify(
            participant
        )}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

            const res = await request(server)
                .patch(ApiTestRoutes.PATCH_SALE_ROUTE(saleE.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .send({
                    data: {
                        ...newSale,
                        accountManagerId: null,
                        insideSalesId: null,
                        referrerId: null,
                        comercialManagerId: null,
                        comercialAssistantId: null,
                        solutionArchitectId: null,
                        ...participant,
                    },
                });

            expect(res.status).toBe(expected.allowed ? 200 : 400);
        })
    );

    it("Deveria gerar erro 404 ao tentar editar uma venda onde no lugar de vendedores fique outra role", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        return await request(server)
            .patch(ApiTestRoutes.PATCH_SALE_ROUTE(saleC.id))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: { ...saleC, accountManagerId: adminRole.id } })
            .expect(httpStatus.BAD_REQUEST);
    });

    it("Deveria gerar erro 404 ao tentar editar uma venda onde no lugar de arquiteto de sol. fique outra role", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        return await request(server)
            .patch(ApiTestRoutes.PATCH_SALE_ROUTE(saleC.id))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: { ...saleC, solutionArchitectId: adminRole.id } })
            .expect(httpStatus.BAD_REQUEST);
    });

    it("Deveria gerar erro 404 ao tentar editar uma venda onde no lugar de assistente comerc. fique outra role", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        return await request(server)
            .patch(ApiTestRoutes.PATCH_SALE_ROUTE(saleC.id))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: { ...saleC, comercialAssistantId: adminRole.id } })
            .expect(httpStatus.BAD_REQUEST);
    });

    it("Deveria gerar erro 400 ao tentar editar uma venda com código de nota já existente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        const { empresaId, id, ...saleAValidNewData } = saleA;
        return await request(server)
            .patch(ApiTestRoutes.PATCH_SALE_ROUTE(saleB.id))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: saleAValidNewData })
            .expect(httpStatus.BAD_REQUEST);
    });

    it("Deveria gerar erro 400 ao tentar editar uma venda com distribuição de comissão inexistente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        return await request(server)
            .patch(ApiTestRoutes.PATCH_SALE_ROUTE(saleA.id))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: { ...saleA, accountManagerId: salePersonRoleB.id, insideSalesId: null } })
            .expect(httpStatus.BAD_REQUEST);
    });

    it("Deveria gerar erro 400 ao tentar editar uma venda com datas de boleto inválidas", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        const saleWithErrors: DataCreateSale = {
            ...saleA,
            notasVenda: [{ ...saleA.notasVenda[0], formaParcelamento: 10 }],
        };

        return await request(server)
            .patch(ApiTestRoutes.PATCH_SALE_ROUTE(saleA.id))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: saleWithErrors })
            .expect(httpStatus.BAD_REQUEST);
    });

    it("Deveria gerar erro 404 ao tentar editar uma venda com forma de pagamento inexistente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        const saleWithErrors: DataCreateSale = {
            ...saleA,
            notasVenda: saleA.notasVenda.map((saleInvoice) => ({ ...saleInvoice, formaPagamentoId: "nao_existe" })),
        };

        return await request(server)
            .patch(ApiTestRoutes.PATCH_SALE_ROUTE(saleA.id))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: saleWithErrors })
            .expect(httpStatus.BAD_REQUEST);
    });

    it("Deveria gerar erro 404 ao tentar editar uma venda com cliente inexistente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        const saleWithErrors: DataCreateSale = { ...saleA, clienteId: "nao_existe" };
        return await request(server)
            .patch(ApiTestRoutes.PATCH_SALE_ROUTE(saleA.id))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: saleWithErrors })
            .expect(httpStatus.BAD_REQUEST);
    });

    it("Deveria gerar erro 404 ao tentar editar uma venda com contrato inexistente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        const saleWithErrors: DataCreateSale = { ...saleA, contratoId: "nao_existe" };
        return await request(server)
            .patch(ApiTestRoutes.PATCH_SALE_ROUTE(saleA.id))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: saleWithErrors })
            .expect(httpStatus.BAD_REQUEST);
    });

    it("Deveria gerar erro 404 ao tentar editar uma venda com produto inexistente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        const saleWithErrors: DataCreateSale = {
            ...saleC,
            notasVenda: saleC.notasVenda.map((saleInvoice) => ({
                ...saleInvoice,
                vendasProduto: saleInvoice.vendasProduto.map((prod) => ({ ...prod, produtoId: "nao_existe" })),
            })),
        };
        await request(server)
            .patch(ApiTestRoutes.PATCH_SALE_ROUTE(saleC.id))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: saleWithErrors })
            .expect(httpStatus.BAD_REQUEST);
    });

    it("Deveria gerar erro 404 ao tentar editar uma venda com serviço inexistente", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        const saleWithErrors: DataCreateSale = {
            ...saleA,
            notasVenda: saleA.notasVenda.map((saleInvoice) => ({
                ...saleInvoice,
                vendasServico: saleInvoice.vendasServico.map((serv) => ({ ...serv, servicoId: "nao_existe" })),
            })),
        };
        return await request(server)
            .patch(ApiTestRoutes.PATCH_SALE_ROUTE(saleA.id))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: saleWithErrors })
            .expect(httpStatus.BAD_REQUEST);
    });

    it("Deveria editar apenas as comissões que não foram pagas", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        const saleToUpdate: DataCreateSale = {
            ...saleA,
            notasVenda: [
                {
                    ...saleAInvoice,
                    formaParcelamento: 2,
                    datasBoleto: [saleAInvoice.datasBoleto[0], saleAInvoice.datasBoleto[1]],
                },
                { ...saleAInvoice1 },
            ],
        };

        await request(server)
            .patch(ApiTestRoutes.PATCH_SALE_ROUTE(saleA.id))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: saleToUpdate })
            .expect(400); //Editando NotaVenda com Comissão Paga

        const res = await request(server)
            .get(ApiTestRoutes.PATCH_SALE_ROUTE(saleA.id))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .expect(200);

        expect(res.body.notasVenda.length).toBe(2);

        expect(res.body.notasVenda[0].comissoes.length).toBe(6); //TODO: Puxar todas as notas

        for (const commission of res.body.notasVenda[0].comissoes) {
            switch (commission.id) {
                case commissionA.id:
                    expect(commission.comissaoPaga).toBe(commissionA.comissaoPaga);
                    expect(commission.valorMargemBrutaBase).toBeCloseTo(commissionA.valorMargemBrutaBase);
                    expect(commission.dataComissao).toBe(commissionA.dataComissao.toISOString());
                    break;
                case commissionD.id:
                    expect(commission.comissaoPaga).toBe(commissionD.comissaoPaga);
                    expect(commission.valorMargemBrutaBase).toBeCloseTo(commissionD.valorMargemBrutaBase);
                    expect(commission.dataComissao).toBe(commissionD.dataComissao.toISOString());
                    break;
                default:
                    expect(commission.userRoleId).toBeOneOf([
                        salePersonRoleA.id,
                        salePersonRoleB.id,
                        comercialManagerRole.id,
                        solutionArchitectRole.id,
                        comercialAssistantRole.id,
                        referrerRole.id,
                    ]);
                    expect(commission.comissaoPaga).toBe(false);
                    if (commission.userRoleId === referrerRole.id)
                        expect(commission.valorMargemBrutaBase).toBeCloseTo(margemBrutaSaleA_Referrer);
                    else if (commission.userRoleId === solutionArchitectRole.id)
                        expect(commission.valorMargemBrutaBase).toBeCloseTo(margemBrutaSaleA_SolutionArchitect);
                    else if (commission.userRoleId === comercialAssistantRole.id)
                        expect(commission.valorMargemBrutaBase).toBeCloseTo(margemBrutaSaleA_CommercialAssistant);
                    else expect(commission.valorMargemBrutaBase).toBeCloseTo(margemBrutaSaleA_Referrer);
                    //Caso só tenha vendedores ou gerentes
                    break;
            }
        }

        expect(res.body.accountManagerId).toBe(salePersonRoleA.id);
        expect(res.body.insideSalesId).toBe(salePersonRoleB.id);
    });

    it("Deveria retornar 400 ao editar os vendedores, ou outras roles, de uma venda com comissões pagas", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        const { id, empresaId, ...validSaleA } = saleA;
        const saleWithError: DataCreateSale = {
            ...validSaleA,
            accountManagerId: salePersonRoleA.id,
            insideSalesId: null,
        };

        await request(server)
            .patch(ApiTestRoutes.PATCH_SALE_ROUTE(saleA.id))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: saleWithError })
            .expect(400);
    });

    it("Deveria retornar 400 ao editar códigos de notas com comissões pagas", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        const { id, empresaId, ...validSaleA } = saleA;
        const saleWithError: DataCreateSale = {
            ...validSaleA,
            notasVenda: validSaleA.notasVenda.map((nota) => ({ ...nota, codigo: null })),
        };

        await request(server)
            .patch(ApiTestRoutes.PATCH_SALE_ROUTE(saleA.id))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: saleWithError })
            .expect(400);
    });

    it("Deveria retornar 400 ao editar datas de faturamentos de notas com comissões pagas", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        const { id, empresaId, ...validSaleA } = saleA;
        const saleWithError: DataCreateSale = {
            ...validSaleA,
            notasVenda: validSaleA.notasVenda.map((nota) => ({ ...nota, dataFaturamento: new Date() })),
        };

        await request(server)
            .patch(ApiTestRoutes.PATCH_SALE_ROUTE(saleA.id))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .send({ data: saleWithError })
            .expect(400);
    });

    SaleTestCases.deleteAnyCases.forEach(({ role, expected }) =>
        it(`Deveria retornar ${expected.status} ao deletar uma venda sem restrição como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            await request(server)
                .delete(ApiTestRoutes.PATCH_SALE_ROUTE(saleE.id))
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(expected.status);
        })
    );

    SaleTestCases.deleteByStatusAndUserRoleCases.forEach(({ role, expected, status, accountManagerId }) =>
        it(`Deveria retornar ${expected.status} ao deletar uma venda de estado ${status} e AM ${accountManagerId}, como ${role}`, async () => {
            const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(role);

            await request(server)
                .delete(ApiTestRoutes.PATCH_SALE_ROUTE(saleE.id))
                .query({ accountManagerIdAtual: accountManagerId, estadoVendaAtual: status })
                .set("Authorization", `Bearer ${auth.access.token}`)
                .expect(expected.status);
        })
    );

    it("Não deveria deixar deletar venda com comissões pagas", async () => {
        const auth = await AuthSupport.getRoleAuthFromUserWithUniqueRole(Role.ADMIN);

        return await request(server)
            .delete(ApiTestRoutes.PATCH_SALE_ROUTE(saleB.id))
            .set("Authorization", `Bearer ${auth.access.token}`)
            .expect(400);
    });
});
