import {
    ValidFindCommissionReports,
    ValidFindSalesReports,
    ValidFindUserReports,
    ValidFindVisitReports,
} from "../validations/report.validator";
import { VisitWithCustomers, VisitWithExpenses, VisitWithSalePersonRoles } from "../types/visit.types";
import { CommissionWithSale, CommissionWithSalePersonRole } from "../types/commission.types";
import { SaleWithClientSaleInvoice } from "../types/sale.types";
import { UserWithRoles } from "../types/user-role.types";
import { Header } from "../utils/pdfkit";

import OrganizationService from "../services/organization.service";
import setReportsPdf, { TypePdf } from "../utils/set-report-pdf";
import CommissionService from "../services/commission.service";
import ReportService from "../services/report.service";
import TargetService from "../services/target.service";
import VisitService from "../services/visit.service";
import SaleService from "../services/sale.service";
import UserService from "../services/user.service";
import httpStatus from "../utils/httpStatus";
import catchAsync from "../utils/catchAsync";
import ApiError from "../utils/apiError";
import express from "express";

export default class ReportController {
    private static getOrgContextRequest = async (req: express.Request) => {
        const organizationService = new OrganizationService(req.context);

        const organization = await organizationService.getOneByContext();
        if (!organization) throw new ApiError(httpStatus.NOT_FOUND, "Empresa não encontrada.");

        return organization;
    };
    private static setContextSalesRequest = async (req: express.Request) => {
        const salesService = new SaleService(req.context);
        const validRequest = req as unknown as ValidFindSalesReports;

        const startDate = validRequest.query.where.gte_dataVenda as Date;
        const endDate = validRequest.query.where.lte_dataVenda as Date;
        const intervalDate = !validRequest.body.salesIds ? { startDate, endDate } : undefined;

        const organization = await this.getOrgContextRequest(req);

        return { organization, salesService, validRequest, intervalDate };
    };

    public static findManyVisitsReports = catchAsync(async (req, res) => {
        const visitService = new VisitService(req.context);
        const validRequest = req as unknown as ValidFindVisitReports;

        const startDate = validRequest.query.where.gte_dataVisita as Date;
        const endDate = validRequest.query.where.lte_dataVisita as Date;

        const organization = await this.getOrgContextRequest(req);

        let visitsFiltered: (VisitWithCustomers & VisitWithExpenses & VisitWithSalePersonRoles)[] = [];

        const type = TypePdf.VISIT;

        if (validRequest.body.visitsIds.length < 1) visitsFiltered = await visitService.findManyBy(validRequest.query);
        else visitsFiltered = await visitService.findAllIn(validRequest.body.visitsIds, validRequest.query.where);

        const infoVendedoresRows = ReportService.getSaleVisitsInfoRows(visitsFiltered);

        const title = "Relatório de Gastos em Visitas";
        const filename = "relatorio_gastos_visitas";
        const intervalDate = validRequest.body.visitsIds.length < 1 ? { startDate, endDate } : undefined;
        const headers: Header[] = [
            { text: "Data" },
            { text: "Código Nota" },
            { text: "Cliente" },
            { text: "Gasto Pago" },
            { text: "Valor", options: { xAlign: "center" } },
        ];

        setReportsPdf(type, title, headers, filename, infoVendedoresRows, res, organization, intervalDate);
    });

    public static findManyCommissionReports = catchAsync(async (req, res) => {
        const commissionService = new CommissionService(req.context);
        const validRequest = req as unknown as ValidFindCommissionReports;

        const startDate = validRequest.query.where.gte_dataComissao as Date;
        const endDate = validRequest.query.where.lte_dataComissao as Date;

        const organization = await this.getOrgContextRequest(req);

        let commissionsFiltered: (CommissionWithSale & CommissionWithSalePersonRole)[] = [];

        const type = TypePdf.COMMISSION;

        if (!validRequest.body.commissionsIds)
            commissionsFiltered = await commissionService.findManyBy(validRequest.query);
        else
            commissionsFiltered = await commissionService.findAllIncludesIn(
                validRequest.body.commissionsIds,
                validRequest.query.where
            );

        const salePersonInfoRows = await ReportService.generateCommissionSaleInfoRows(commissionsFiltered);

        const title = "Relatório de Comissões";
        const filename = "relatorio_comissoes";
        const intervalDate = !validRequest.body.commissionsIds ? { startDate, endDate } : undefined;
        const headers: Header[] = [
            { text: "Data" },
            { text: "Código Nota" },
            { text: "Cliente" },
            { text: "Comissão Paga" },
            { text: "Comi./Acel." },
            { text: "Valor Aprovado", options: { xAlign: "center" } },
        ];

        setReportsPdf(type, title, headers, filename, salePersonInfoRows, res, organization, intervalDate);
    });

    private static findManySalesReports = async (validRequest: ValidFindSalesReports, salesService: SaleService) => {
        let salesFiltered: SaleWithClientSaleInvoice[] = [];
        if (!validRequest.body.salesIds) salesFiltered = await salesService.findManyBy(validRequest.query);
        else salesFiltered = await salesService.findAllIncludesIn(validRequest.body.salesIds, validRequest.query.where);

        return { salesFiltered };
    };

    public static clientSaleReports = catchAsync(async (req, res) => {
        const { salesService, organization, validRequest, intervalDate } = await this.setContextSalesRequest(req);
        const { salesFiltered } = await this.findManySalesReports(validRequest, salesService);

        const type = TypePdf.SALE_CLIENTS;

        const saleNameInfoRows = await ReportService.generateSaleNameInfoRows(type, salesFiltered);

        const title = "Relatório de Vendas por Cliente";
        const filename = "vendas_clientes";
        const headers: Header[] = [
            { text: "Data Venda" },
            { text: "AM" },
            { text: "Valor Venda" },
            { text: "Markup Bruto" },
            { text: "% Markup Bruto", options: { xAlign: "center" } },
        ];

        setReportsPdf(type, title, headers, filename, saleNameInfoRows, res, organization, intervalDate);
    });

    public static userSaleReports = catchAsync(async (req, res) => {
        const { intervalDate, salesService, organization, validRequest } = await this.setContextSalesRequest(req);
        const { salesFiltered } = await this.findManySalesReports(validRequest, salesService);

        const type = TypePdf.SALE_USER;

        const saleNameInfoRows = await ReportService.generateSaleNameInfoRows(type, salesFiltered);

        const title = "Relatório de Vendas por Gerente/AM";
        const filename = "vendas_gerentes";
        const headers: Header[] = [
            { text: "Data Venda" },
            { text: "Cliente" },
            { text: "Valor Venda" },
            { text: "Markup Bruto" },
            { text: "% Markup Bruto", options: { xAlign: "center" } },
        ];

        setReportsPdf(type, title, headers, filename, saleNameInfoRows, res, organization, intervalDate);
    });

    public static userRolesSalesReports = catchAsync(async (req, res) => {
        const userService = new UserService(req.context);
        const validRequest = req as unknown as ValidFindUserReports;
        const { intervalDate, salesService, organization } = await this.setContextSalesRequest(req);

        let usersFiltered: UserWithRoles[] = [];

        const type = TypePdf.USER;

        if (!validRequest.body.usersIds) {
            usersFiltered = await userService.findManyBy(validRequest.query);
        } else {
            usersFiltered = await userService.findAllRolesInUsers(
                validRequest.body.usersIds,
                validRequest.query.where.role
            );
        }
        const userWithRolesReduced = usersFiltered.flatMap((user) =>
            user.userRoles.flatMap((role) => ({
                userName: user.name,
                roleId: role.id,
                role: role.role,
            }))
        );

        //filter to only use commercial types Roles for search sales
        const UserWithRolesFiltered = userWithRolesReduced.filter(
            (role) =>
                role.role === "COMERCIAL_ASSISTANT" ||
                role.role === "COMERCIAL_MANAGER" ||
                role.role === "SOLUTION_ARCHITECT" ||
                role.role === "REFERRER" ||
                role.role === "VENDEDOR"
        );

        const userRoles = UserWithRolesFiltered.map((role) => role.roleId);
        //saleService to search for all sales with roleId between the selected date
        const salesWithUserRole = await salesService.findAllSalesByUserRoles(userRoles, intervalDate);

        //Get UserRole target Sale for selected Month
        const targetService = new TargetService(req.context);
        const targetUserRoleSelectedDate = await targetService.findManyByRoleIdforUserReport(userRoles, intervalDate);

        const infoSalesWithUserRoleRows = ReportService.getSaleUserInfoRowsReport(
            UserWithRolesFiltered,
            salesWithUserRole,
            targetUserRoleSelectedDate
        );

        const title = "Relatório de Participações";
        const filename = "relatorio_participacoes";

        const headers: Header[] = [
            { text: "Data" },
            { text: "Cliente" },
            { text: "Valor Venda" },
            { text: "Markup Bruto" },
            { text: "% Markup Bruto", options: { xAlign: "center" } },
        ];

        setReportsPdf(type, title, headers, filename, infoSalesWithUserRoleRows, res, organization, intervalDate);
    });
}
