import {
    comercialAssistantRole,
    referrerRole,
    salePersonRoleA,
    salePersonRoleB,
    solutionArchitectRole,
} from "./user-role";
import { dataComAnoAnterior, dataComAnoAtual } from "../../../test/support/constant-test.support";
import { DataCreateSale } from "../../../src/validations/sale.validator";
import { customerA, customerB } from "./customer";
import { organizationA } from "./organization";
import { EstadoVenda } from "@prisma/client";

import * as SaleInvoice from "./sale-invoice";
import * as Contract from "./contract";

type SaleDataSeed = DataCreateSale & { empresaId: string; id: string };

export const saleA: SaleDataSeed = {
    id: "saleA",
    clienteId: customerA.id,
    accountManagerId: salePersonRoleA.id,
    insideSalesId: salePersonRoleB.id,
    referrerId: null,
    solutionArchitectId: solutionArchitectRole.id,
    comercialAssistantId: comercialAssistantRole.id,
    comercialManagerId: null,
    notasVenda: [SaleInvoice.saleAInvoice, SaleInvoice.saleAInvoice1],
    dataVenda: dataComAnoAtual(5, 5),
    estadoVenda: EstadoVenda.AVAILABLE_PAYMENT,
    vendaRenovacao: true,
    contratoId: Contract.contractA.id,
    empresaId: organizationA.id,
    numOportunidadeCRM: null,
    numPedidoDistribuidor: null,
};

export const saleB: SaleDataSeed = {
    id: "saleB",
    clienteId: customerA.id,
    accountManagerId: salePersonRoleA.id,
    insideSalesId: null,
    referrerId: null,
    solutionArchitectId: null,
    comercialManagerId: null,
    comercialAssistantId: comercialAssistantRole.id,
    notasVenda: [SaleInvoice.saleBInvoice, SaleInvoice.saleBInvoice1],
    dataVenda: dataComAnoAtual(5, 15),
    estadoVenda: EstadoVenda.PAID,
    vendaRenovacao: false,
    contratoId: Contract.contractB.id,
    empresaId: organizationA.id,
    numOportunidadeCRM: null,
    numPedidoDistribuidor: null,
};

export const saleC: SaleDataSeed = {
    id: "saleC",
    clienteId: customerA.id,
    accountManagerId: salePersonRoleA.id,
    insideSalesId: null,
    referrerId: null,
    notasVenda: [SaleInvoice.saleCInvoice, SaleInvoice.saleCInvoice1],
    solutionArchitectId: null,
    comercialManagerId: null,
    comercialAssistantId: comercialAssistantRole.id,
    dataVenda: dataComAnoAtual(5, 15),
    estadoVenda: EstadoVenda.AVAILABLE_PAYMENT,
    vendaRenovacao: false,
    contratoId: Contract.contractA.id,
    empresaId: organizationA.id,
    numOportunidadeCRM: null,
    numPedidoDistribuidor: null,
};

export const saleD: SaleDataSeed = {
    id: "saleD",
    clienteId: customerB.id,
    accountManagerId: salePersonRoleA.id,
    insideSalesId: salePersonRoleB.id,
    referrerId: referrerRole.id,
    solutionArchitectId: null,
    comercialAssistantId: null,
    comercialManagerId: null,
    notasVenda: [SaleInvoice.saleDInvoice, SaleInvoice.saleDInvoice1],
    dataVenda: dataComAnoAnterior(5, 5),
    estadoVenda: EstadoVenda.AVAILABLE_PAYMENT,
    vendaRenovacao: false,
    contratoId: Contract.contractA.id,
    empresaId: organizationA.id,
    numOportunidadeCRM: null,
    numPedidoDistribuidor: null,
};

export const saleE: SaleDataSeed = {
    id: "saleE",
    clienteId: customerB.id,
    accountManagerId: salePersonRoleA.id,
    insideSalesId: salePersonRoleB.id,
    referrerId: referrerRole.id,
    solutionArchitectId: null,
    comercialAssistantId: null,
    comercialManagerId: null,
    notasVenda: [SaleInvoice.saleEInvoice, SaleInvoice.saleEInvoice1],
    dataVenda: dataComAnoAnterior(5, 15),
    estadoVenda: EstadoVenda.INITIAL,
    vendaRenovacao: false,
    contratoId: Contract.contractB.id,
    empresaId: organizationA.id,
    numOportunidadeCRM: null,
    numPedidoDistribuidor: null,
};
