import {
    calcSaleAInvoice,
    calcSaleBInvoice,
    calcSaleCInvoice,
    calcSaleDInvoice,
    saleAInvoice,
    saleBInvoice,
    saleCInvoice,
    saleDInvoice,
} from "./sale-invoice";
import { NewCommission } from "../../../src/types/commission.types";
import { salePersonRoleA, salePersonRoleB } from "./user-role";
import { saleA, saleB, saleC, saleD } from "./sale";

export type CommissionDistributionTypeSeed = NewCommission & {
    id: string;
    vendaId: string;
    notaVendaId: string;
    porcentCommissionApproved?: number;
    porcentAcceleratorApproved?: number;
    distributorPaid?: boolean;
};

export const commissionA: CommissionDistributionTypeSeed = {
    id: "commissionA",
    userRoleId: salePersonRoleA.id,
    vendaId: saleA.id,
    notaVendaId: saleAInvoice.id,
    comissao: 2.5,
    porcentCommissionApproved: 100,
    porcentAcceleratorApproved: 100,
    dataComissao: saleAInvoice.datasBoleto[0], // 2024-05-05
    valorMargemBrutaBase: calcSaleAInvoice.valorFaturamentoBoleto, //1041.6
    acelerador: 0,
    comissaoPaga: true,
};

export const commissionB: CommissionDistributionTypeSeed = {
    id: "commissionB",
    userRoleId: salePersonRoleA.id,
    vendaId: saleA.id,
    notaVendaId: saleAInvoice.id,
    comissao: 2.5,
    dataComissao: saleAInvoice.datasBoleto[1], // 2024-06-05
    valorMargemBrutaBase: calcSaleAInvoice.valorFaturamentoBoleto, //1041.6
    acelerador: 0,
    comissaoPaga: false,
};

export const commissionC: CommissionDistributionTypeSeed = {
    id: "commissionC",
    userRoleId: salePersonRoleA.id,
    vendaId: saleA.id,
    notaVendaId: saleAInvoice.id,
    comissao: 2.5,
    dataComissao: saleAInvoice.datasBoleto[2], // 2024-07-05
    valorMargemBrutaBase: calcSaleAInvoice.valorFaturamentoBoleto, //1041.6
    acelerador: 0,
    comissaoPaga: false,
};

export const saleAMaxCommissionSalePersonRoleA = (commissionC.valorMargemBrutaBase * 3 * commissionC.comissao) / 100;

export const commissionD: CommissionDistributionTypeSeed = {
    id: "commissionD",
    vendaId: saleA.id,
    notaVendaId: saleAInvoice.id,
    userRoleId: salePersonRoleB.id,
    comissao: 2.5,
    porcentCommissionApproved: 100,
    dataComissao: saleAInvoice.datasBoleto[0], // 2024-05-05
    valorMargemBrutaBase: calcSaleAInvoice.valorFaturamentoBoleto, //1041.6
    acelerador: 0,
    porcentAcceleratorApproved: 100,
    comissaoPaga: true,
};

export const commissionE: CommissionDistributionTypeSeed = {
    id: "commissionE",
    userRoleId: salePersonRoleB.id,
    vendaId: saleA.id,
    notaVendaId: saleAInvoice.id,
    comissao: 2.5,
    dataComissao: saleAInvoice.datasBoleto[1], // 2024-06-05
    valorMargemBrutaBase: calcSaleAInvoice.valorFaturamentoBoleto, //1041.6
    acelerador: 0,
    comissaoPaga: false,
};

export const commissionF: CommissionDistributionTypeSeed = {
    id: "commissionF",
    userRoleId: salePersonRoleB.id,
    vendaId: saleA.id,
    notaVendaId: saleAInvoice.id,
    comissao: 2.5,
    dataComissao: saleAInvoice.datasBoleto[2], // 2024-07-05
    valorMargemBrutaBase: calcSaleAInvoice.valorFaturamentoBoleto, //1041.6
    acelerador: 0,
    comissaoPaga: false,
};

export const saleAMaxCommissionSalePersonRoleB = (commissionF.valorMargemBrutaBase * 3 * commissionF.comissao) / 100;

export const commissionG: CommissionDistributionTypeSeed = {
    id: "commissionG",
    userRoleId: salePersonRoleA.id,
    vendaId: saleC.id,
    notaVendaId: saleCInvoice.id,
    comissao: 5,
    dataComissao: saleCInvoice.datasBoleto[0], // 2024-05-15
    valorMargemBrutaBase: calcSaleCInvoice.valorFaturamentoBoleto, //4119.9
    acelerador: 0,
    comissaoPaga: false,
};

export const commissionH: CommissionDistributionTypeSeed = {
    id: "commissionH",
    userRoleId: salePersonRoleA.id,
    vendaId: saleC.id,
    notaVendaId: saleCInvoice.id,
    comissao: 5,
    dataComissao: saleCInvoice.datasBoleto[1], // 2024-06-15
    valorMargemBrutaBase: calcSaleCInvoice.valorFaturamentoBoleto, //4119.9
    acelerador: 0,
    comissaoPaga: false,
};

export const commissionI: CommissionDistributionTypeSeed = {
    id: "commissionI",
    vendaId: saleB.id,
    userRoleId: salePersonRoleA.id,
    notaVendaId: saleBInvoice.id,
    comissao: 5,
    dataComissao: saleBInvoice.datasBoleto[0], // 2024-05-15
    valorMargemBrutaBase: calcSaleBInvoice.valorFaturamentoBoleto, //13286.26
    acelerador: 0,
    comissaoPaga: false,
};

export const commissionJ: CommissionDistributionTypeSeed = {
    id: "commissionJ",
    vendaId: saleB.id,
    notaVendaId: saleBInvoice.id,
    userRoleId: salePersonRoleA.id,
    comissao: 5,
    dataComissao: saleBInvoice.datasBoleto[1], // 2024-06-15
    valorMargemBrutaBase: calcSaleBInvoice.valorFaturamentoBoleto, //13286.26,
    acelerador: 5,
    comissaoPaga: false,
};

export const commissionK: CommissionDistributionTypeSeed = {
    id: "commissionK",
    vendaId: saleB.id,
    notaVendaId: saleBInvoice.id,
    userRoleId: salePersonRoleA.id,
    comissao: 5,
    dataComissao: saleBInvoice.datasBoleto[2], // 2024-07-15
    valorMargemBrutaBase: calcSaleBInvoice.valorFaturamentoBoleto, //13286.26
    acelerador: 0,
    comissaoPaga: false,
};

export const commissionL: CommissionDistributionTypeSeed = {
    id: "commissionL",
    vendaId: saleD.id,
    notaVendaId: saleDInvoice.id,
    userRoleId: salePersonRoleA.id,
    comissao: 2.5,
    dataComissao: saleDInvoice.datasBoleto[0], // 2023-06-15
    valorMargemBrutaBase: calcSaleDInvoice.valorFaturamentoBoleto, //2557.5
    acelerador: 0,
    distributorPaid: true,
    comissaoPaga: false,
};

export const commissionM: CommissionDistributionTypeSeed = {
    id: "commissionM",
    vendaId: saleD.id,
    notaVendaId: saleDInvoice.id,
    userRoleId: salePersonRoleA.id,
    comissao: 2.5,
    dataComissao: saleDInvoice.datasBoleto[1], // 2023-07-15
    valorMargemBrutaBase: calcSaleDInvoice.valorFaturamentoBoleto, //2557.5
    acelerador: 0,
    distributorPaid: true,
    comissaoPaga: false,
};

export const commissionN: CommissionDistributionTypeSeed = {
    id: "commissionN",
    vendaId: saleD.id,
    notaVendaId: saleDInvoice.id,
    userRoleId: salePersonRoleB.id,
    comissao: 2.5,
    dataComissao: saleDInvoice.datasBoleto[0], // 2023-06-15
    valorMargemBrutaBase: calcSaleDInvoice.valorFaturamentoBoleto, //2557.5
    acelerador: 0,
    distributorPaid: true,
    comissaoPaga: false,
};

export const commissionO: CommissionDistributionTypeSeed = {
    id: "commissionO",
    vendaId: saleD.id,
    notaVendaId: saleDInvoice.id,
    userRoleId: salePersonRoleB.id,
    comissao: 2.5,
    dataComissao: saleDInvoice.datasBoleto[1], // 2023-07-15
    valorMargemBrutaBase: calcSaleDInvoice.valorFaturamentoBoleto, //2557.5
    acelerador: 0,
    comissaoPaga: false,
};
