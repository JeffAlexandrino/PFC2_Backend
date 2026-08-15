import prisma from "../../src/prisma/prisma";
import targetsEmpresa from "./models/target-empresa";
import { encryptPassword } from "../../src/utils/encryption";
import {
    DEFAULT_PASSWORD,
    admin,
    comercialAssistant,
    comercialManager,
    commissioningAnalyst,
    deletedUser,
    financialManagerUser,
    monitor,
    referrer,
    salePersonA,
    salePersonB,
    solutionArchitect,
    superUser,
    userWihoutRoles,
} from "./models/user";
import {
    commissionDistA,
    commissionDistB,
    commissionDistAB,
    commissionDistArchitect,
    commissionDistAssistant,
    commissionDistManager,
    commissionDistReferrer,
} from "./models/commissionDistribution";
import { customerA, customerB, customerC, segmentA, segmentB } from "./models/customer";
import { visitA, visitAb, visitB, visitC, visitD } from "./models/visit";
import { paymentMethodA, paymentMethodB } from "./models/payment-method";
import { supplierA, supplierB, supplierC } from "./models/supplier";
import { saleA, saleB, saleC, saleD, saleE } from "./models/sale";
import { serviceA, serviceB, serviceC } from "./models/service";
import {
    commissionA,
    commissionB,
    commissionC,
    commissionD,
    commissionE,
    commissionF,
    commissionG,
    commissionH,
    commissionI,
    commissionJ,
    commissionK,
    commissionL,
    commissionM,
    commissionN,
    commissionO,
    //commissionP,
    //commissionQ,
} from "./models/commission";
import {
    adminRole,
    adminRoleB,
    canBeDeletedRole,
    comercialAssistantRole,
    comercialManagerRole,
    commissioningAnalystRole,
    financialManagerUserRole,
    monitorRole,
    referrerRole,
    salePersonRoleA,
    salePersonRoleB,
    solutionArchitectRole,
    superUserAdminRole,
    superUserComercialAssistantRole,
    superUserComercialManagerRole,
    superUserCommissioningAnalystRole,
    superUserMonitorRole,
    superUserReferrerRole,
    superUserSalePersonRole,
    superUserSolutionArchitectRole,
} from "./models/user-role";
import {
    architectTarget,
    assistantTarget,
    managerTarget,
    referrerTarget,
    targetA,
    targetB,
    targetC,
    targetD,
    targetE,
    targetF,
} from "./models/target";
import { productServiceTypeA, productServiceTypeB, productServiceTypeC } from "./models/product-service-type";
import { manufacturerA, manufacturerB, manufacturerC } from "./models/manufacturer";
import { productA, productB, productC, productD, productE } from "./models/product";
import { organizationA, organizationB } from "./models/organization";
import { categoryA, categoryB, categoryC } from "./models/category";
import { contractA, contractB } from "./models/contract";
import { auditA, auditB } from "./models/audit";

export async function setSeedsInDB() {
    const encryptedDefaultPassword = await encryptPassword(DEFAULT_PASSWORD);

    await prisma.empresa.createMany({ data: [organizationA, organizationB] });

    await prisma.user.createMany({
        data: [
            { ...admin, password: encryptedDefaultPassword },
            { ...commissioningAnalyst, password: encryptedDefaultPassword },
            { ...comercialManager, password: encryptedDefaultPassword },
            { ...comercialAssistant, password: encryptedDefaultPassword },
            { ...solutionArchitect, password: encryptedDefaultPassword },
            { ...referrer, password: encryptedDefaultPassword },
            { ...salePersonA, password: encryptedDefaultPassword },
            { ...salePersonB, password: encryptedDefaultPassword },
            { ...superUser, password: encryptedDefaultPassword },
            { ...deletedUser, ativo: false, password: encryptedDefaultPassword },
            { ...userWihoutRoles, password: encryptedDefaultPassword },
            { ...monitor, password: encryptedDefaultPassword },
            { ...financialManagerUser, password: encryptedDefaultPassword },
        ],
    });

    await prisma.userRole.createMany({
        data: [
            adminRole,
            commissioningAnalystRole,
            comercialManagerRole,
            comercialAssistantRole,
            solutionArchitectRole,
            salePersonRoleA,
            salePersonRoleB,
            referrerRole,
            superUserAdminRole,
            superUserCommissioningAnalystRole,
            superUserComercialManagerRole,
            superUserComercialAssistantRole,
            superUserSolutionArchitectRole,
            superUserSalePersonRole,
            superUserReferrerRole,
            superUserMonitorRole,
            canBeDeletedRole,
            monitorRole,
            financialManagerUserRole,
            adminRoleB,
        ],
    });

    for (const comissionDistribution of [
        commissionDistA,
        commissionDistB,
        commissionDistAB,
        commissionDistManager,
        commissionDistArchitect,
        commissionDistAssistant,
        commissionDistReferrer,
    ]) {
        await prisma.distribuicaoComissao.create({
            data: {
                id: comissionDistribution.id,
                empresaId: comissionDistribution.empresaId,
                roleCommissions: { createMany: { data: comissionDistribution.roleCommissions } },
            },
        });
    }

    await prisma.segmento.createMany({ data: [segmentA, segmentB] });
    await prisma.cliente.createMany({ data: [customerA, customerB, customerC] });

    await prisma.contrato.createMany({ data: [contractA, contractB] });

    await prisma.fornecedor.createMany({ data: [supplierA, supplierB, supplierC] });

    await prisma.fabricante.createMany({ data: [manufacturerA, manufacturerB, manufacturerC] });
    await prisma.categoria.createMany({ data: [categoryA, categoryB, categoryC] });
    await prisma.tipoProdutoServico.createMany({
        data: [productServiceTypeA, productServiceTypeB, productServiceTypeC],
    });

    await prisma.produto.createMany({
        data: [productA, productB, productC, productD, productE],
    });

    for (const targetEmpresa of targetsEmpresa) {
        const { tiposMeta, ...restOfTargetEmpresa } = targetEmpresa;
        await prisma.metaEmpresa.create({
            data: { ...restOfTargetEmpresa, tiposMeta: { createMany: { data: tiposMeta } } },
        });
    }

    for (const target of [
        targetA,
        targetB,
        targetC,
        targetD,
        targetE,
        targetF,
        assistantTarget,
        managerTarget,
        architectTarget,
        referrerTarget,
    ]) {
        const { tiposMeta, ...restOfTarget } = target;
        await prisma.meta.create({
            data: { ...restOfTarget, tiposMeta: { createMany: { data: tiposMeta } } },
        });
    }

    await prisma.servico.createMany({ data: [serviceA, serviceB, serviceC] });

    await prisma.formaPagamento.createMany({ data: [paymentMethodA, paymentMethodB] });

    for (const sale of [saleA, saleB, saleC, saleD, saleE]) {
        const { notasVenda, ...restOfSale } = sale;
        await prisma.venda.create({ data: { ...restOfSale } });

        for (const { vendasProduto, vendasServico, datasBoleto, ...restOfSaleInvoice } of notasVenda) {
            await prisma.notaVenda.create({
                data: {
                    ...restOfSaleInvoice,
                    vendaId: restOfSale.id,
                    vendasProduto: {
                        create: vendasProduto.map(({ fornecedoresId, produtoId, ...vendaProduto }) => ({
                            ...vendaProduto,
                            produto: { connect: { id: produtoId } },
                            fornecedores: { connect: fornecedoresId.map((id) => ({ id })) },
                        })),
                    },
                    vendasServico: {
                        create: vendasServico.map(({ servicoId, ...vendaServico }) => {
                            const servico = [serviceA, serviceB].find((s) => s.id === servicoId);
                            return {
                                ...vendaServico,
                                valorCustoHora: servico?.valorCustoHora ?? 0,
                                servico: { connect: { id: servicoId } },
                            };
                        }),
                    },
                    datasBoleto: {
                        createMany: {
                            data: datasBoleto.map((date) => ({ data: date })),
                        },
                    },
                },
            });
        }
    }

    await prisma.comissao.createMany({
        data: [
            commissionA,
            commissionB,
            commissionC,
            commissionD,
            commissionE,
            commissionF,
            commissionG,
            commissionH,
            commissionI,
            commissionJ,
            commissionK,
            commissionL,
            commissionM,
            commissionN,
            commissionO,
            //commissionP,
            //commissionQ,
        ],
    });

    for (const visit of [visitA, visitAb, visitB, visitC, visitD]) {
        const { gastos, ...restOfVisit } = visit;
        await prisma.visita.create({
            data: {
                ...restOfVisit,
                empresaId: restOfVisit.empresaId as string,
                gastos: { createMany: { data: gastos } },
            },
        });
    }

    await prisma.auditoria.createMany({
        data: [auditA, auditB],
    });
}

export async function deleteSeedsFromDB() {
    await prisma.token.deleteMany();

    await prisma.auditoria.deleteMany();

    await prisma.visita.deleteMany();

    await prisma.comissao.deleteMany();

    await prisma.venda.deleteMany();

    await prisma.notaVenda.deleteMany();

    await prisma.formaPagamento.deleteMany();

    await prisma.servico.deleteMany();

    await prisma.meta.deleteMany();

    await prisma.metaEmpresa.deleteMany();

    await prisma.produto.deleteMany();
    await prisma.tipoProdutoServico.deleteMany();
    await prisma.categoria.deleteMany();
    await prisma.fabricante.deleteMany();

    await prisma.fornecedor.deleteMany();

    await prisma.contrato.deleteMany();

    await prisma.cliente.deleteMany();
    await prisma.segmento.deleteMany();

    await prisma.distribuicaoComissao.deleteMany();
    await prisma.roleCommission.deleteMany();

    await prisma.userRole.deleteMany();

    await prisma.user.deleteMany();

    await prisma.empresa.deleteMany();
}
