import { dataComAnoAnterior, dataComAnoAtual } from "../../../test/support/constant-test.support";
import { NewSaleInvoice } from "../../../src/types/sale-invoice.types";
import { productA, productB, productC, productD } from "./product";
import { supplierA, supplierB } from "./supplier";
import { paymentMethodA } from "./payment-method";
import { serviceA, serviceB } from "./service";
import { TipoMoeda } from "@prisma/client";

export type SaleInvoiceTypeSeed = NewSaleInvoice & { id: string };

//TODO: após exclusão do banco, remover colunas movidas(null)
export const saleAInvoice: SaleInvoiceTypeSeed = {
    id: "saleAInvoice",
    codigo: "codigoA",
    formaParcelamento: 3,
    dataFaturamento: dataComAnoAtual(5, 5),
    numOportunidadeCRM: "CRM_A",
    numPedidoDistribuidor: "pedidoA",
    tipoFaturamento: "DIRETO",
    dedutiveisDistribuidor: 640,
    impostoNota: 7,
    markup: 40,
    formaPagamentoId: paymentMethodA.id,
    vendasProduto: [
        {
            produtoId: productA.id,
            quantidade: 10,
            valorCustoUnit: productA.custoUnit ?? 0,
            tipoMoeda: productA.tipoMoeda || TipoMoeda.BRL,
            cotacao: 1,
            fornecedoresId: [supplierA.id],
            tipoFaturamento: null,
            dedutiveisDistribuidor: null,
            impostoNota: null,
            markup: null,
        },
    ],
    vendasServico: [],
    datasBoleto: [dataComAnoAtual(5, 5), dataComAnoAtual(6, 5), dataComAnoAtual(7, 5)],
};

export const calcSaleAInvoice = {
    valorCustoProdutos: 10000,
    valorCustoServicos: 0,

    valorCustoNota: 10000,
    valorMarkupNota: 10000 * (saleAInvoice.markup! / 100), //4000

    valorDedutiveisDistribuidorNota: saleAInvoice.dedutiveisDistribuidor, //640
    valorMarkupLiquidoNota: 4000 - (saleAInvoice.dedutiveisDistribuidor ?? 0), //3360
    valorImpostoNota: 3360 * (saleAInvoice.impostoNota! / 100), //235.2
    valorImpostos: 235.2 + (saleAInvoice.dedutiveisDistribuidor ?? 0), //875.2

    valorMargemBruta: 4000 - 875.2, //3124.8
    valorFaturamentoBoleto: 3124.8 / 3, //1041.6 por mês

    valorVenda: 10000 + 4000, //14000
};

export const saleAInvoice1: SaleInvoiceTypeSeed = {
    id: "saleAInvoice1",
    codigo: "codigoA1",
    formaParcelamento: 3,
    dataFaturamento: dataComAnoAtual(5, 5),
    numOportunidadeCRM: "CRM_A1",
    numPedidoDistribuidor: "pedidoA1",
    tipoFaturamento: "REVENDA",
    dedutiveisDistribuidor: 0,
    impostoNota: 7,
    markup: 40,
    formaPagamentoId: paymentMethodA.id,
    vendasProduto: [],
    vendasServico: [
        {
            servicoId: serviceA.id, //45 R$/h
            qntdHorasComercial: 100, //1x
            qntdHorasNaoComercial: 25, //1.5x
            qntdHorasEspecial: 50, //2x
            cotacao: 1,
            tipoMoeda: serviceA.tipoMoeda || TipoMoeda.BRL,
            tipoFaturamento: null,
            dedutiveisDistribuidor: null,
            impostoNota: null,
            markup: null,
        },
    ],

    datasBoleto: [dataComAnoAtual(5, 5), dataComAnoAtual(6, 5), dataComAnoAtual(7, 5)],
};

export const calcSaleAInvoice1 = {
    valorCustoProdutos: 0,
    valorCustoServicos: 10687.5,

    valorCustoNota: 10687.5,
    valorMarkupNota: 10687.5 * (saleAInvoice1.markup! / 100), //4275

    valorDedutiveisDistribuidorNota: saleAInvoice1.dedutiveisDistribuidor, //0
    valorMarkupLiquidoNota: 4275 - (saleAInvoice1.dedutiveisDistribuidor ?? 0), //4275

    valorVenda: 10687.5 + 4275, //14962.5
    valorImpostoNota: 14962.5 * (saleAInvoice1.impostoNota! / 100), //1047.375
    valorImpostos: 1047.375 + (saleAInvoice1.dedutiveisDistribuidor ?? 0), //1047.375

    valorMargemBruta: 4275 - 1047.375, //3227.625
    valorFaturamentoBoleto: 3227.625 / 3, //1075.875 por mês
};

export const saleBInvoice: SaleInvoiceTypeSeed = {
    id: "saleBInvoice",
    codigo: "codigoB",
    formaParcelamento: 3,
    dataFaturamento: dataComAnoAtual(5, 15),
    numOportunidadeCRM: "CRM_B",
    numPedidoDistribuidor: "pedidoB",
    tipoFaturamento: "DIRETO",
    dedutiveisDistribuidor: 1140,
    impostoNota: 7,
    markup: 40,
    formaPagamentoId: paymentMethodA.id,
    vendasProduto: [
        {
            produtoId: productA.id,
            quantidade: 10,
            valorCustoUnit: productA.custoUnit ?? 0,
            cotacao: 1,
            tipoMoeda: productA.tipoMoeda || TipoMoeda.BRL,
            fornecedoresId: [supplierA.id],
            tipoFaturamento: null,
            dedutiveisDistribuidor: null,
            impostoNota: null,
            markup: null,
        },
        {
            produtoId: productD.id,
            quantidade: 100,
            valorCustoUnit: productD.custoUnit ?? 0,
            cotacao: 1,
            tipoMoeda: productD.tipoMoeda || TipoMoeda.BRL,
            fornecedoresId: [supplierB.id],
            tipoFaturamento: null,
            dedutiveisDistribuidor: null,
            impostoNota: null,
            markup: null,
        },
    ],
    vendasServico: [],
    datasBoleto: [dataComAnoAtual(5, 15), dataComAnoAtual(6, 15), dataComAnoAtual(7, 15)],
};

export const calcSaleBInvoice = {
    valorCustoProdutos: 110000,
    valorCustoServicos: 0,

    valorCustoNota: 110000,
    valorMarkupNota: 110000 * (saleBInvoice.markup! / 100), //44000

    valorDedutiveisDistribuidorNota: saleBInvoice.dedutiveisDistribuidor, //1140
    valorMarkupLiquidoNota: 44000 - (saleBInvoice.dedutiveisDistribuidor ?? 0), //42860
    valorImpostoNota: 42860 * (saleBInvoice.impostoNota! / 100), //3000.2
    valorImpostos: 3000.2 + (saleBInvoice.dedutiveisDistribuidor ?? 0), //4140.2

    valorMargemBruta: 44000 - 4140.2, //39858.8
    valorFaturamentoBoleto: 39858.8 / 3, //13286.26 por mês

    valorVenda: 110000 + 44000, //154000
};

export const saleBInvoice1: SaleInvoiceTypeSeed = {
    id: "saleBInvoice1",
    codigo: "codigoB1",
    formaParcelamento: 3,
    dataFaturamento: dataComAnoAtual(5, 15),
    numOportunidadeCRM: "CRM_B1",
    numPedidoDistribuidor: "pedidoB1",
    tipoFaturamento: "REVENDA",
    dedutiveisDistribuidor: 0,
    impostoNota: 7,
    markup: 40,
    formaPagamentoId: paymentMethodA.id,
    vendasProduto: [],
    vendasServico: [
        {
            servicoId: serviceA.id, //45 R$/h
            qntdHorasComercial: 100, //1x
            qntdHorasNaoComercial: 25, //1.5x
            qntdHorasEspecial: 50, //2x
            cotacao: 1,
            tipoMoeda: serviceA.tipoMoeda || TipoMoeda.BRL,
            tipoFaturamento: null,
            dedutiveisDistribuidor: null,
            impostoNota: null,
            markup: null,
        },
    ],
    datasBoleto: [dataComAnoAtual(5, 15), dataComAnoAtual(6, 15), dataComAnoAtual(7, 15)],
};

export const calcSaleBInvoice1 = {
    valorCustoProdutos: 0,
    valorCustoServicos: 10687.5,

    valorCustoNota: 10687.5,
    valorMarkupNota: 10687.5 * (saleBInvoice1.markup! / 100), //4275

    valorDedutiveisDistribuidorNota: saleBInvoice1.dedutiveisDistribuidor, //0
    valorMarkupLiquidoNota: 4275 - (saleBInvoice1.dedutiveisDistribuidor ?? 0), //4275

    valorVenda: 10687.5 + 4275, //14962.5
    valorImpostoNota: 14962.5 * (saleBInvoice1.impostoNota! / 100), //1047.375
    valorImpostos: 1047.375 + (saleBInvoice1.dedutiveisDistribuidor ?? 0), //1047.375

    valorMargemBruta: 4275 - 1047.375, //3227.625
    valorFaturamentoBoleto: 3227.625 / 3, //1075.875 por mês
};

// export const saleBInvoice2: SaleInvoiceTypeSeed = {
//     id: "saleBInvoice2",
//     codigo: "oportunidadeB2",
//     formaParcelamento: 2,
//     dataFaturamento: new Date("2025-06-15T00:00:00.300Z"),
//     tipoFaturamento: "DIRETO",
//     numPedidoDistribuidor: "oportunidadeB2",
//     dedutiveisDistribuidor: 640,
//     impostoNota: 7,
//     markup: 40,
//     formaPagamentoId: paymentMethodA.id,
//     vendasProduto: [
//         {
//             produtoId: productC.id,
//             quantidade: 10,
//             valorCustoUnit: 1000,
//             cotacao: 1,
//             tipoMoeda: productC.tipoMoeda || TipoMoeda.BRL,
//             fornecedoresId: [supplierA.id],
//             tipoFaturamento: null,
//             dedutiveisDistribuidor: null,
//             impostoNota: null,
//             markup: null,
//         },
//     ],
//     vendasServico: [],
//     datasBoleto: [new Date("2025-06-16"), new Date("2025-07-17")],
// };

export const saleCInvoice: SaleInvoiceTypeSeed = {
    id: "saleCInvoice",
    codigo: "codigoC",
    formaParcelamento: 2,
    dataFaturamento: dataComAnoAtual(5, 15),
    numOportunidadeCRM: "CRM_C",
    numPedidoDistribuidor: "pedidoC",
    tipoFaturamento: "DIRETO",
    dedutiveisDistribuidor: 1140,
    impostoNota: 7,
    markup: 40,
    formaPagamentoId: paymentMethodA.id,
    vendasProduto: [
        {
            produtoId: productA.id,
            quantidade: 10,
            valorCustoUnit: productA.custoUnit ?? 0,
            cotacao: 1,
            tipoMoeda: productA.tipoMoeda || TipoMoeda.BRL,
            fornecedoresId: [supplierA.id],
            tipoFaturamento: null,
            dedutiveisDistribuidor: null,
            impostoNota: null,
            markup: null,
        },
        {
            produtoId: productD.id,
            quantidade: 15,
            valorCustoUnit: productD.custoUnit ?? 0,
            cotacao: 1,
            tipoMoeda: productD.tipoMoeda || TipoMoeda.BRL,
            fornecedoresId: [supplierB.id],
            tipoFaturamento: null,
            dedutiveisDistribuidor: null,
            impostoNota: null,
            markup: null,
        },
    ],
    vendasServico: [],
    datasBoleto: [dataComAnoAtual(5, 15), dataComAnoAtual(6, 15)],
};

export const calcSaleCInvoice = {
    valorCustoProdutos: 25000,
    valorCustoServicos: 0,

    valorCustoNota: 25000,
    valorMarkupNota: 25000 * (saleCInvoice.markup! / 100), //10000

    valorDedutiveisDistribuidorNota: saleCInvoice.dedutiveisDistribuidor, //1140
    valorMarkupLiquidoNota: 10000 - (saleCInvoice.dedutiveisDistribuidor ?? 0), //8860
    valorImpostoNota: 8860 * (saleCInvoice.impostoNota! / 100), //620.2
    valorImpostos: 620.2 + (saleCInvoice.dedutiveisDistribuidor ?? 0), //1760.2

    valorMargemBruta: 10000 - 1760.2, //8239.8
    valorFaturamentoBoleto: 8239.8 / 2, //4119.9 por mês

    valorVenda: 25000 + 10000, //35000
};

export const saleCInvoice1: SaleInvoiceTypeSeed = {
    id: "saleCInvoice1",
    codigo: "codigoC1",
    formaParcelamento: 2,
    dataFaturamento: dataComAnoAtual(5, 15),
    numOportunidadeCRM: "CRM_C1",
    numPedidoDistribuidor: "pedidoC1",
    tipoFaturamento: "REVENDA",
    dedutiveisDistribuidor: 0,
    impostoNota: 7,
    markup: 40,
    formaPagamentoId: paymentMethodA.id,
    vendasProduto: [],
    vendasServico: [
        {
            servicoId: serviceA.id, //45 R$/h
            qntdHorasComercial: 100,
            qntdHorasNaoComercial: 25,
            qntdHorasEspecial: 50,
            tipoMoeda: serviceA.tipoMoeda || TipoMoeda.BRL,
            cotacao: 1,
            tipoFaturamento: null,
            dedutiveisDistribuidor: null,
            impostoNota: null,
            markup: null,
        },
    ],
    datasBoleto: [dataComAnoAtual(5, 15), dataComAnoAtual(6, 15)],
};

export const calcSaleCInvoice1 = {
    valorCustoProdutos: 0,
    valorCustoServicos: 10687.5,

    valorCustoNota: 10687.5,
    valorMarkupNota: 10687.5 * (saleCInvoice1.markup! / 100), //4275

    valorDedutiveisDistribuidorNota: saleCInvoice1.dedutiveisDistribuidor, //0
    valorMarkupLiquidoNota: 4275 - (saleCInvoice1.dedutiveisDistribuidor ?? 0), //4275

    valorVenda: 10687.5 + 4275, //14962.5
    valorImpostoNota: 14962.5 * (saleCInvoice1.impostoNota! / 100), //1047.375
    valorImpostos: 1047.375 + (saleCInvoice1.dedutiveisDistribuidor ?? 0), //1047.375

    valorMargemBruta: 4275 - 1047.375, //3227.625
    valorFaturamentoBoleto: 3227.625 / 2, //1613.8125 por mês
};

export const saleDInvoice: SaleInvoiceTypeSeed = {
    id: "saleDInvoice",
    codigo: "codigoD",
    formaParcelamento: 2,
    dataFaturamento: dataComAnoAnterior(5, 5),
    numOportunidadeCRM: "CRM_D",
    numPedidoDistribuidor: "pedidoD",
    tipoFaturamento: "DIRETO",
    dedutiveisDistribuidor: 500,
    impostoNota: 7,
    markup: 40,
    formaPagamentoId: paymentMethodA.id,
    vendasProduto: [
        {
            produtoId: productB.id,
            quantidade: 15,
            valorCustoUnit: productB.custoUnit ?? 0,
            cotacao: 1,
            tipoMoeda: productB.tipoMoeda || TipoMoeda.BRL,
            fornecedoresId: [supplierB.id],
            tipoFaturamento: null,
            dedutiveisDistribuidor: null,
            impostoNota: null,
            markup: null,
        },
    ],
    vendasServico: [],
    datasBoleto: [dataComAnoAnterior(5, 15), dataComAnoAnterior(6, 15)],
};

export const calcSaleDInvoice = {
    valorCustoProdutos: 15000,
    valorCustoServicos: 0,

    valorCustoNota: 15000,
    valorMarkupNota: 15000 * (saleDInvoice.markup! / 100), //6000

    valorDedutiveisDistribuidorNota: saleDInvoice.dedutiveisDistribuidor, //500
    valorMarkupLiquidoNota: 6000 - (saleDInvoice.dedutiveisDistribuidor ?? 0), //5500
    valorImpostoNota: 5500 * (saleDInvoice.impostoNota! / 100), //385
    valorImpostos: 385 + (saleDInvoice.dedutiveisDistribuidor ?? 0), //885

    valorMargemBruta: 6000 - 885, //5115
    valorFaturamentoBoleto: 5115 / 2, //2557.5 por mês

    valorVenda: 15000 + 6000, //21000
};

export const saleDInvoice1: SaleInvoiceTypeSeed = {
    id: "saleDInvoice1",
    codigo: "codigoD1",
    formaParcelamento: 2,
    dataFaturamento: dataComAnoAnterior(5, 5),
    numOportunidadeCRM: "CRM_D1",
    numPedidoDistribuidor: "pedidoD1",
    tipoFaturamento: "REVENDA",
    dedutiveisDistribuidor: 0,
    impostoNota: 7,
    markup: 40,
    formaPagamentoId: paymentMethodA.id,
    vendasProduto: [],
    vendasServico: [
        {
            servicoId: serviceB.id, //50 R$/h
            qntdHorasComercial: 100,
            qntdHorasNaoComercial: 25,
            qntdHorasEspecial: 50,
            tipoMoeda: serviceB.tipoMoeda || TipoMoeda.BRL,
            cotacao: 1,
            tipoFaturamento: null,
            dedutiveisDistribuidor: null,
            impostoNota: null,
            markup: null,
        },
    ],
    datasBoleto: [dataComAnoAnterior(5, 15), dataComAnoAnterior(6, 15)],
};

export const calcSaleDInvoice1 = {
    valorCustoServicos: 11875,

    valorCustoNota: 11875,
    valorMarkupNota: 11875 * (saleDInvoice1.markup! / 100), //4750

    valorDedutiveisDistribuidorNota: saleDInvoice1.dedutiveisDistribuidor, //0
    valorMarkupLiquidoNota: 4750 - (saleDInvoice1.dedutiveisDistribuidor ?? 0), //4750

    valorVenda: 11875 + 4750, //16625
    valorImpostoNota: 16625 * (saleDInvoice1.impostoNota! / 100), //1163.75
    valorImpostos: 1163.75 + (saleDInvoice1.dedutiveisDistribuidor ?? 0), //1163.75

    valorMargemBruta: 4750 - 1163.75, //3586.25
    valorFaturamentoBoleto: 3586.25 / 2, //1793.125 por mês
};

export const saleEInvoice: SaleInvoiceTypeSeed = {
    id: "saleEInvoice",
    codigo: "deleteMeE",
    formaParcelamento: 2,
    dataFaturamento: dataComAnoAnterior(5, 15),
    numOportunidadeCRM: "CRM_E",
    numPedidoDistribuidor: "pedidoE",
    tipoFaturamento: "DIRETO",
    dedutiveisDistribuidor: 500,
    impostoNota: 7,
    markup: 40,
    formaPagamentoId: paymentMethodA.id,
    vendasProduto: [
        {
            produtoId: productC.id,
            quantidade: 15,
            valorCustoUnit: productC.custoUnit ?? 0,
            cotacao: 1,
            tipoMoeda: productC.tipoMoeda || TipoMoeda.BRL,
            fornecedoresId: [supplierB.id],
            tipoFaturamento: null,
            dedutiveisDistribuidor: null,
            impostoNota: null,
            markup: null,
        },
    ],
    vendasServico: [],
    datasBoleto: [dataComAnoAnterior(5, 15), dataComAnoAnterior(6, 15)],
};

export const calcSaleEInvoice = {
    valorCustoProdutos: 15000,

    valorCustoNota: 15000,
    valorMarkupNota: 15000 * (saleEInvoice.markup! / 100), //6000

    valorDedutiveisDistribuidorNota: saleEInvoice.dedutiveisDistribuidor, //500
    valorMarkupLiquidoNota: 6000 - (saleEInvoice.dedutiveisDistribuidor ?? 0), //5500
    valorImpostoNota: 5500 * (saleEInvoice.impostoNota! / 100), //385
    valorImpostos: 385 + (saleEInvoice.dedutiveisDistribuidor ?? 0), //885

    valorMargemBruta: 6000 - 885, //5115
    valorFaturamentoBoleto: 5115 / 2, //2557.5 por mês

    valorVenda: 15000 + 6000, //21000
};

export const saleEInvoice1: SaleInvoiceTypeSeed = {
    id: "saleEInvoice1",
    codigo: "deleteMeE1",
    formaParcelamento: 2,
    dataFaturamento: dataComAnoAnterior(5, 15),
    numOportunidadeCRM: "CRM_E1",
    numPedidoDistribuidor: "pedidoE1",
    tipoFaturamento: "REVENDA",
    dedutiveisDistribuidor: 0,
    impostoNota: 7,
    markup: 40,
    formaPagamentoId: paymentMethodA.id,
    vendasProduto: [],
    vendasServico: [
        {
            servicoId: serviceB.id, //50 R$/h
            qntdHorasComercial: 100,
            qntdHorasNaoComercial: 25,
            qntdHorasEspecial: 50,
            tipoMoeda: serviceB.tipoMoeda || TipoMoeda.BRL,
            cotacao: 1,
            tipoFaturamento: null,
            dedutiveisDistribuidor: null,
            impostoNota: null,
            markup: null,
        },
    ],
    datasBoleto: [dataComAnoAnterior(5, 15), dataComAnoAnterior(6, 15)],
};

export const calcSaleEInvoice1 = {
    valorCustoServicos: 11875,

    valorCustoNota: 11875,
    valorMarkupNota: 11875 * (saleDInvoice1.markup! / 100), //4750

    valorDedutiveisDistribuidorNota: saleDInvoice1.dedutiveisDistribuidor, //0
    valorMarkupLiquidoNota: 4750 - (saleDInvoice1.dedutiveisDistribuidor ?? 0), //4750

    valorVenda: 11875 + 4750, //16625
    valorImpostoNota: 16625 * (saleDInvoice1.impostoNota! / 100), //1163.75
    valorImpostos: 1163.75 + (saleDInvoice1.dedutiveisDistribuidor ?? 0), //1163.75

    valorMargemBruta: 4750 - 1163.75, //3586.25
    valorFaturamentoBoleto: 3586.25 / 2, //1793.125 por mês
};
