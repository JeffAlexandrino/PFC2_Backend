import { OrganizationWithLogo } from "../types/organization.types";
import { Header, Report, SalePersonInfoRows } from "./pdfkit";
import { IntervalDateType } from "../types/commom.types";
import { Response } from "express";

export enum TypePdf {
    SALE_CLIENTS = "saleClients",
    SALE_USER = "saleUser",
    COMMISSION = "commission",
    VISIT = "visit",
    USER = "user",
}

export default function setReportsPdf(
    type: TypePdf,
    title: string,
    headers: Header[],
    filename: string,
    saleNameInfoRows: SalePersonInfoRows[],
    res: Response,
    organization: OrganizationWithLogo,
    intervalDate?: IntervalDateType
) {
    const report = Report.createPipe(type, title, headers, saleNameInfoRows, res, organization, intervalDate);

    res.writeHead(200, {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=relatorio_${filename}.pdf`,
    });
    return report.end();
}
