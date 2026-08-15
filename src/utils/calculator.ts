import { SaleProductCalcs, SaleProductCalculable, SaleProductTotalCalcs } from "../types/sale-product.types";
import { SaleServiceCalcs, SaleServiceCalculable, SaleServiceTotalCalcs } from "../types/sale-service.types";
import { SaleInvoiceCalc, SaleInvoiceCalculable } from "../types/sale-invoice.types";
import { SaleCalc, saleCalcsSlotsType, SaleCalculable } from "../types/sale.types";
import { TipoFaturamento } from "@prisma/client";

const DEFAULT_QUOTE = 1;
const COMERCIAL_HOUR_FACTOR = 1;
const NOT_COMERCIAL_HOUR_FACTOR = 1.5;
const SPECIAL_HOUR_FACTOR = 2;

export class Calculator {
    public static getSaleProductsWithCalcs<T extends SaleProductCalculable>(
        saleProducts: T[]
    ): (T & SaleProductCalcs)[] {
        return saleProducts.map((saleProduct) => {
            const valorCusto = this.getProductTotalCost(
                saleProduct.valorCustoUnit,
                saleProduct.quantidade,
                saleProduct.cotacao
            );

            const calculosProdutos = Calculator.calcsSlotsValues(
                valorCusto,
                saleProduct.markup,
                saleProduct.impostoNota,
                saleProduct.dedutiveisDistribuidor,
                saleProduct.tipoFaturamento
            );

            return {
                ...saleProduct,
                valorCusto,
                valorMarkup: calculosProdutos.valorMarkup,
                valorMarkupLiquido: calculosProdutos.valorMarkupLiquido,
                valorImpostoNota: calculosProdutos.valorImpostoNota,
                valorImpostos: calculosProdutos.valorImpostos,
                valorMargem: calculosProdutos.valorMargem,
                valorVenda: calculosProdutos.valorVenda,
            };
        });
    }

    public static getSaleServicesWithCalcs<T extends SaleServiceCalculable>(
        saleServices: T[]
    ): (T & SaleServiceCalcs)[] {
        return saleServices.map((saleService) => {
            const valorCusto = this.getServiceTotalCost(saleService.valorCustoHora, saleService, saleService.cotacao);

            const calculosServicos = Calculator.calcsSlotsValues(
                valorCusto,
                saleService.markup,
                saleService.impostoNota,
                saleService.dedutiveisDistribuidor,
                saleService.tipoFaturamento
            );

            return {
                ...saleService,
                valorCusto,
                valorMarkup: calculosServicos.valorMarkup,
                valorMarkupLiquido: calculosServicos.valorMarkupLiquido,
                valorVenda: calculosServicos.valorVenda,
                valorImpostoNota: calculosServicos.valorImpostoNota,
                valorImpostos: calculosServicos.valorImpostos,
                valorMargem: calculosServicos.valorMargem,
            };
        });
    }

    public static getSaleInvoicesWithCalcs<T extends SaleInvoiceCalculable>(
        saleInvoices: T[]
    ): (T & SaleInvoiceCalc)[] {
        return saleInvoices.map((saleInvoice) => {
            //TODO: quando as colunas forem movidas no banco, mover calculos relativos para aqui
            const saleProductsWithCalcs = this.getSaleProductsWithCalcs(saleInvoice.vendasProduto);
            const saleServicesWithCalcs = this.getSaleServicesWithCalcs(saleInvoice.vendasServico);

            const saleProductsTotalCalcs = this.getSaleProductsTotalCalcs(saleProductsWithCalcs);
            const saleServicesTotalCalcs = this.getSaleServicesTotalCalcs(saleServicesWithCalcs);

            const impostoNotaItems =
                saleProductsWithCalcs.reduce((acc, produto) => acc + produto.valorImpostoNota, 0) +
                saleServicesWithCalcs.reduce((acc, servico) => acc + servico.valorImpostoNota, 0);
            const dedutiveisDistribuidor =
                saleProductsWithCalcs.reduce((acc, produto) => acc + (produto.dedutiveisDistribuidor ?? 0), 0) +
                saleServicesWithCalcs.reduce((acc, servico) => acc + (servico.dedutiveisDistribuidor ?? 0), 0);

            const valorCusto = saleProductsTotalCalcs.valorCustoProdutos + saleServicesTotalCalcs.valorCustoServicos;
            const valorMarkupNota = this.getGrossMarkupValue(valorCusto, saleInvoice.markup ?? 0);
            const valorMarkup =
                saleProductsTotalCalcs.valorMarkupProdutos +
                saleServicesTotalCalcs.valorMarkupServicos +
                valorMarkupNota;

            const valorMarkupLiquido =
                saleProductsTotalCalcs.valorMarkupLiqProdutos +
                saleServicesTotalCalcs.valorMarkupLiqServicos +
                valorMarkup -
                (saleInvoice.dedutiveisDistribuidor ?? 0);

            const valorDedutiveisDistribuidor = dedutiveisDistribuidor + (saleInvoice.dedutiveisDistribuidor ?? 0);
            const valorVenda = valorCusto + valorMarkup;

            const ImpostoNota =
                saleInvoice.tipoFaturamento !== null
                    ? saleInvoice.tipoFaturamento === "DIRETO"
                        ? this.getInvoiceTaxValueForDirectSale(saleInvoice.impostoNota ?? 0, valorMarkupLiquido)
                        : this.getInvoiceTaxValueForRevenue(saleInvoice.impostoNota ?? 0, valorVenda)
                    : 0;
            const valorImpostoNota = impostoNotaItems + ImpostoNota;
            const valorImpostos = valorImpostoNota + valorDedutiveisDistribuidor;
            const valorMargemBruta =
                saleProductsTotalCalcs.valorMargemBrutaProdutos +
                saleServicesTotalCalcs.valorMargemBrutaServicos +
                valorMarkup -
                valorImpostos;

            return {
                ...saleInvoice,
                vendasProduto: saleProductsWithCalcs,
                vendasServico: saleServicesWithCalcs,
                ...saleProductsTotalCalcs,
                ...saleServicesTotalCalcs,
                valorCusto,
                valorMarkup,
                valorDedutiveisDistribuidor,
                valorMarkupLiquido,
                valorImpostoNota,
                valorImpostos,
                valorMargemBruta,
                valorVenda,
            };
        });
    }

    public static getSalesWithCalcs<T extends SaleCalculable>(sales: T[]): (T & SaleCalc)[] {
        //This function calculates the total values for each sale based on its invoices and adds them in the end of the array
        return sales.map((sale) => {
            const calculableSaleInvoices = this.getSaleInvoicesWithCalcs(sale.notasVenda);
            const saleCalcs = calculableSaleInvoices.reduce(
                (acc, saleInvoice) => ({
                    valorCusto: acc.valorCusto + saleInvoice.valorCusto,
                    valorMarkup: acc.valorMarkup + saleInvoice.valorMarkup,
                    valorDedutiveisDistribuidor:
                        acc.valorDedutiveisDistribuidor + saleInvoice.valorDedutiveisDistribuidor,
                    valorMarkupLiquido: acc.valorMarkupLiquido + saleInvoice.valorMarkupLiquido,
                    valorImpostoNota: acc.valorImpostoNota + saleInvoice.valorImpostoNota,
                    valorImpostos: acc.valorImpostos + saleInvoice.valorImpostos,
                    valorMargemBruta: acc.valorMargemBruta + saleInvoice.valorMargemBruta,
                    valorVenda: acc.valorVenda + saleInvoice.valorVenda,
                }),
                {
                    valorCusto: 0,
                    valorMarkup: 0,
                    valorDedutiveisDistribuidor: 0,
                    valorMarkupLiquido: 0,
                    valorImpostoNota: 0,
                    valorImpostos: 0,
                    valorMargemBruta: 0,
                    valorVenda: 0,
                }
            );
            return {
                ...sale,
                notasVenda: calculableSaleInvoices,
                ...saleCalcs,
            };
        });
    }

    private static getSaleProductsTotalCalcs(saleProducts: SaleProductCalcs[]): SaleProductTotalCalcs {
        return saleProducts.reduce(
            (acc, saleProduct) => {
                return (acc = {
                    valorCustoProdutos: acc.valorCustoProdutos + saleProduct.valorCusto,
                    valorMarkupProdutos: acc.valorMarkupProdutos + saleProduct.valorMarkup,
                    valorMarkupLiqProdutos: acc.valorMarkupLiqProdutos + saleProduct.valorMarkupLiquido,
                    valorMargemBrutaProdutos: acc.valorMargemBrutaProdutos + saleProduct.valorMargem,
                    valorImpostoProdutos: acc.valorImpostoProdutos + saleProduct.valorImpostos,
                    valorVendaProdutos: acc.valorVendaProdutos + saleProduct.valorVenda,
                });
            },
            {
                valorCustoProdutos: 0,
                valorMarkupProdutos: 0,
                valorMarkupLiqProdutos: 0,
                valorMargemBrutaProdutos: 0,
                valorImpostoProdutos: 0,
                valorVendaProdutos: 0,
            }
        );
    }

    private static getSaleServicesTotalCalcs(saleServices: SaleServiceCalcs[]): SaleServiceTotalCalcs {
        return saleServices.reduce(
            (acc, saleService) => {
                return (acc = {
                    valorCustoServicos: acc.valorCustoServicos + saleService.valorCusto,
                    valorMarkupServicos: acc.valorMarkupServicos + saleService.valorMarkup,
                    valorMarkupLiqServicos: acc.valorMarkupLiqServicos + saleService.valorMarkupLiquido,
                    valorMargemBrutaServicos: acc.valorMargemBrutaServicos + saleService.valorMargem,
                    valorImpostoServicos: acc.valorImpostoServicos + saleService.valorImpostos,
                    valorVendaServicos: acc.valorVendaServicos + saleService.valorVenda,
                });
            },
            {
                valorCustoServicos: 0,
                valorMarkupServicos: 0,
                valorMarkupLiqServicos: 0,
                valorMargemBrutaServicos: 0,
                valorImpostoServicos: 0,
                valorVendaServicos: 0,
            }
        );
    }

    private static calcsSlotsValues(
        valorCusto: number,
        //TODO: depois de atualizado e preenchido as novas colunas com os antigos valores, remover null do banco e depois daqui dos calcs
        markup: number | null,
        impostoNota: number | null,
        dedutiveisDistribuidor: number | null,
        tipoFaturamento: TipoFaturamento | null
    ): saleCalcsSlotsType {
        const valorMarkup = this.getGrossMarkupValue(valorCusto, markup ?? 0);
        const valorVenda = this.getSaleValue(valorCusto, valorMarkup);
        const valorMarkupLiquido = this.getNetMarkupValue(valorMarkup, dedutiveisDistribuidor ?? 0);

        const valorImpostoNota =
            tipoFaturamento !== null
                ? tipoFaturamento === "DIRETO"
                    ? this.getInvoiceTaxValueForDirectSale(impostoNota ?? 0, valorMarkupLiquido)
                    : this.getInvoiceTaxValueForRevenue(impostoNota ?? 0, valorVenda)
                : 0;

        const valorImpostos = this.getTotalTaxValue(valorImpostoNota, dedutiveisDistribuidor ?? 0);
        const valorMargem = this.getMarginValue(valorMarkup, valorImpostos);

        return { valorMarkup, valorVenda, valorImpostos, valorMarkupLiquido, valorImpostoNota, valorMargem };
    }

    private static getProductTotalCost(unitCost: number, amount: number, quote?: number): number {
        return unitCost * amount * (quote ?? DEFAULT_QUOTE);
    }
    private static getServiceTotalCost(
        unitCost: number,
        hoursCount: {
            qntdHorasComercial: number;
            qntdHorasNaoComercial: number;
            qntdHorasEspecial: number;
        },
        quote?: number
    ) {
        const validQuote = quote ?? DEFAULT_QUOTE;
        return (
            hoursCount.qntdHorasComercial * unitCost * COMERCIAL_HOUR_FACTOR * validQuote +
            hoursCount.qntdHorasNaoComercial * unitCost * NOT_COMERCIAL_HOUR_FACTOR * validQuote +
            hoursCount.qntdHorasEspecial * unitCost * SPECIAL_HOUR_FACTOR * validQuote
        );
    }
    private static getGrossMarkupValue(totalCost: number, markupPorcent: number): number {
        if (markupPorcent === 0) return 0;
        return (markupPorcent * totalCost) / 100;
    }
    private static getSaleValue(totalCost: number, grossMarkup: number): number {
        return totalCost + grossMarkup;
    }
    private static getNetMarkupValue(grossMarkup: number, deductibleDistributor: number): number {
        return grossMarkup - deductibleDistributor;
    }
    private static getInvoiceTaxValueForDirectSale(taxPorcent: number, netMarkupValue: number) {
        if (taxPorcent === 0) return 0;
        return (taxPorcent * netMarkupValue) / 100;
    }
    private static getInvoiceTaxValueForRevenue(taxPorcent: number, saleValue: number) {
        if (taxPorcent === 0) return 0;
        return (taxPorcent * saleValue) / 100;
    }
    private static getTotalTaxValue(invoiceTaxValue: number, deductibleDistributor: number) {
        return invoiceTaxValue + deductibleDistributor;
    }
    private static getMarginValue(grossMarkup: number, totalTaxValue: number) {
        return grossMarkup - totalTaxValue;
    }
}
