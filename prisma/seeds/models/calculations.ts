import { comercialAssistantRole, referrerRole, salePersonRoleA, salePersonRoleB } from "./user-role";
import { productServiceTypeA, productServiceTypeB } from "./product-service-type";
import { categoryA, categoryB } from "./category";
import { customerA, customerB } from "./customer";

import * as SaleInvoice from "./sale-invoice";
import { commissionDistArchitect, commissionDistAssistant, commissionDistReferrer } from "./commissionDistribution";
import { saleA } from "./sale";

//calculos considerando sem considerar as datas, apenas somando os valores das notas
export const saleACalculations = {
    valorCusto: SaleInvoice.calcSaleAInvoice.valorCustoNota + SaleInvoice.calcSaleAInvoice1.valorCustoNota, //20687.5
    valorMarkup: SaleInvoice.calcSaleAInvoice.valorMarkupNota + SaleInvoice.calcSaleAInvoice1.valorMarkupNota, //8550
    valorMarkupLiquido:
        SaleInvoice.calcSaleAInvoice.valorMarkupLiquidoNota + SaleInvoice.calcSaleAInvoice1.valorMarkupLiquidoNota, //7635
    valorImpostoNota: SaleInvoice.calcSaleAInvoice.valorImpostoNota + SaleInvoice.calcSaleAInvoice1.valorImpostoNota,
    valorDedutiveisDistribuidor:
        (SaleInvoice.calcSaleAInvoice.valorDedutiveisDistribuidorNota ?? 0) +
        (SaleInvoice.calcSaleAInvoice1.valorDedutiveisDistribuidorNota ?? 0),
    valorImpostos: SaleInvoice.calcSaleAInvoice.valorImpostos + SaleInvoice.calcSaleAInvoice1.valorImpostos, //1922.575
    valorMargemBruta: SaleInvoice.calcSaleAInvoice.valorMargemBruta + SaleInvoice.calcSaleAInvoice1.valorMargemBruta, //6352.425
    valorFaturamento:
        SaleInvoice.calcSaleAInvoice.valorFaturamentoBoleto + SaleInvoice.calcSaleAInvoice1.valorFaturamentoBoleto, //2117.475
    valorVenda: SaleInvoice.calcSaleAInvoice.valorVenda + SaleInvoice.calcSaleAInvoice1.valorVenda, //28962.5
};

export const saleBCalculations = {
    valorCusto: SaleInvoice.calcSaleBInvoice.valorCustoNota + SaleInvoice.calcSaleBInvoice1.valorCustoNota, //120687.5
    valorMarkup: SaleInvoice.calcSaleBInvoice.valorMarkupNota + SaleInvoice.calcSaleBInvoice1.valorMarkupNota, //48275
    valorMarkupLiquido:
        SaleInvoice.calcSaleBInvoice.valorMarkupLiquidoNota + SaleInvoice.calcSaleBInvoice1.valorMarkupLiquidoNota, //47135
    valorImpostos: SaleInvoice.calcSaleBInvoice.valorImpostos + SaleInvoice.calcSaleBInvoice1.valorImpostos, //5187.575
    valorMargemBruta: SaleInvoice.calcSaleBInvoice.valorMargemBruta + SaleInvoice.calcSaleBInvoice1.valorMargemBruta, //43086.425
    valorFaturamento:
        SaleInvoice.calcSaleBInvoice.valorFaturamentoBoleto + SaleInvoice.calcSaleBInvoice1.valorFaturamentoBoleto, //14362.135
    valorVenda: SaleInvoice.calcSaleBInvoice.valorVenda + SaleInvoice.calcSaleBInvoice1.valorVenda, //168962,5
};

export const saleCCalculations = {
    valorCusto: SaleInvoice.calcSaleCInvoice.valorCustoNota + SaleInvoice.calcSaleCInvoice1.valorCustoNota, //35687.5
    valorMarkup: SaleInvoice.calcSaleCInvoice.valorMarkupNota + SaleInvoice.calcSaleCInvoice1.valorMarkupNota, //14275
    valorMarkupLiquido:
        SaleInvoice.calcSaleCInvoice.valorMarkupLiquidoNota + SaleInvoice.calcSaleCInvoice1.valorMarkupLiquidoNota, //13135
    valorImpostos: SaleInvoice.calcSaleCInvoice.valorImpostos + SaleInvoice.calcSaleCInvoice1.valorImpostos, //2834.575
    valorMargemBruta: SaleInvoice.calcSaleCInvoice.valorMargemBruta + SaleInvoice.calcSaleCInvoice1.valorMargemBruta, //11467.425
    valorFaturamento:
        SaleInvoice.calcSaleCInvoice.valorFaturamentoBoleto + SaleInvoice.calcSaleCInvoice1.valorFaturamentoBoleto, //5733.7125
    valorVenda: SaleInvoice.calcSaleCInvoice.valorVenda + SaleInvoice.calcSaleCInvoice1.valorVenda, //49962.5
};

export const saleDCalculationsAnoAnterior = {
    valorCusto: SaleInvoice.calcSaleDInvoice.valorCustoNota + SaleInvoice.calcSaleDInvoice1.valorCustoNota, //26875
    valorMarkup: SaleInvoice.calcSaleDInvoice.valorMarkupNota + SaleInvoice.calcSaleDInvoice1.valorMarkupNota, //10750
    valorMarkupLiquido:
        SaleInvoice.calcSaleDInvoice.valorMarkupLiquidoNota + SaleInvoice.calcSaleDInvoice1.valorMarkupLiquidoNota, //10250
    valorImpostos: SaleInvoice.calcSaleDInvoice.valorImpostos + SaleInvoice.calcSaleDInvoice1.valorImpostos, //2048.75
    valorMargemBruta: SaleInvoice.calcSaleDInvoice.valorMargemBruta + SaleInvoice.calcSaleDInvoice1.valorMargemBruta, //8701.25
    valorFaturamento:
        SaleInvoice.calcSaleDInvoice.valorFaturamentoBoleto + SaleInvoice.calcSaleDInvoice1.valorFaturamentoBoleto, //4350.625
    valorVenda: SaleInvoice.calcSaleDInvoice.valorVenda + SaleInvoice.calcSaleDInvoice1.valorVenda, //37625
};

export const saleECalculationsAnoAnterior = {
    valorCusto: SaleInvoice.calcSaleEInvoice.valorCustoNota + SaleInvoice.calcSaleEInvoice1.valorCustoNota, //26875
    valorMarkup: SaleInvoice.calcSaleEInvoice.valorMarkupNota + SaleInvoice.calcSaleEInvoice1.valorMarkupNota, //10750
    valorMarkupLiquido:
        SaleInvoice.calcSaleEInvoice.valorMarkupLiquidoNota + SaleInvoice.calcSaleEInvoice1.valorMarkupLiquidoNota, //10250
    valorImpostos: SaleInvoice.calcSaleEInvoice.valorImpostos + SaleInvoice.calcSaleEInvoice1.valorImpostos, //2048.75
    valorMargemBruta: SaleInvoice.calcSaleEInvoice.valorMargemBruta + SaleInvoice.calcSaleEInvoice1.valorMargemBruta, //8701.25
    valorFaturamento:
        SaleInvoice.calcSaleEInvoice.valorFaturamentoBoleto + SaleInvoice.calcSaleEInvoice1.valorFaturamentoBoleto, //4350.625
    valorVenda: SaleInvoice.calcSaleEInvoice.valorVenda + SaleInvoice.calcSaleEInvoice1.valorVenda, //37625
};

export const totalValuesCalculation = {
    MARKUP_BRUTO: {
        valorTotalAtual: saleACalculations.valorMarkup + saleBCalculations.valorMarkup + saleCCalculations.valorMarkup, //70825
        avgValorTotalAtual:
            (saleACalculations.valorMarkup + saleBCalculations.valorMarkup + saleCCalculations.valorMarkup) / 3, //23608.33
        valorTotalAnterior: saleDCalculationsAnoAnterior.valorMarkup + saleECalculationsAnoAnterior.valorMarkup, //21500
        avgValorTotalAnterior:
            (saleDCalculationsAnoAnterior.valorMarkup + saleECalculationsAnoAnterior.valorMarkup) / 2, //10750
    },
    MARKUP_LIQUIDO: {
        valorTotalAtual:
            saleACalculations.valorMarkupLiquido +
            saleBCalculations.valorMarkupLiquido +
            saleCCalculations.valorMarkupLiquido, //67905
        avgValorTotalAtual:
            (saleACalculations.valorMarkupLiquido +
                saleBCalculations.valorMarkupLiquido +
                saleCCalculations.valorMarkupLiquido) /
            3, //22635
        valorTotalAnterior:
            saleDCalculationsAnoAnterior.valorMarkupLiquido + saleECalculationsAnoAnterior.valorMarkupLiquido, //20500
        avgValorTotalAnterior:
            (saleDCalculationsAnoAnterior.valorMarkupLiquido + saleECalculationsAnoAnterior.valorMarkupLiquido) / 2, //10250
    },
    MARGEM: {
        valorTotalAtual:
            saleACalculations.valorMargemBruta +
            saleBCalculations.valorMargemBruta +
            saleCCalculations.valorMargemBruta, //63150.65
        avgValorTotalAtual:
            (saleACalculations.valorMargemBruta +
                saleBCalculations.valorMargemBruta +
                saleCCalculations.valorMargemBruta) /
            3, //21050.216
        valorTotalAnterior:
            saleDCalculationsAnoAnterior.valorMargemBruta + saleECalculationsAnoAnterior.valorMargemBruta, //19065
        avgValorTotalAnterior:
            (saleDCalculationsAnoAnterior.valorMargemBruta + saleECalculationsAnoAnterior.valorMargemBruta) / 2, //9532.5
    },
    FATURAMENTO: {
        valorTotalAtual: 60907.27500000001,
        avgValorTotalAtual: 20302.425000000003,
        // valorTotalAtual:
        //     (saleACalculations.valorFaturamento + saleBCalculations.valorFaturamento) * 3 +
        //     saleCCalculations.valorFaturamento * 2, //60906.275
        // avgValorTotalAtual:
        //     ((saleACalculations.valorFaturamento + saleBCalculations.valorFaturamento) * 3 +
        //         saleCCalculations.valorFaturamento * 2) /
        //     3, //20302.0916
        valorTotalAnterior:
            (saleDCalculationsAnoAnterior.valorFaturamento + saleECalculationsAnoAnterior.valorFaturamento) * 2, //17402.5
        avgValorTotalAnterior:
            saleDCalculationsAnoAnterior.valorFaturamento + saleECalculationsAnoAnterior.valorFaturamento, //8701.25
    },
    FATURAMENTO_FILTRO: {
        //TODO: filtrado pelo userRole salePersonRoleA nas datas 2024-04-01 a 2024-09-31
        valorTotalAtual: 40256.012500000004,
        avgValorTotalAtual: 13418.670833333335,
        valorTotalAnterior: 8701.25,
        avgValorTotalAnterior: 4350.625,
    },
    VALOR_VENDA: {
        valorTotalAtual: saleACalculations.valorVenda + saleBCalculations.valorVenda + saleCCalculations.valorVenda, //247887.5
        avgValorTotalAtual:
            (saleACalculations.valorVenda + saleBCalculations.valorVenda + saleCCalculations.valorVenda) / 3, //82629.166
        valorTotalAnterior: saleDCalculationsAnoAnterior.valorVenda + saleECalculationsAnoAnterior.valorVenda, //75250
        avgValorTotalAnterior: (saleDCalculationsAnoAnterior.valorVenda + saleECalculationsAnoAnterior.valorVenda) / 2, //37625
    },
    VISITA: {
        valorTotalAtual: 5,
        avgValorTotalAtual: 0,
        valorTotalAnterior: 0,
        avgValorTotalAnterior: 0,
    },
};

export const evolutionCalculation = {
    MARKUP_BRUTO: {
        evolucaoAnoAtual: [
            {
                valor: totalValuesCalculation.MARKUP_BRUTO.valorTotalAtual,
                valorTicketMedio: totalValuesCalculation.MARKUP_BRUTO.valorTotalAtual,
            },
        ],
        evolucaoAnoAnterior: [
            {
                valor: totalValuesCalculation.MARKUP_BRUTO.valorTotalAnterior,
                valorTicketMedio: totalValuesCalculation.MARKUP_BRUTO.valorTotalAnterior,
            },
        ],
    },
    MARKUP_LIQUIDO: {
        evolucaoAnoAtual: [
            {
                valor: totalValuesCalculation.MARKUP_LIQUIDO.valorTotalAtual,
                valorTicketMedio: totalValuesCalculation.MARKUP_LIQUIDO.valorTotalAtual,
            },
        ],
        evolucaoAnoAnterior: [
            {
                valor: totalValuesCalculation.MARKUP_LIQUIDO.valorTotalAnterior,
                valorTicketMedio: totalValuesCalculation.MARKUP_LIQUIDO.valorTotalAnterior,
            },
        ],
    },
    MARGEM: {
        evolucaoAnoAtual: [
            {
                valor: totalValuesCalculation.MARGEM.valorTotalAtual,
                valorTicketMedio: totalValuesCalculation.MARGEM.valorTotalAtual,
            },
        ],
        evolucaoAnoAnterior: [
            {
                valor: totalValuesCalculation.MARGEM.valorTotalAnterior,
                valorTicketMedio: totalValuesCalculation.MARGEM.valorTotalAnterior,
            },
        ],
    },
    FATURAMENTO: {
        evolucaoAnoAtual: [
            {
                mesAno: "5-2024",
                valor: 22213.6625, // era 22213.32916666667
                valorTicketMedio: 22213.6625, // era 19346.47291666667
            },
        ],
        evolucaoAnoAnterior: [
            {
                mesAno: "5-2023",
                valor: 8701.25,
                valorTicketMedio: 8701.25, // era 6525.9375
            },
        ],
    },
    VALOR_VENDA: {
        evolucaoAnoAtual: [
            {
                valor: totalValuesCalculation.VALOR_VENDA.valorTotalAtual,
                valorTicketMedio: totalValuesCalculation.VALOR_VENDA.valorTotalAtual,
            },
        ],
        evolucaoAnoAnterior: [
            {
                valor: totalValuesCalculation.VALOR_VENDA.valorTotalAnterior,
                valorTicketMedio: totalValuesCalculation.VALOR_VENDA.valorTotalAnterior,
            },
        ],
    },
    VISITA: {
        evolucaoAnoAtual: [
            {
                valor: 2, //mes 05-2025
                valorTicketMedio: totalValuesCalculation.VISITA.avgValorTotalAtual,
            },
        ],
        evolucaoAnoAnterior: [
            {
                valor: totalValuesCalculation.VISITA.valorTotalAnterior,
                valorTicketMedio: totalValuesCalculation.VISITA.avgValorTotalAnterior,
            },
        ],
    },
};

export const customerCalculations = {
    rankCliente: {
        [customerA.id]: {
            MARKUP_BRUTO: totalValuesCalculation.MARKUP_BRUTO.valorTotalAtual,
            MARKUP_LIQUIDO: totalValuesCalculation.MARKUP_LIQUIDO.valorTotalAtual,
            MARGEM: totalValuesCalculation.MARGEM.valorTotalAtual,
            FATURAMENTO:
                saleACalculations.valorFaturamento +
                saleBCalculations.valorFaturamento +
                saleCCalculations.valorFaturamento,
            VALOR_VENDA: totalValuesCalculation.VALOR_VENDA.valorTotalAtual,
            VISITA: 3,
        },
        [customerB.id]: {
            MARKUP_BRUTO: totalValuesCalculation.MARKUP_BRUTO.valorTotalAnterior,
            MARKUP_LIQUIDO: totalValuesCalculation.MARKUP_LIQUIDO.valorTotalAnterior,
            MARGEM: totalValuesCalculation.MARGEM.valorTotalAnterior,
            FATURAMENTO: totalValuesCalculation.FATURAMENTO.valorTotalAnterior,
            VALOR_VENDA: totalValuesCalculation.VALOR_VENDA.valorTotalAnterior,
            VISITA: totalValuesCalculation.VISITA.valorTotalAnterior,
        },
    },
};

export const calculoVendedores = {
    rankVendedores: {
        //mês de 01-05 a 31-05
        [salePersonRoleA.id]: {
            MARKUP_BRUTO: {
                valorAcumulado: totalValuesCalculation.MARKUP_BRUTO.valorTotalAtual,
                valorAcumuladoVendaRenovacao: saleACalculations.valorMarkup,
                valorAcumuladoVendaNova: saleBCalculations.valorMarkup + saleCCalculations.valorMarkup,
            },
            MARKUP_LIQUIDO: {
                valorAcumulado: totalValuesCalculation.MARKUP_LIQUIDO.valorTotalAtual,
                valorAcumuladoVendaRenovacao: saleACalculations.valorMarkupLiquido,
                valorAcumuladoVendaNova: saleBCalculations.valorMarkupLiquido + saleCCalculations.valorMarkupLiquido,
            },
            MARGEM: {
                valorAcumulado: totalValuesCalculation.MARGEM.valorTotalAtual,
                valorAcumuladoVendaRenovacao: saleACalculations.valorMargemBruta,
                valorAcumuladoVendaNova: saleBCalculations.valorMargemBruta + saleCCalculations.valorMargemBruta,
            },
            FATURAMENTO: {
                valorAcumulado:
                    saleACalculations.valorFaturamento +
                    saleBCalculations.valorFaturamento +
                    saleCCalculations.valorFaturamento,
                valorAcumuladoVendaRenovacao: saleACalculations.valorFaturamento,
                valorAcumuladoVendaNova: saleBCalculations.valorFaturamento + saleCCalculations.valorFaturamento,
            },
            VALOR_VENDA: {
                valorAcumulado: totalValuesCalculation.VALOR_VENDA.valorTotalAtual,
                valorAcumuladoVendaRenovacao: saleACalculations.valorVenda,
                valorAcumuladoVendaNova: saleBCalculations.valorVenda + saleCCalculations.valorVenda,
            },
            VISITA: {
                valorAcumulado: 1,
                valorAcumuladoVendaRenovacao: 0,
                valorAcumuladoVendaNova: 0,
            },
        },
        [salePersonRoleB.id]: {
            FATURAMENTO: {
                valorAcumulado: 0,
                valorAcumuladoVendaRenovacao: 0,
                valorAcumuladoVendaNova: 0,
            },
            MARGEM: {
                valorAcumulado: 0,
                valorAcumuladoVendaRenovacao: 0,
                valorAcumuladoVendaNova: 0,
            },
            VALOR_VENDA: {
                valorAcumulado: 0,
                valorAcumuladoVendaRenovacao: 0,
                valorAcumuladoVendaNova: 0,
            },
            MARKUP_LIQUIDO: {
                valorAcumulado: 0,
                valorAcumuladoVendaRenovacao: 0,
                valorAcumuladoVendaNova: 0,
            },
            MARKUP_BRUTO: {
                valorAcumulado: 0,
                valorAcumuladoVendaRenovacao: 0,
                valorAcumuladoVendaNova: 0,
            },
            VISITA: {
                valorAcumulado: 1,
                valorAcumuladoVendaRenovacao: 0,
                valorAcumuladoVendaNova: 0,
            },
        },
    },
    valoresTotais: {
        [salePersonRoleA.id]: {
            MARKUP_BRUTO: {
                valorTotalAtual: totalValuesCalculation.MARKUP_BRUTO.valorTotalAtual,
                avgValorTotalAtual: totalValuesCalculation.MARKUP_BRUTO.avgValorTotalAtual,
                valorTotalAnterior: totalValuesCalculation.MARKUP_BRUTO.valorTotalAnterior,
                avgValorTotalAnterior: totalValuesCalculation.MARKUP_BRUTO.avgValorTotalAnterior,
            },
            MARKUP_LIQUIDO: {
                valorTotalAtual: totalValuesCalculation.MARKUP_LIQUIDO.valorTotalAtual,
                avgValorTotalAtual: totalValuesCalculation.MARKUP_LIQUIDO.avgValorTotalAtual,
                valorTotalAnterior: totalValuesCalculation.MARKUP_LIQUIDO.valorTotalAnterior,
                avgValorTotalAnterior: totalValuesCalculation.MARKUP_LIQUIDO.avgValorTotalAnterior,
            },
            MARGEM: {
                valorTotalAtual: totalValuesCalculation.MARGEM.valorTotalAtual,
                avgValorTotalAtual: totalValuesCalculation.MARGEM.avgValorTotalAtual,
                valorTotalAnterior: totalValuesCalculation.MARGEM.valorTotalAnterior,
                avgValorTotalAnterior: totalValuesCalculation.MARGEM.avgValorTotalAnterior,
            },
            FATURAMENTO: {
                valorTotalAtual: totalValuesCalculation.FATURAMENTO.valorTotalAtual,
                avgValorTotalAtual: totalValuesCalculation.FATURAMENTO.avgValorTotalAtual,
                valorTotalAnterior: totalValuesCalculation.FATURAMENTO.valorTotalAnterior,
                avgValorTotalAnterior: totalValuesCalculation.FATURAMENTO.avgValorTotalAnterior,
            },
            VALOR_VENDA: {
                valorTotalAtual: totalValuesCalculation.VALOR_VENDA.valorTotalAtual,
                avgValorTotalAtual: totalValuesCalculation.VALOR_VENDA.avgValorTotalAtual,
                valorTotalAnterior: totalValuesCalculation.VALOR_VENDA.valorTotalAnterior,
                avgValorTotalAnterior: totalValuesCalculation.VALOR_VENDA.avgValorTotalAnterior,
            },
            VISITA: {
                valorTotalAtual: 2,
                avgValorTotalAtual: 0,
                valorTotalAnterior: 0,
                avgValorTotalAnterior: 0,
            },
        },
    },
};

export const categoryCalculations = {
    //categoria é somente dos produtos
    rankCategoria: {
        [categoryA.id]: {
            VALOR_VENDA:
                SaleInvoice.calcSaleAInvoice.valorVenda +
                SaleInvoice.calcSaleBInvoice.valorVenda +
                SaleInvoice.calcSaleCInvoice.valorVenda, //203000
            MARKUP_BRUTO:
                SaleInvoice.calcSaleAInvoice.valorMarkupNota +
                SaleInvoice.calcSaleBInvoice.valorMarkupNota +
                SaleInvoice.calcSaleCInvoice.valorMarkupNota, //58000
            MARKUP_LIQUIDO:
                SaleInvoice.calcSaleAInvoice.valorMarkupLiquidoNota +
                SaleInvoice.calcSaleBInvoice.valorMarkupLiquidoNota +
                SaleInvoice.calcSaleCInvoice.valorMarkupLiquidoNota, //55080
            MARGEM:
                SaleInvoice.calcSaleAInvoice.valorMargemBruta +
                SaleInvoice.calcSaleBInvoice.valorMargemBruta +
                SaleInvoice.calcSaleCInvoice.valorMargemBruta,
            FATURAMENTO:
                SaleInvoice.calcSaleAInvoice.valorFaturamentoBoleto +
                SaleInvoice.calcSaleBInvoice.valorFaturamentoBoleto +
                SaleInvoice.calcSaleCInvoice.valorFaturamentoBoleto, //18448.1
            VISITA: 0,
        },
        [categoryB.id]: {
            VALOR_VENDA: SaleInvoice.calcSaleDInvoice.valorVenda + SaleInvoice.calcSaleEInvoice.valorVenda,
            MARKUP_BRUTO: SaleInvoice.calcSaleDInvoice.valorMarkupNota + SaleInvoice.calcSaleEInvoice.valorMarkupNota,
            MARKUP_LIQUIDO:
                SaleInvoice.calcSaleDInvoice.valorMarkupLiquidoNota +
                SaleInvoice.calcSaleEInvoice.valorMarkupLiquidoNota,
            MARGEM: SaleInvoice.calcSaleDInvoice.valorMargemBruta + SaleInvoice.calcSaleEInvoice.valorMargemBruta,
            FATURAMENTO:
                SaleInvoice.calcSaleDInvoice.valorFaturamentoBoleto +
                SaleInvoice.calcSaleEInvoice.valorFaturamentoBoleto,
            VISITA: 0,
        },
    },
};

export const productServiceTypeCalculations = {
    [productServiceTypeA.id]: {
        MARKUP_BRUTO: totalValuesCalculation.MARKUP_BRUTO.valorTotalAtual, //70825
        MARKUP_LIQUIDO: totalValuesCalculation.MARKUP_LIQUIDO.valorTotalAtual, //67905
        MARGEM: totalValuesCalculation.MARGEM.valorTotalAtual,
        FATURAMENTO:
            saleACalculations.valorFaturamento +
            saleBCalculations.valorFaturamento +
            saleCCalculations.valorFaturamento, //22213.3291
        VALOR_VENDA: totalValuesCalculation.VALOR_VENDA.valorTotalAtual,
        VISITA: 0,
    },
    [productServiceTypeB.id]: {
        MARKUP_BRUTO: totalValuesCalculation.MARKUP_BRUTO.valorTotalAnterior,
        MARKUP_LIQUIDO: totalValuesCalculation.MARKUP_LIQUIDO.valorTotalAnterior,
        MARGEM: totalValuesCalculation.MARGEM.valorTotalAnterior,
        FATURAMENTO: saleDCalculationsAnoAnterior.valorFaturamento + saleECalculationsAnoAnterior.valorFaturamento,
        VALOR_VENDA: totalValuesCalculation.VALOR_VENDA.valorTotalAnterior,
        VISITA: 0,
    },
};

export const targetCalculations = {
    MARKUP_BRUTO: {
        valorMetaAtual: 0,
        valorMetaAtingidaAtual: 0,
        valorMetaAnterior: 0,
        valorMetaAtingidaAnterior: 0,
    },
    MARKUP_LIQUIDO: {
        valorMetaAtual: 0,
        valorMetaAtingidaAtual: 0,
        valorMetaAnterior: 0,
        valorMetaAtingidaAnterior: 0,
    },
    MARGEM: {
        valorMetaAtual: 2000000,
        valorMetaAtingidaAtual: 64_032.07500000001,
        valorMetaAnterior: 0,
        valorMetaAtingidaAnterior: 0,
    },
    FATURAMENTO: {
        valorMetaAtual: 10000, //TODO: Verificar valores. Era 15000
        valorMetaAtingidaAtual: 44427.325, //TODO: Verificar valores. Era 88854.65
        valorMetaAnterior: 0,
        valorMetaAtingidaAnterior: 8701.25,
    },
    VALOR_VENDA: {
        valorMetaAtual: 0,
        valorMetaAtingidaAtual: 0,
        valorMetaAnterior: 0,
        valorMetaAtingidaAnterior: 0,
    },
    VISITA: {
        valorMetaAtual: 10,
        valorMetaAtingidaAtual: 1,
        valorMetaAnterior: 0,
        valorMetaAtingidaAnterior: 0,
    },
    [salePersonRoleA.id]: {
        MARKUP_BRUTO: {
            valorMetaAtual: 0,
            valorMetaAtingidaAtual: 0,
            valorMetaAnterior: 0,
            valorMetaAtingidaAnterior: 0,
        },
        MARKUP_LIQUIDO: {
            valorMetaAtual: 0,
            valorMetaAtingidaAtual: 0,
            valorMetaAnterior: 0,
            valorMetaAtingidaAnterior: 0,
        },
        MARGEM: {
            valorMetaAtual: 1000000,
            valorMetaAtingidaAtual: 64_032.075000000004, //TODO: Verificar este valor
            valorMetaAnterior: 0,
            valorMetaAtingidaAnterior: 0,
        },
        FATURAMENTO: {
            valorMetaAtual: 10000, //TODO: Verificar valores. Era 15000
            valorMetaAtingidaAtual: 44427.325, //TODO: Verificar valores. Era 88854.65
            valorMetaAnterior: 0,
            valorMetaAtingidaAnterior: 0,
        },
        VALOR_VENDA: {
            valorMetaAtual: 0,
            valorMetaAtingidaAtual: 0,
            valorMetaAnterior: 0,
            valorMetaAtingidaAnterior: 0,
        },
        VISITA: {
            valorMetaAtual: 10,
            valorMetaAtingidaAtual: 1,
            valorMetaAnterior: 0,
            valorMetaAtingidaAnterior: 0,
        },
    },
};

//Calculos validos para a SaleA
export const margemBrutaSaleA_Referrer = SaleInvoice.calcSaleAInvoice.valorFaturamentoBoleto;
export const commissionValueSaleA_Referrer = saleA.referrerId
    ? (SaleInvoice.calcSaleAInvoice.valorFaturamentoBoleto *
          (commissionDistReferrer.roleCommissions.at(0)?.comissao ?? 0)) /
      100
    : 0; //0,5%

export const margemBrutaSaleA_SolutionArchitect = margemBrutaSaleA_Referrer - commissionValueSaleA_Referrer;
export const commissionValue_SolutionArchitect = saleA.solutionArchitectId
    ? (margemBrutaSaleA_SolutionArchitect * (commissionDistArchitect.roleCommissions.at(0)?.comissao ?? 0)) / 100
    : 0; //1%

export const margemBrutaSaleA_CommercialAssistant =
    margemBrutaSaleA_SolutionArchitect - commissionValue_SolutionArchitect;
export const commissionValueSaleA_CommercialAssistant = saleA.comercialAssistantId
    ? (margemBrutaSaleA_CommercialAssistant * (commissionDistAssistant.roleCommissions.at(0)?.comissao ?? 0)) / 100
    : 0; //0.5%

export const margemBrutaSaleA_SalePerson_Manager =
    margemBrutaSaleA_CommercialAssistant - commissionValueSaleA_CommercialAssistant;
