import { MapSalesAndNameBySaleNameId } from "../types/sale-person.types";
import { TargetWithSalePersonAndTypes } from "../types/target.types";
import { formatCurrencyBR, RowCell, SalePersonInfoRows } from "../utils/pdfkit";
import { SaleWithUserRole } from "../types/sale.types";
import { RequestContext } from "../middlewares/auth";
import { TypePdf } from "../utils/set-report-pdf";
import { Calculator } from "../utils/calculator";
import { Role, TipoMeta } from "@prisma/client";

import CommissionService from "./commission.service";
import ApiError from "../utils/apiError";

import * as TC from "../types/commission.types";
import * as TV from "../types/visit.types";
import * as TS from "../types/sale.types";

export default class ReportService {
    private readonly context: RequestContext;
    constructor(context: RequestContext) {
        //gets the infos of the logged user doing requests
        this.context = context;
    }

    public static getSaleUserInfoRowsReport = (
        UserWithRolesFiltered: { userName: string; role: Role; roleId: string }[],
        SalesWithUserRoles: SaleWithUserRole[],
        targetUserRoleSelectedDate: TargetWithSalePersonAndTypes[]
    ) => {
        return UserWithRolesFiltered.map((userRoles): SalePersonInfoRows => {
            let VendaTotal = 0;
            let ValorMeta = 0;
            let MarkupTotal = 0;
            const salesTargets = targetUserRoleSelectedDate.flatMap((target) => {
                const isUserRole = target.userRoleId === userRoles.roleId;
                return isUserRole ? target.tiposMeta.filter((t) => t.tipoMeta === TipoMeta.VALOR_VENDA) : [];
            });
            salesTargets.forEach((target) => {
                ValorMeta += target.aceleratorTriggerValue;
            });

            const InfoRows = {
                name: userRoles.userName,
                role: userRoles.role,
                rows: SalesWithUserRoles.map((sale): RowCell[] => {
                    if (
                        sale.accountManager?.id !== userRoles.roleId &&
                        sale.insideSales?.id !== userRoles.roleId &&
                        sale.comercialManager?.id !== userRoles.roleId &&
                        sale.comercialAssistant?.id !== userRoles.roleId &&
                        sale.referrer?.id !== userRoles.roleId &&
                        sale.solutionArchitect?.id !== userRoles.roleId
                    ) {
                        //Because the sales comes with different users
                        return [];
                    }

                    const salesWithCalcs = Calculator.getSalesWithCalcs([sale]);
                    if (salesWithCalcs.at(0)?.notasVenda === undefined) {
                        throw new ApiError(500, "Error with saleUser Calcs, Please contact ADM.");
                    }
                    const valorCusto = salesWithCalcs.at(0)?.valorCusto ?? 0;
                    const valorMarkup = salesWithCalcs.at(0)?.valorMarkup ?? 0;
                    VendaTotal += salesWithCalcs.at(0)?.valorVenda ?? 0;
                    MarkupTotal += valorMarkup;

                    return [
                        {
                            text: sale.dataVenda.toLocaleDateString("pt-BR", {
                                timeZone: "America/Sao_Paulo",
                            }),
                        },
                        { text: sale.cliente.name ?? "" },
                        { text: formatCurrencyBR(salesWithCalcs.at(0)?.valorVenda ?? 0) },
                        { text: formatCurrencyBR(valorMarkup) },
                        { text: ((valorMarkup / valorCusto) * 100).toFixed(2), options: { xAlign: "center" } },
                    ];
                }),
                valoresTotais: {
                    faltaPagar: ValorMeta,
                    pago: VendaTotal,
                    valorMarkup: MarkupTotal,
                },
            };
            InfoRows.rows = InfoRows.rows.filter((row) => row.length > 1);
            return InfoRows;
        });
    };

    private static setTableRowsForReport = (
        type: TypePdf,
        sale: TS.SaleWithClientSaleInvoice,
        saleValues: TS.SaleCalc[]
    ) => {
        let textSpace2 = "";
        let textSpace4 = "";
        let textSpace5 = "";
        if (type === TypePdf.SALE_USER) {
            const valorMarkup = saleValues.at(0)?.valorMarkup ?? 0;
            const valorCusto = saleValues.at(0)?.valorCusto ?? 1;
            textSpace2 = sale.cliente?.name ?? "N/A";
            textSpace4 = formatCurrencyBR(valorMarkup);
            textSpace5 = ((valorMarkup / valorCusto) * 100).toFixed(2);
            return [
                {
                    text: sale.dataVenda.toLocaleDateString("pt-BR", {
                        timeZone: "America/Sao_Paulo",
                    }),
                },
                { text: textSpace2 },
                { text: formatCurrencyBR(saleValues.at(0)?.valorVenda ?? 0) },
                { text: textSpace4 },
                { text: textSpace5, options: { xAlign: "center" } },
            ] as RowCell[];
        }
        if (type === TypePdf.SALE_CLIENTS) {
            const valorMarkup = saleValues.at(0)?.valorMarkup ?? 0;
            const valorCusto = saleValues.at(0)?.valorCusto ?? 1;
            textSpace2 = sale.accountManager?.user.name ?? "N/A";
            textSpace4 = formatCurrencyBR(valorMarkup);
            textSpace5 = ((valorMarkup / valorCusto) * 100).toFixed(2);
            return [
                {
                    text: sale.dataVenda.toLocaleDateString("pt-BR", {
                        timeZone: "America/Sao_Paulo",
                    }),
                },
                { text: textSpace2 },
                { text: formatCurrencyBR(saleValues.at(0)?.valorVenda ?? 0) },
                { text: textSpace4 },
                { text: textSpace5, options: { xAlign: "center" } },
            ] as RowCell[];
        }
    };

    public static mapSalesDataByClientId = (sales: TS.SaleWithClientSaleInvoice[]) =>
        sales.reduce((acc, sale) => {
            if (!acc[sale.clienteId])
                acc[sale.clienteId] = {
                    name: sale.cliente.name,
                    sales: [],
                };
            acc[sale.clienteId].sales.push(sale);
            return acc;
        }, {} as MapSalesAndNameBySaleNameId);

    public static mapSalesDataByUserId = (sales: TS.SaleWithClientSaleInvoice[]) =>
        sales.reduce((acc, sale) => {
            if (!acc[sale.comercialManagerId ?? sale.accountManagerId!])
                acc[sale.comercialManagerId ?? sale.accountManagerId!] = {
                    name: sale.comercialManager?.user.name ?? sale.accountManager?.user.name ?? "N/A",
                    sales: [],
                };
            acc[sale.comercialManagerId ?? sale.accountManagerId!].sales.push(sale);
            return acc;
        }, {} as MapSalesAndNameBySaleNameId);

    public static generateSaleNameInfoRows = async (type: TypePdf, salesFiltered: TS.SaleWithClientSaleInvoice[]) => {
        const mapSalesDataByNameId =
            type === TypePdf.SALE_CLIENTS
                ? ReportService.mapSalesDataByClientId(salesFiltered)
                : ReportService.mapSalesDataByUserId(salesFiltered);

        const saleNameIds = Object.keys(mapSalesDataByNameId);

        return saleNameIds.map((saleNameId): SalePersonInfoRows => {
            let CustoTotal = 0;
            let VendaTotal = 0;
            let MarkupTotal = 0;
            const saleNameInfo = mapSalesDataByNameId[saleNameId];
            return {
                name: saleNameInfo.name,
                rows: saleNameInfo.sales.map((sale): RowCell[] => {
                    const salesWithCalcs = Calculator.getSalesWithCalcs([sale]);
                    CustoTotal += salesWithCalcs.at(0)?.valorCusto || 0;
                    VendaTotal += salesWithCalcs.at(0)?.valorVenda || 0;
                    MarkupTotal += salesWithCalcs.at(0)?.valorMarkup || 0;
                    if (salesWithCalcs.at(0)?.notasVenda === undefined) {
                        throw new ApiError(500, "Error with sale Calcs, Please contact ADM.");
                    }
                    return this.setTableRowsForReport(type, sale, salesWithCalcs) ?? [];
                }),
                valoresTotais: { pago: CustoTotal, faltaPagar: VendaTotal, valorMarkup: MarkupTotal },
            };
        });
    };

    public static getSaleVisitsInfoRows = (
        visits: (TV.VisitWithCustomers & TV.VisitWithExpenses & TV.VisitWithSalePersonRoles)[]
    ) => {
        const mapVisitsAndNameBySalePersonRoleId = visits.reduce((acc, visit) => {
            if (!acc[visit.salePersonId as string])
                acc[visit.salePersonId as string] = { name: visit.salePerson?.user.name as string, visitas: [] };
            acc[visit.salePersonId as string].visitas.push(visit);
            return acc;
        }, {} as TV.MapVisitsAndNameBySalePersonRoleId);

        const salePersonRoleIds = Object.keys(mapVisitsAndNameBySalePersonRoleId);
        return salePersonRoleIds.map((salePersonRoleId): SalePersonInfoRows => {
            let totalPaid = 0;
            let totalPending = 0;

            const salePersonInfo = mapVisitsAndNameBySalePersonRoleId[salePersonRoleId];
            return {
                name: salePersonInfo.name,
                rows: salePersonInfo.visitas.flatMap((visit) => {
                    return visit.gastos.map((expense): RowCell[] => {
                        if (visit.visitaPaga) totalPaid += expense.valor;
                        else totalPending += expense.valor;
                        return [
                            { text: visit.dataVisita.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }) },
                            { text: expense.nota ?? "" },
                            { text: visit.cliente.name },
                            { text: visit.visitaPaga ? "Sim" : "Não" },
                            { text: formatCurrencyBR(expense.valor), options: { xAlign: "center" } },
                        ];
                    });
                }),
                valoresTotais: {
                    pago: totalPaid,
                    faltaPagar: totalPending,
                },
            };
        });
    };

    public static generateCommissionSaleInfoRows = async (
        commissions: (TC.CommissionWithSalePersonRole & TC.CommissionWithSale)[]
    ) => {
        const mapCommissionsAndNameBySalePersonRoleId = commissions.reduce((acc, commission) => {
            if (!acc[commission.userRoleId])
                acc[commission.userRoleId] = {
                    name: commission.userRole.user.name,
                    comissoes: [],
                };
            acc[commission.userRoleId].comissoes.push(commission);
            return acc;
        }, {} as TC.MapCommissionsAndNameBySalePersonRoleId);

        const salePersonRolesIds = Object.keys(mapCommissionsAndNameBySalePersonRoleId);
        return salePersonRolesIds.map((salePersonRoleId): SalePersonInfoRows => {
            let totalPaid = 0;
            let totalPending = 0;
            const salePersonInfo = mapCommissionsAndNameBySalePersonRoleId[salePersonRoleId];
            return {
                name: salePersonInfo.name,
                rows: salePersonInfo.comissoes.map((commission): RowCell[] => {
                    const { totalApproved, approvedAccelerator, approvedCommission } =
                        CommissionService.getCommissionValues(commission);

                    if (commission.comissaoPaga) totalPaid += totalApproved;
                    else totalPending += totalApproved;

                    return [
                        {
                            text: commission.dataComissao.toLocaleDateString("pt-BR", {
                                timeZone: "America/Sao_Paulo",
                            }),
                        },
                        { text: commission.notaVenda?.codigo ?? "—-Aguardando—-" },
                        { text: commission.venda.cliente.name },
                        { text: commission.comissaoPaga ? "Sim" : "Não" },
                        {
                            text: `${approvedCommission.toFixed(2)}% / ${approvedAccelerator.toFixed(2)}%`,
                        },
                        { text: formatCurrencyBR(totalApproved), options: { xAlign: "center" } },
                    ];
                }),
                valoresTotais: { pago: totalPaid, faltaPagar: totalPending },
            };
        });
    };
}
