import { SaleDataForRevenueEvolution, SaleInvoiceWithIncludes } from "../types/sale.types";
import { RevenueEvolutionMappedByYearMonth } from "../types/sale.types";
import { RevenueEvolutionWithYearMonth } from "../types/sale.types";
import { DashboardsWhere } from "../types/dashboards.types";
import { UserRoleRank } from "../types/sale-person.types";
import { RequestContext } from "../middlewares/auth";
import { Calculator } from "../utils/calculator";

import ProductServiceTypeService from "./product-service-type.service";
import CommissionService from "./commission.service";
import UserRoleService from "./user-role.service";
import CustomerService from "./customer.service";
import CategoryService from "./category.service";
import TargetService from "./target.service";
import VisitService from "./visit.service";
import SaleService from "./sale.service";

import * as DashboardTypes from "../types/dashboards.types";

export default class DashboardService {
    private readonly saleService: SaleService;
    private readonly visitService: VisitService;
    private readonly userRoleService: UserRoleService;
    private readonly targetService: TargetService;
    private readonly customerService: CustomerService;
    private readonly categoryService: CategoryService;
    private readonly productServiceTypeService: ProductServiceTypeService;

    constructor(context: RequestContext) {
        this.saleService = new SaleService(context);
        this.visitService = new VisitService(context);
        this.targetService = new TargetService(context);
        this.customerService = new CustomerService(context);
        this.userRoleService = new UserRoleService(context);
        this.categoryService = new CategoryService(context);
        this.productServiceTypeService = new ProductServiceTypeService(context);
    }

    public async getTotalValuesByMetric(query: DashboardsWhere) {
        const { dataInicio, dataFim, metrica, estadoVenda, userRoleId, role } = query;
        const saleRole = this.getSaleUsersParamsBy(query);

        const revenueWhere = { gte_dataVenda: dataInicio, lte_dataVenda: dataFim, estadoVenda };
        const salesFilteredByRevenueDate = await this.saleService.findManyBy({
            where: { ...revenueWhere, ...saleRole },
        });
        const salesTotalValues = this.getSalesTotalValues(salesFilteredByRevenueDate);

        const invoiceWhere = { gte_invoiceDate: dataInicio, lte_invoiceDate: dataFim, estadoVenda };
        const salesFilteredByDateInvoice = await this.saleService.findManyBy({
            where: { ...invoiceWhere, ...saleRole },
        });
        const revenueTotalValues = this.getRevenueTotalValues(salesFilteredByDateInvoice, dataInicio, dataFim);

        const visitWhere = { gte_dataVisita: dataInicio, lte_dataVisita: dataFim, salePersonId: userRoleId, role };
        const visits = await this.visitService.findManyBy({ where: visitWhere });

        const initDatePast = new Date(dataInicio.setFullYear(dataInicio.getFullYear() - 1));
        const endDatePast = new Date(dataFim.setFullYear(dataFim.getFullYear() - 1));

        const revenueWherePast = { gte_dataVenda: initDatePast, lte_dataVenda: endDatePast, estadoVenda };
        const salesPastFilteredByRevenueDate = await this.saleService.findManyBy({
            where: { ...revenueWherePast, ...saleRole },
        });
        const salesTotalsPast = this.getSalesTotalValues(salesPastFilteredByRevenueDate);

        const invoiceWherePast = { gte_invoiceDate: initDatePast, lte_invoiceDate: endDatePast, estadoVenda };
        const salesPastFilteredByDateInvoice = await this.saleService.findManyBy({
            where: { ...invoiceWherePast, ...saleRole },
        });
        const revenueTotalsPast = this.getRevenueTotalValues(salesPastFilteredByDateInvoice, initDatePast, endDatePast);

        const visitWherePast = { gte_dataVisita: initDatePast, lte_dataVisita: endDatePast, salePersonId: userRoleId };
        const visitsPast = await this.visitService.findManyBy({ where: visitWherePast });

        let valorTotalAtual = 0;
        let valorTotalAnterior = 0;
        let avgValorTotalAtual = 0;
        let avgValorTotalAnterior = 0;

        switch (metrica) {
            case "VALOR_VENDA":
                valorTotalAtual = salesTotalValues.valorVenda;
                avgValorTotalAtual =
                    salesFilteredByRevenueDate.length === 0 ? 0 : valorTotalAtual / salesFilteredByRevenueDate.length;
                valorTotalAnterior = salesTotalsPast.valorVenda;
                avgValorTotalAnterior =
                    salesPastFilteredByRevenueDate.length === 0
                        ? 0
                        : valorTotalAnterior / salesPastFilteredByRevenueDate.length;
                break;
            case "MARKUP_BRUTO":
                valorTotalAtual = salesTotalValues.valorMarkup;
                avgValorTotalAtual =
                    salesFilteredByRevenueDate.length === 0 ? 0 : valorTotalAtual / salesFilteredByRevenueDate.length;

                valorTotalAnterior = salesTotalsPast.valorMarkup;
                avgValorTotalAnterior =
                    salesPastFilteredByRevenueDate.length === 0
                        ? 0
                        : valorTotalAnterior / salesPastFilteredByRevenueDate.length;
                break;
            case "MARKUP_LIQUIDO":
                valorTotalAtual = salesTotalValues.valorMarkupLiquido;
                avgValorTotalAtual =
                    salesFilteredByRevenueDate.length === 0 ? 0 : valorTotalAtual / salesFilteredByRevenueDate.length;
                valorTotalAnterior = salesTotalsPast.valorMarkupLiquido;
                avgValorTotalAnterior =
                    salesPastFilteredByRevenueDate.length === 0
                        ? 0
                        : valorTotalAnterior / salesPastFilteredByRevenueDate.length;
                break;
            // case "MARGEM":
            //     valorTotalAtual = salesTotalValues.valorMargem;
            //     avgValorTotalAtual =
            //         salesFilteredByRevenueDate.length === 0 ? 0 : valorTotalAtual / salesFilteredByRevenueDate.length;
            //     valorTotalAnterior = salesTotalsPast.valorMargem;
            //     avgValorTotalAnterior =
            //         salesPastFilteredByRevenueDate.length === 0
            //             ? 0
            //             : valorTotalAnterior / salesPastFilteredByRevenueDate.length;
            //     break;
            case "FATURAMENTO":
                valorTotalAtual = revenueTotalValues.valorFaturamento;
                avgValorTotalAtual =
                    salesFilteredByDateInvoice.length === 0 ? 0 : valorTotalAtual / salesFilteredByDateInvoice.length;
                valorTotalAnterior = revenueTotalsPast.valorFaturamento;
                avgValorTotalAnterior =
                    salesPastFilteredByDateInvoice.length === 0
                        ? 0
                        : valorTotalAnterior / salesPastFilteredByDateInvoice.length;
                break;
            case "VISITA":
                valorTotalAtual = visits.length;
                valorTotalAnterior = visitsPast.length;
                break;
        }
        return { valorTotalAtual, avgValorTotalAtual, avgValorTotalAnterior, valorTotalAnterior };
    }

    public async getCustomerRankByMetric(query: DashboardsWhere) {
        const { estadoVenda, dataInicio, dataFim, userRoleId, metrica } = query;

        const userRole = this.getSaleUsersParamsBy(query);

        const customersRankWithoutPosition: Omit<DashboardTypes.RankCustomerInfo, "posicao">[] = [];

        if (metrica === "FATURAMENTO") {
            const customersWithSalesFilteredByInvoiceDates = await this.customerService.findManyWithSalesAndVisits({
                where: { gte_invoiceDate: dataInicio, lte_invoiceDate: dataFim, estadoVenda, ...userRole },
            });

            for (const { vendas: sales, ...customer } of customersWithSalesFilteredByInvoiceDates) {
                const totalValues = this.getRevenueTotalValues(sales, dataInicio, dataFim);
                customersRankWithoutPosition.push({
                    cliente: customer,
                    valorAcumulado: totalValues.valorFaturamento,
                    qntVendas: sales.length,
                    valorGasto: customer.visitas
                        .flatMap((visita) => visita.gastos)
                        .reduce((total, gasto) => total + gasto.valor, 0),
                });
            }
        } else {
            const customersWithSalesFilteredByRevenueAndVisits = await this.customerService.findManyWithSalesAndVisits({
                where: {
                    gte_dataVisita: dataInicio,
                    lte_dataVisita: dataFim,
                    gte_dataVenda: dataInicio,
                    lte_dataVenda: dataFim,
                    estadoVenda,
                    ...userRole,
                },
            });

            for (const { vendas, visitas, ...customer } of customersWithSalesFilteredByRevenueAndVisits) {
                let valorAcumulado = 0;
                let qntVendas = 0;
                const salesCalcs = this.getSalesTotalValues(vendas);

                const valorGasto = visitas
                    .flatMap((visita) => visita.gastos)
                    .reduce((total, gasto) => total + gasto.valor, 0);

                switch (metrica) {
                    case "VALOR_VENDA":
                        valorAcumulado = salesCalcs.valorVenda;
                        valorGasto;
                        qntVendas = vendas.length;
                        break;
                    case "MARKUP_BRUTO":
                        valorAcumulado = salesCalcs.valorMarkup;
                        valorGasto;
                        qntVendas = vendas.length;
                        break;
                    case "MARKUP_LIQUIDO":
                        valorAcumulado = salesCalcs.valorMarkupLiquido;
                        valorGasto;
                        qntVendas = vendas.length;
                        break;
                    // case "MARGEM":
                    //     valorAcumulado = salesCalcs.valorMargem;
                    //     valorGasto;
                    //     qntVendas = vendas.length;
                    //     break;
                    case "VISITA":
                        valorAcumulado = visitas.length;
                        valorGasto;
                        qntVendas = vendas.length;
                        break;
                }
                customersRankWithoutPosition.push({ cliente: customer, valorAcumulado, valorGasto, qntVendas });
            }
        }

        const customersRank: DashboardTypes.RankCustomerInfo[] = customersRankWithoutPosition
            .sort((a, b) => b.valorAcumulado - a.valorAcumulado)
            .map((info, index) => ({ ...info, posicao: index + 1 }));

        return customersRank;
    }

    public async getUserRoleRankByMetric(query: DashboardsWhere) {
        const { estadoVenda, dataInicio, dataFim, metrica, role } = query;
        const userRoleWhere = this.getSaleUsersParamsBy(query);

        const userRoleRankWithoutPosition: Omit<UserRoleRank, "posicao">[] = [];
        // Para vendas onde o vendedor é IS, não será contabilizado em qtd de vendas.
        // Campo IS no form de vendas está desativado

        if (metrica === "FATURAMENTO") {
            const userRolesWithSalesFilteredByInvoices = await this.userRoleService.findManyWithSalesAndVisits({
                ...userRoleWhere,
                gte_invoiceDate: dataInicio,
                lte_invoiceDate: dataFim,
                estadoVenda,
                role,
            });

            for (const userRole of userRolesWithSalesFilteredByInvoices) {
                const sales = [
                    ...userRole.referrerSales,
                    ...userRole.accountManagerSales,
                    ...userRole.comercialAssistantSales,
                    ...userRole.comercialManagerSales,
                    ...userRole.solutionArchitectSales,
                ];

                const renewalSales = sales.filter((sale) => sale.vendaRenovacao);
                const newSales = sales.filter((venda) => !venda.vendaRenovacao);

                const totalValues = this.getRevenueTotalValues(sales, query.dataInicio, query.dataFim);
                const renewalSalesValues = this.getRevenueTotalValues(renewalSales, query.dataInicio, query.dataFim);
                const newSalesValues = this.getRevenueTotalValues(newSales, query.dataInicio, query.dataFim);

                const qntVendas = sales.length;

                userRoleRankWithoutPosition.push({
                    userRole: { id: userRole.id, user: userRole.user },
                    valorAcumulado: totalValues.valorFaturamento,
                    valorAcumuladoVendaRenovacao: renewalSalesValues.valorFaturamento,
                    valorAcumuladoVendaNova: newSalesValues.valorFaturamento,
                    qntVendas: qntVendas,
                });
            }
        } else {
            const userRolesWithSalesFilteredByRevenueAndVisits = await this.userRoleService.findManyWithSalesAndVisits({
                gte_dataVenda: dataInicio,
                lte_dataVenda: dataFim,
                gte_dataVisita: dataInicio,
                lte_dataVisita: dataFim,
                estadoVenda,
                ...userRoleWhere,
                role,
            });

            for (const userRole of userRolesWithSalesFilteredByRevenueAndVisits) {
                const sales = [
                    ...userRole.referrerSales,
                    ...userRole.accountManagerSales,
                    ...userRole.comercialAssistantSales,
                    ...userRole.comercialManagerSales,
                    ...userRole.solutionArchitectSales,
                ];

                let valorAcumulado = 0;
                let valorAcumuladoVendaRenovacao = 0;
                let valorAcumuladoVendaNova = 0;

                const renewalSales = sales.filter((venda) => venda.vendaRenovacao);
                const newSales = sales.filter((venda) => !venda.vendaRenovacao);
                const salesTotal = this.getSalesTotalValues(sales);
                const renewalSalesTotal = this.getSalesTotalValues(renewalSales);
                const newSalesTotal = this.getSalesTotalValues(newSales);

                const qntVendas = sales.length;

                switch (metrica) {
                    case "VALOR_VENDA":
                        valorAcumulado = salesTotal.valorVenda;
                        valorAcumuladoVendaRenovacao = renewalSalesTotal.valorVenda;
                        valorAcumuladoVendaNova = newSalesTotal.valorVenda;
                        qntVendas;
                        break;
                    case "MARKUP_BRUTO":
                        valorAcumulado = salesTotal.valorMarkup;
                        valorAcumuladoVendaRenovacao = renewalSalesTotal.valorMarkup;
                        valorAcumuladoVendaNova = newSalesTotal.valorMarkup;
                        qntVendas;
                        break;
                    case "MARKUP_LIQUIDO":
                        valorAcumulado = salesTotal.valorMarkupLiquido;
                        valorAcumuladoVendaRenovacao = renewalSalesTotal.valorMarkupLiquido;
                        valorAcumuladoVendaNova = newSalesTotal.valorMarkupLiquido;
                        qntVendas;
                        break;
                    // case "MARGEM":
                    //     valorAcumulado = salesTotal.valorMargem;
                    //     valorAcumuladoVendaRenovacao = renewalSalesTotal.valorMargem;
                    //     valorAcumuladoVendaNova = newSalesTotal.valorMargem;
                    //     qntVendas;
                    //     break;
                    case "VISITA":
                        valorAcumulado = userRole.visitas.length;
                        qntVendas;
                        break;
                }

                userRoleRankWithoutPosition.push({
                    userRole: { id: userRole.id, user: userRole.user },
                    valorAcumulado,
                    valorAcumuladoVendaRenovacao,
                    valorAcumuladoVendaNova,
                    qntVendas,
                });
            }
        }

        const userRoleRank: UserRoleRank[] = userRoleRankWithoutPosition
            .sort((a, b) => b.valorAcumulado - a.valorAcumulado)
            .map((info, index) => ({ posicao: index + 1, ...info }));

        return userRoleRank;
    }

    public async getCategoryRankByMetric(query: DashboardsWhere) {
        const { estadoVenda, dataInicio, dataFim, metrica } = query;
        const userRoleWhere = this.getSaleUsersParamsBy(query);

        const categoryRankWithoutPosition: Omit<DashboardTypes.CategoryRank, "posicao">[] = [];

        if (metrica === "FATURAMENTO") {
            const categoriesWithProductsFilteredByInvoiceDates =
                await this.categoryService.findManyWithProductIncludingProductSales({
                    ...userRoleWhere,
                    estadoVenda,
                    gte_invoiceDate: dataInicio,
                    lte_invoiceDate: dataFim,
                });

            for (const { produtos, ...categoria } of categoriesWithProductsFilteredByInvoiceDates) {
                let valorAcumulado = 0;
                const vendasProduto = produtos.flatMap(({ vendasProduto }) => vendasProduto);

                const notaVendaCounts = vendasProduto.reduce((acc: Record<string, number>, vp) => {
                    const notaId = vp.notaVendaId ?? vp.notaVenda.id;
                    if (!notaId) return acc;
                    acc[notaId] = (acc[notaId] || 0) + 1;
                    return acc;
                }, {});

                // aplica propriedades da nota na vendaProduto e divide dedutiveisDistribuidor entre produtos da mesma nota
                vendasProduto.forEach((vp) => {
                    vp.markup = vp.notaVenda.markup;
                    vp.impostoNota = vp.notaVenda.impostoNota;
                    vp.tipoFaturamento = vp.notaVenda.tipoFaturamento;

                    if (vp.notaVenda.id) {
                        const n = notaVendaCounts[vp.notaVenda.id] || 1;
                        vp.dedutiveisDistribuidor = (vp.notaVenda.dedutiveisDistribuidor ?? 0) / n;
                    } else {
                        vp.dedutiveisDistribuidor = 0;
                    }
                });

                const calculos = vendasProduto.map((vendaProduto) => ({
                    ...Calculator.getSaleProductsWithCalcs([vendaProduto])[0],
                    datasBoleto: vendaProduto.notaVenda?.datasBoleto,
                }));

                valorAcumulado = calculos.reduce((acc, calculo) => {
                    const datasBoletos = calculo.datasBoleto?.length ?? 0;
                    const datasBoletosFiltradas = calculo.datasBoleto?.filter(
                        (boleto: { data: Date }) => boleto.data >= dataInicio && boleto.data <= dataFim
                    ).length;
                    return (acc += (calculo.valorMargem / datasBoletos) * (datasBoletosFiltradas ?? 0));
                }, 0);
                categoryRankWithoutPosition.push({ categoria, valorAcumulado });
            }
        } else {
            const categoriesWithProductsFilteredByRevenueDate =
                await this.categoryService.findManyWithProductIncludingProductSales({
                    ...userRoleWhere,
                    estadoVenda,
                    gte_dataVenda: dataInicio,
                    lte_dataVenda: dataFim,
                });

            for (const { produtos, ...categoria } of categoriesWithProductsFilteredByRevenueDate) {
                let valorAcumulado = 0;
                const vendasProduto = produtos.flatMap(({ vendasProduto }) => vendasProduto);

                // conta quantos vendasProduto existem por notaVendaId
                const notaVendaCounts = vendasProduto.reduce((acc: Record<string, number>, vp) => {
                    const notaId = vp.notaVendaId ?? vp.notaVenda.id;
                    if (!notaId) return acc;
                    acc[notaId] = (acc[notaId] || 0) + 1;
                    return acc;
                }, {});

                // aplica propriedades da nota na vendaProduto e divide dedutiveisDistribuidor entre produtos da mesma nota
                vendasProduto.forEach((vp) => {
                    vp.markup = vp.notaVenda.markup;
                    vp.impostoNota = vp.notaVenda.impostoNota;
                    vp.tipoFaturamento = vp.notaVenda.tipoFaturamento;

                    if (vp.notaVenda.id) {
                        const n = notaVendaCounts[vp.notaVenda.id] || 1;
                        vp.dedutiveisDistribuidor = (vp.notaVenda.dedutiveisDistribuidor ?? 0) / n;
                    } else {
                        vp.dedutiveisDistribuidor = 0;
                    }
                });

                const calculos = Calculator.getSaleProductsWithCalcs(vendasProduto);

                switch (metrica) {
                    case "VALOR_VENDA":
                        valorAcumulado = calculos.reduce((acc, { valorVenda }) => {
                            return (acc += valorVenda);
                        }, 0);
                        break;
                    case "MARKUP_BRUTO":
                        valorAcumulado = calculos.reduce((acc, { valorMarkup }) => {
                            return (acc += valorMarkup);
                        }, 0);
                        break;
                    case "MARKUP_LIQUIDO":
                        valorAcumulado = calculos.reduce((acc, { valorMarkupLiquido }) => {
                            return (acc += valorMarkupLiquido);
                        }, 0);
                        break;
                    // case "MARGEM":
                    //     valorAcumulado = calculos.reduce((acc, { valorMargem }) => {
                    //         return (acc += valorMargem);
                    //     }, 0);
                    //     break;
                }
                categoryRankWithoutPosition.push({ categoria, valorAcumulado });
            }
        }

        const categoryRank: DashboardTypes.CategoryRank[] = categoryRankWithoutPosition
            .sort((a, b) => b.valorAcumulado - a.valorAcumulado)
            .map((info, index) => ({ posicao: index + 1, ...info }));

        return categoryRank;
    }

    public async getEvolutionByMetric(query: DashboardsWhere) {
        const { dataInicio, dataFim, metrica, estadoVenda, userRoleId, role } = query;
        const userRoleWhere = this.getSaleUsersParamsBy(query);

        let evolutionCurrentYear: { mesAno: string; valor: number; valorTicketMedio: number }[] = [];
        let evolutionLastYear: { mesAno: string; valor: number; valorTicketMedio: number }[] = [];

        if (metrica === "FATURAMENTO") {
            const sales = await this.saleService.findManyBy({
                where: { ...userRoleWhere, gte_invoiceDate: dataInicio, lte_invoiceDate: dataFim, estadoVenda },
            });
            const initDateMonth = dataInicio.getMonth();
            const endDateMonth = dataFim.getMonth();
            const revenueEvolution = this.getRevenueEvolutionByMonthForSales(
                sales,
                initDateMonth,
                endDateMonth,
                userRoleId
            );

            evolutionCurrentYear = revenueEvolution.map(({ mesAno, ...revenueEvolution }) => ({
                mesAno,
                valor: revenueEvolution.faturamento,
                valorTicketMedio: revenueEvolution.faturamento,
            }));
        } else if (metrica === "VISITA") {
            const visits = await this.visitService.findManyBy({
                where: { gte_dataVisita: dataInicio, lte_dataVisita: dataFim, salePersonId: userRoleId, role },
            });
            const visitEvolution = this.getEvolutionByMonthForVisits(visits);

            evolutionCurrentYear = visitEvolution.map(({ mesAno, ...visitEvolution }) => ({
                mesAno,
                valor: visitEvolution.qntdVisitas,
                valorTicketMedio: 0,
            }));
        } else {
            const sales = await this.saleService.findManyBy({
                where: { ...userRoleWhere, gte_dataFaturamento: dataInicio, lte_dataFaturamento: dataFim, estadoVenda },
            });
            const saleEvolution = this.getEvolutionByMonthForSales(sales);
            evolutionCurrentYear = saleEvolution.map(({ mesAno, ...saleEvolution }) => {
                switch (metrica) {
                    case "VALOR_VENDA": {
                        const valor = saleEvolution.valorVenda;
                        return { mesAno, valor, valorTicketMedio: valor };
                    }
                    case "MARKUP_BRUTO": {
                        const valor = saleEvolution.markupBruto;
                        return { mesAno, valor, valorTicketMedio: valor };
                    }
                    case "MARKUP_LIQUIDO": {
                        const valor = saleEvolution.markupLiquido;
                        return { mesAno, valor, valorTicketMedio: valor };
                    }
                    // case "MARGEM": {
                    //     const valor = saleEvolution.margem;
                    //     return { mesAno, valor, valorTicketMedio: valor };
                    // }
                    default:
                        return { mesAno, valor: 0, valorTicketMedio: 0 };
                }
            });
        }

        const initDatePast = new Date(dataInicio.setFullYear(dataInicio.getFullYear() - 1));
        const endDatePast = new Date(dataFim.setFullYear(dataFim.getFullYear() - 1));

        if (metrica === "FATURAMENTO") {
            const sales = await this.saleService.findManyBy({
                where: { ...userRoleWhere, gte_invoiceDate: initDatePast, lte_invoiceDate: endDatePast, estadoVenda },
            });
            const initDateMonthOld = initDatePast.getMonth();
            const endDateMonthOld = endDatePast.getMonth();
            const revenueEvolution = this.getRevenueEvolutionByMonthForSales(
                sales,
                initDateMonthOld,
                endDateMonthOld,
                userRoleId
            );

            evolutionLastYear = revenueEvolution.map(({ mesAno, ...revenueEvolution }) => ({
                mesAno,
                valor: revenueEvolution.faturamento,
                valorTicketMedio: revenueEvolution.faturamento,
            }));
        } else if (metrica === "VISITA") {
            const visits = await this.visitService.findManyBy({
                where: { gte_dataVisita: initDatePast, lte_dataVisita: endDatePast, salePersonId: userRoleId, role },
            });
            const visitEvolution = this.getEvolutionByMonthForVisits(visits);

            evolutionLastYear = visitEvolution.map(({ mesAno, ...visitEvolution }) => ({
                mesAno,
                valor: visitEvolution.qntdVisitas,
                valorTicketMedio: 0,
            }));
        } else {
            const sales = await this.saleService.findManyBy({
                where: {
                    ...userRoleWhere,
                    gte_dataFaturamento: initDatePast,
                    lte_dataFaturamento: endDatePast,
                    estadoVenda,
                },
            });
            const salesWithCalcs = sales.map((venda) => ({ ...venda, ...Calculator.getSalesWithCalcs(sales)[0] }));
            const saleEvolution = this.getEvolutionByMonthForSales(salesWithCalcs);

            evolutionLastYear = saleEvolution.map(({ mesAno, ...saleEvolution }) => {
                switch (metrica) {
                    case "VALOR_VENDA": {
                        const valor = saleEvolution.valorVenda;
                        return { mesAno, valor, valorTicketMedio: valor };
                    }
                    case "MARKUP_BRUTO": {
                        const valor = saleEvolution.markupBruto;
                        return { mesAno, valor, valorTicketMedio: valor };
                    }
                    case "MARKUP_LIQUIDO": {
                        const valor = saleEvolution.markupLiquido;
                        return { mesAno, valor, valorTicketMedio: valor };
                    }
                    // case "MARGEM": {
                    //     const valor = saleEvolution.margem;
                    //     return { mesAno, valor, valorTicketMedio: valor };
                    // }
                    default:
                        return { mesAno, valor: 0, valorTicketMedio: 0 };
                }
            });
        }

        return { evolucaoAnoAtual: evolutionCurrentYear, evolucaoAnoAnterior: evolutionLastYear };
    }

    public async getProductServiceTypesValuesByMetric(query: DashboardsWhere) {
        const { estadoVenda, dataInicio, dataFim, metrica, userRoleId } = query;
        const userRoleWhere = this.getSaleUsersParamsBy(query);

        const productServiceTypeWithTotalValue: DashboardTypes.TotalValueByProductServiceType[] = [];
        if (metrica === "FATURAMENTO") {
            const productServiceTypesFilteredByInvoiceDates =
                await this.productServiceTypeService.findManyWithProductIncludingProductSalesAndServiceIncludingServiceSales(
                    { gte_invoiceDate: dataInicio, lte_invoiceDate: dataFim, estadoVenda, ...userRoleWhere }
                );

            for (const { produtos, servicos, ...tipoProdServ } of productServiceTypesFilteredByInvoiceDates) {
                let valorAcumulado = 0;

                const productSales = produtos.flatMap(({ vendasProduto }) => vendasProduto);
                productSales.forEach(
                    (productSales) => (
                        (productSales.impostoNota = productSales.notaVenda.impostoNota),
                        (productSales.markup = productSales.notaVenda.markup),
                        (productSales.tipoFaturamento = productSales.notaVenda.tipoFaturamento),
                        (productSales.dedutiveisDistribuidor =
                            (productSales.notaVenda.dedutiveisDistribuidor ?? 0) /
                            productSales.notaVenda.vendasProduto.length)
                    )
                );

                const productSalesRevenue = productSales.reduce((acc, productSale) => {
                    const productSaleCalcs = Calculator.getSaleProductsWithCalcs([productSale])[0];

                    const revenuePerInvoice =
                        productSaleCalcs.valorMargem / (productSale.notaVenda?.datasBoleto?.length || 1);

                    const invoicesBetweenDatesCount = productSale.notaVenda?.datasBoleto.filter(
                        ({ data }) => data >= dataInicio && data <= dataFim
                    ).length;
                    return (acc += (invoicesBetweenDatesCount ?? 0) * revenuePerInvoice);
                }, 0);
                const serviceSales = servicos.flatMap(({ vendasServico }) => vendasServico);
                serviceSales.forEach(
                    (serviceSales) => (
                        (serviceSales.impostoNota = serviceSales.notaVenda.impostoNota),
                        (serviceSales.markup = serviceSales.notaVenda.markup),
                        (serviceSales.tipoFaturamento = serviceSales.notaVenda.tipoFaturamento),
                        (serviceSales.dedutiveisDistribuidor =
                            (serviceSales.notaVenda.dedutiveisDistribuidor ?? 0) /
                            serviceSales.notaVenda.vendasServico.length)
                    )
                );

                const serviceSalesRevenue = serviceSales.reduce((acc, serviceSale) => {
                    const serviceSaleCalcs = Calculator.getSaleServicesWithCalcs([serviceSale])[0];
                    const revenuePerInvoice =
                        serviceSaleCalcs.valorMargem / (serviceSale.notaVenda?.datasBoleto?.length || 1);

                    const invoicesBetweenDatesCount = serviceSale.notaVenda?.datasBoleto.filter(
                        (boleto) => boleto.data >= dataInicio && boleto.data <= dataFim
                    ).length;

                    return (acc += (invoicesBetweenDatesCount ?? 0) * revenuePerInvoice);
                }, 0);

                valorAcumulado = productSalesRevenue + serviceSalesRevenue;
                productServiceTypeWithTotalValue.push({ tipoProdServ, valorAcumulado });
            }
        } else {
            const productServiceTypesFilteredByRevenueDate =
                await this.productServiceTypeService.findManyWithProductIncludingProductSalesAndServiceIncludingServiceSales(
                    { gte_dataVenda: dataInicio, lte_dataVenda: dataFim, estadoVenda, ...userRoleWhere }
                );

            for (const { produtos, servicos, ...tipoProdServ } of productServiceTypesFilteredByRevenueDate) {
                let valorAcumulado = 0;
                const productSales = produtos.flatMap(({ vendasProduto }) => vendasProduto);
                const serviceSales = servicos.flatMap(({ vendasServico }) => vendasServico);

                productSales.forEach(
                    (productSales) => (
                        (productSales.impostoNota = productSales.notaVenda.impostoNota),
                        (productSales.markup = productSales.notaVenda.markup),
                        (productSales.tipoFaturamento = productSales.notaVenda.tipoFaturamento),
                        (productSales.dedutiveisDistribuidor =
                            (productSales.notaVenda.dedutiveisDistribuidor ?? 0) /
                            productSales.notaVenda.vendasProduto.length)
                    )
                );

                serviceSales.forEach(
                    (serviceSales) => (
                        (serviceSales.impostoNota = serviceSales.notaVenda.impostoNota),
                        (serviceSales.markup = serviceSales.notaVenda.markup),
                        (serviceSales.tipoFaturamento = serviceSales.notaVenda.tipoFaturamento),
                        (serviceSales.dedutiveisDistribuidor =
                            (serviceSales.notaVenda.dedutiveisDistribuidor ?? 0) /
                            serviceSales.notaVenda.vendasServico.length)
                    )
                );

                const productSalesCalcs = Calculator.getSaleProductsWithCalcs(productSales);
                const serviceSalesCalcs = Calculator.getSaleServicesWithCalcs(serviceSales);

                switch (metrica) {
                    case "VALOR_VENDA":
                        valorAcumulado = [...productSalesCalcs, ...serviceSalesCalcs].reduce((acc, { valorVenda }) => {
                            return (acc += valorVenda);
                        }, 0);
                        break;
                    case "MARKUP_BRUTO":
                        valorAcumulado = [...productSalesCalcs, ...serviceSalesCalcs].reduce((acc, { valorMarkup }) => {
                            return (acc += valorMarkup);
                        }, 0);
                        break;
                    case "MARKUP_LIQUIDO":
                        valorAcumulado = [...productSalesCalcs, ...serviceSalesCalcs].reduce(
                            (acc, { valorMarkupLiquido }) => {
                                return (acc += valorMarkupLiquido);
                            },
                            0
                        );
                        break;
                    // case "MARGEM":
                    //     valorAcumulado = [...productSalesCalcs, ...serviceSalesCalcs].reduce((acc, { valorMargem }) => {
                    //         return (acc += valorMargem);
                    //     }, 0);
                    //     break;
                }
                productServiceTypeWithTotalValue.push({ tipoProdServ, valorAcumulado });
            }
        }
        return productServiceTypeWithTotalValue;
    }

    public async getAchievedTarget(query: DashboardsWhere) {
        const { estadoVenda, dataInicio, dataFim, userRoleId, metrica, role } = query;

        const targetsCurrentYear = await this.targetService.findManyBy({
            where: { dataInicioMeta: dataInicio, dataFimMeta: dataFim, userRoleId, estadoVenda, userRole: role },
        });

        const initDatePast = new Date(dataInicio.setFullYear(dataInicio.getFullYear() - 1));
        const endDatePast = new Date(dataFim.setFullYear(dataFim.getFullYear() - 1));

        const targetsLastYear = await this.targetService.findManyBy({
            where: { dataInicioMeta: initDatePast, dataFimMeta: endDatePast, userRoleId, estadoVenda, userRole: role },
        });

        const valueCurrentTarget = targetsCurrentYear.reduce(
            (acc, meta) =>
                acc +
                meta.tiposMeta.reduce((acc, tm) => (acc += tm.tipoMeta === metrica ? tm.aceleratorTriggerValue : 0), 0),
            0
        );
        const valueCurrentAchievedTarget = targetsCurrentYear.reduce(
            (acc, meta) =>
                acc + meta.tiposMeta.reduce((acc, tm) => (acc += tm.tipoMeta === metrica ? tm.valorAtingido : 0), 0),
            0
        );
        const valueLastTarget = targetsLastYear.reduce(
            (acc, meta) =>
                acc +
                meta.tiposMeta.reduce((acc, tm) => (acc += tm.tipoMeta === metrica ? tm.aceleratorTriggerValue : 0), 0),
            0
        );
        const valueLastAchievedTarget = targetsLastYear.reduce(
            (acc, meta) =>
                acc + meta.tiposMeta.reduce((acc, tm) => (acc += tm.tipoMeta === metrica ? tm.valorAtingido : 0), 0),
            0
        );

        return {
            valorMetaAtual: valueCurrentTarget,
            valorMetaAtingidaAtual: valueCurrentAchievedTarget,
            valorMetaAnterior: valueLastTarget,
            valorMetaAtingidaAnterior: valueLastAchievedTarget,
        };
    }

    public async getContributionMargin(query: DashboardsWhere) {
        const { userRoleId, dataInicio, dataFim, estadoVenda } = query;
        const userRoleWhere = this.getSaleUsersParamsBy(query);

        const salesCurrentYear = await this.saleService.findManyBy({
            where: { gte_dataFaturamento: dataInicio, lte_dataFaturamento: dataFim, ...userRoleWhere, estadoVenda },
        });
        const valueCurrentContributionMargin = this.getContributionMarginTotals(salesCurrentYear, userRoleId);

        const initDatePast = new Date(dataInicio.setFullYear(dataInicio.getFullYear() - 1));
        const endDatePast = new Date(dataFim.setFullYear(dataFim.getFullYear() - 1));

        const salesLastYear = await this.saleService.findManyBy({
            where: {
                gte_dataFaturamento: initDatePast,
                lte_dataFaturamento: endDatePast,
                ...userRoleWhere,
                estadoVenda,
            },
        });

        const valueLastContributionMargin = this.getContributionMarginTotals(salesLastYear, userRoleId);
        return {
            margemContribuicaoAtual: valueCurrentContributionMargin,
            margemContribuicaoAnterior: valueLastContributionMargin,
        };
    }

    private getSaleUsersParamsBy(query: Pick<DashboardsWhere, "userRoleId" | "role">) {
        switch (query.role) {
            case "VENDEDOR":
                return { accountManagerId: query.userRoleId, role: query.role };
            case "COMERCIAL_MANAGER":
                return { comercialManagerId: query.userRoleId, role: query.role };
            case "COMERCIAL_ASSISTANT":
                return { comercialAssistantId: query.userRoleId, role: query.role };
            case "SOLUTION_ARCHITECT":
                return { solutionArchitectId: query.userRoleId, role: query.role };
            case "REFERRER":
                return { referrerId: query.userRoleId, role: query.role };
            default:
                return {};
        }
    }

    private getEvolutionByMonthForSales(sales: SaleInvoiceWithIncludes[]) {
        const mapSalesEvolutionByMonth = sales.reduce((acc, sale) => {
            sale.notasVenda.reduce((invoiceAcc, nv, index) => {
                const saleInvoicesCalculations = Calculator.getSaleInvoicesWithCalcs(sale.notasVenda)[index];
                const monthYear = `${nv.dataFaturamento?.getMonth() + 1}-${nv.dataFaturamento?.getFullYear()}`;

                if (!acc[monthYear]) {
                    acc[monthYear] = {
                        valorVenda: saleInvoicesCalculations.valorVenda,
                        markupBruto: saleInvoicesCalculations.valorMarkup,
                        markupLiquido: saleInvoicesCalculations.valorMarkupLiquido,
                        margem: saleInvoicesCalculations.valorMargemBruta,
                        qntdVendasIteradas: 1,
                    };
                    return acc;
                }
                const currentAcc = acc[monthYear];

                acc[monthYear] = {
                    valorVenda: currentAcc.valorVenda + saleInvoicesCalculations.valorVenda,
                    markupBruto: currentAcc.markupBruto + saleInvoicesCalculations.valorMarkup,
                    markupLiquido: currentAcc.markupLiquido + saleInvoicesCalculations.valorMarkupLiquido,
                    margem: currentAcc.margem + saleInvoicesCalculations.valorMargemBruta,
                    qntdVendasIteradas: currentAcc.qntdVendasIteradas + 1,
                };
                return invoiceAcc;
            }, {});
            return acc;
        }, {} as DashboardTypes.SaleEvolutionMappedByYearMonth);

        const salesEvolutionByMonth: DashboardTypes.SaleEvolutionWithYearMonth[] = Object.keys(mapSalesEvolutionByMonth)
            .map((monthYear) => ({
                mesAno: monthYear,
                valorVenda: mapSalesEvolutionByMonth[monthYear].valorVenda,
                markupBruto: mapSalesEvolutionByMonth[monthYear].markupBruto,
                markupLiquido: mapSalesEvolutionByMonth[monthYear].markupLiquido,
                margem: mapSalesEvolutionByMonth[monthYear].margem,
                qntdVendasIteradas: mapSalesEvolutionByMonth[monthYear].qntdVendasIteradas,
            }))
            .sort((a, b) => {
                const [mesA, anoA] = a.mesAno.split("-");
                const [mesB, anoB] = b.mesAno.split("-");
                const dataA = new Date();
                dataA.setMonth(Number(mesA));
                dataA.setFullYear(Number(anoA));
                const dataB = new Date();
                dataB.setMonth(Number(mesB));
                dataB.setFullYear(Number(anoB));
                return dataA.getTime() - dataB.getTime();
            });
        return salesEvolutionByMonth;
    }

    private getEvolutionByMonthForVisits(visitsData: DashboardTypes.VisitDataForEvolution[]) {
        const mapVisitsEvolutionByMonth = visitsData.reduce((acc, vcc) => {
            const monthYear = `${vcc.dataVisita.getMonth() + 1}-${vcc.dataVisita.getFullYear()}`;
            if (!acc[monthYear]) {
                acc[monthYear] = {
                    qntdVisitas: 1,
                };
                return acc;
            }
            const currentAcc = acc[monthYear];

            acc[monthYear] = {
                qntdVisitas: currentAcc.qntdVisitas + 1,
            };

            return acc;
        }, {} as DashboardTypes.MapVisitsEvolutionMappedByYearMonth);

        const visitsEvolutionByMonth: DashboardTypes.VisitEvolutionWithYearMonth[] = Object.keys(
            mapVisitsEvolutionByMonth
        )
            .map((monthYear) => ({
                mesAno: monthYear,
                qntdVisitas: mapVisitsEvolutionByMonth[monthYear].qntdVisitas,
            }))
            .sort((a, b) => {
                const [mesA, anoA] = a.mesAno.split("-");
                const [mesB, anoB] = b.mesAno.split("-");
                const dataA = new Date();
                dataA.setMonth(Number(mesA));
                dataA.setFullYear(Number(anoA));
                const dataB = new Date();
                dataB.setMonth(Number(mesB));
                dataB.setFullYear(Number(anoB));
                return dataA.getTime() - dataB.getTime();
            });
        return visitsEvolutionByMonth;
    }

    private getRevenueEvolutionByMonthForSales(
        sales: SaleDataForRevenueEvolution[],
        dataInicio: number,
        dataFim: number,
        userRoleId?: string
    ) {
        const mapSaleRevenueEvolutionByMonth = sales.reduce((acc, sale) => {
            sale.notasVenda.reduce((invoiceAcc, nv, index) => {
                const saleInvoicesCalculations = Calculator.getSaleInvoicesWithCalcs(sale.notasVenda)[index];

                nv.datasBoleto.forEach((dataBoleto) => {
                    if (dataBoleto.data.getMonth() >= dataInicio && dataBoleto.data.getMonth() <= dataFim) {
                        //getMonth() range 0-11
                        const monthYear = `${dataBoleto.data.getMonth() + 1}-${dataBoleto.data.getFullYear()}`;
                        const invoicesDatesLength = nv.datasBoleto.length;
                        const revenueValue = saleInvoicesCalculations.valorMargemBruta / invoicesDatesLength;

                        if (!acc[monthYear]) {
                            acc[monthYear] = {
                                faturamento: revenueValue,
                                qntdVendasIteradas: 1,
                            };
                            return acc;
                        }
                        const currentAcc = acc[monthYear];
                        acc[monthYear] = {
                            faturamento: currentAcc.faturamento + revenueValue,
                            qntdVendasIteradas: currentAcc.qntdVendasIteradas + 1,
                        };
                    }
                });
                return invoiceAcc;
            }, {});
            return acc;
        }, {} as RevenueEvolutionMappedByYearMonth);

        const salesRevenueEvolutionByMonth: RevenueEvolutionWithYearMonth[] = Object.keys(
            mapSaleRevenueEvolutionByMonth
        )
            .map((monthYear) => ({
                mesAno: monthYear,
                faturamento: mapSaleRevenueEvolutionByMonth[monthYear].faturamento,
                qntdVendasIteradas: mapSaleRevenueEvolutionByMonth[monthYear].qntdVendasIteradas,
            }))
            .sort((a, b) => {
                const [mesA, anoA] = a.mesAno.split("-");
                const [mesB, anoB] = b.mesAno.split("-");
                const dataA = new Date();
                dataA.setMonth(Number(mesA));
                dataA.setFullYear(Number(anoA));
                const dataB = new Date();
                dataB.setMonth(Number(mesB));
                dataB.setFullYear(Number(anoB));
                return dataA.getTime() - dataB.getTime();
            });

        return salesRevenueEvolutionByMonth;
    }

    private getSalesTotalValues(sales: SaleInvoiceWithIncludes[]) {
        return sales.reduce(
            (acc, sale) => {
                const saleCalculations = Calculator.getSalesWithCalcs([sale])[0];
                return {
                    valorVenda: acc.valorVenda + saleCalculations.valorVenda,
                    valorMargem: acc.valorMargem + saleCalculations.valorMargemBruta,
                    valorMarkup: acc.valorMarkup + saleCalculations.valorMarkup,
                    valorMarkupLiquido: acc.valorMarkupLiquido + saleCalculations.valorMarkupLiquido,
                };
            },
            {
                valorVenda: 0,
                valorMargem: 0,
                valorMarkup: 0,
                valorMarkupLiquido: 0,
            }
        );
    }

    private getRevenueTotalValues(sales: SaleInvoiceWithIncludes[], initDate?: Date, endDate?: Date) {
        return sales.reduce(
            (acc, sale) => {
                const totalBillingInvoices = sale.notasVenda.reduce((acc, saleInvoice, index) => {
                    const saleInvoicesCalculations = Calculator.getSaleInvoicesWithCalcs(sale.notasVenda)[index];
                    const totalBillingDate = saleInvoice.datasBoleto.length;
                    if (totalBillingDate === 0) return acc;

                    let invoicesBetweenDatesCount = 0;
                    if (initDate && endDate)
                        invoicesBetweenDatesCount = saleInvoice.datasBoleto.filter(
                            (boleto: { data: Date }) => boleto.data >= initDate && boleto.data <= endDate
                        ).length;

                    const invoiceRevenue =
                        (saleInvoicesCalculations.valorMargemBruta / totalBillingDate) * invoicesBetweenDatesCount;
                    return acc + invoiceRevenue;
                }, 0);

                return {
                    valorFaturamento: acc.valorFaturamento + totalBillingInvoices,
                };
            },
            { valorFaturamento: 0 }
        );
    }

    private getContributionMarginTotals(sales: SaleInvoiceWithIncludes[], userRoleId?: string) {
        const totalsValues = sales
            .map((sale) => {
                const saleCalculations = Calculator.getSalesWithCalcs([sale])[0];

                const totalSaleCommissions = sale.notasVenda.reduce((comissionAcc, notaVenda) => {
                    const filteredCommissions = notaVenda.comissoes.filter((commmission) =>
                        userRoleId ? commmission.userRoleId === userRoleId : true
                    );
                    const totalCommissionValue = filteredCommissions.reduce(
                        (sum, commission) => sum + CommissionService.getCommissionValues(commission).totalExpected,
                        0
                    );
                    return comissionAcc + totalCommissionValue;
                }, 0);

                return {
                    valorVenda: saleCalculations.valorVenda,
                    margemBruta: saleCalculations.valorMargemBruta,
                    comissoesTotais: totalSaleCommissions,
                };
            })
            .reduce(
                (acc, { valorVenda, margemBruta, comissoesTotais }) => {
                    acc.valorVenda += valorVenda;
                    acc.margemBruta += margemBruta;
                    acc.comissoesTotais += comissoesTotais;
                    return acc;
                },
                { valorVenda: 0, margemBruta: 0, comissoesTotais: 0 }
            );

        const marginContributionTotal =
            totalsValues.valorVenda > 0
                ? ((totalsValues.margemBruta - totalsValues.comissoesTotais) * 100) / totalsValues.valorVenda
                : 0;

        return marginContributionTotal;
    }
}
