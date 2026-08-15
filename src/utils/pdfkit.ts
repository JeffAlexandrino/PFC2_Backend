import { OrganizationWithLogo } from "../types/organization.types";
import { IntervalDateType } from "../types/commom.types";
import { TypePdf } from "./set-report-pdf";
import { Role } from "@prisma/client";
import { Response } from "express";

import UserRoleUtils from "./user-role.utils";
import PDFDocument from "pdfkit-table";

type BorderSide = "top" | "bottom" | "left" | "right";
type HorizontalAlign = "center" | "justify" | "left" | "right";
type VerticalAlign = "center" | "top" | "bottom";

type TextOptions = {
    xAlign?: HorizontalAlign;
    yAlign?: VerticalAlign;
    width?: number;
    height?: number;
    textColor?: string;
    xPadding?: number;
    yPadding?: number;
};

type CellOptions = {
    width?: number;
    height?: number;
    xAlign?: HorizontalAlign;
    yAlign?: VerticalAlign;
    color?: string;
    textColor?: string;
    withoutBorder?: BorderSide;
    xPadding?: number;
    yPadding?: number;
};

type RowCellOptions = { xAlign?: HorizontalAlign; yAlign?: VerticalAlign };
type HeaderOptions = { xAlign?: HorizontalAlign; yAlign?: VerticalAlign; relativeWidth?: number };

export type Header = { text: string; options?: HeaderOptions };
export type RowCell = { text: string; options?: RowCellOptions };
export type TotalValues = { pago: number; faltaPagar: number; valorMarkup?: number };
export type SalePersonInfoRows = { name: string; role?: Role; valoresTotais: TotalValues; rows: RowCell[][] };

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
export const formatCurrencyBR = (value: number) => currencyFormatter.format(value).replace(/\u00A0/g, " ");

export class Report extends PDFDocument {
    titleFontSize = 20;
    focusFontSize = 14;
    regularFontSize = 12;

    yPadding = 30;
    xPadding = 30;

    widthLogo = 80;
    heightLogo = 80;

    primaryFont = "Helvetica";
    primaryColor = "#3f557f";
    headerTextColor = "white";
    regularColor = "black";

    borderWidth = 0.1;

    maxWidthContent = this.page.width - 2 * this.xPadding;

    yCorrectionOrgName = 30;

    headerEndPosY = 0;
    saveHeaders: Header[] = [];

    private setTitle(title: string) {
        const topMargim = 4;
        const yPosition = this.yPadding + topMargim;

        this.font(this.primaryFont)
            .fontSize(this.titleFontSize)
            .fillColor(this.primaryColor)
            .text(title, this.xPadding, yPosition);
    }

    private setSalesPersonName(name: string) {
        const topMargim = 28;
        const yPosition = this.yPadding + topMargim;

        this.font(this.primaryFont)
            .fontSize(this.focusFontSize)
            .fillColor(this.primaryColor)
            .text(name, this.xPadding, yPosition);
    }

    private setSalesPersonRole(role: Role, name: string) {
        const topMargim = 28;
        const yPosition = this.yPadding + topMargim;
        const xPosition = this.xPadding + this.widthOfString(`${name}`);

        this.font(this.primaryFont)
            .fontSize(this.focusFontSize)
            .fillColor(this.primaryColor)
            .text(` | ${UserRoleUtils.getRoleDescription(role)}`, xPosition, yPosition);
    }

    // Formata as datas no formato brasileiro
    private setIntervalDate(intervalDate: IntervalDateType) {
        const startDateText = intervalDate.startDate.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
        const endDateText = intervalDate.endDate.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });

        const topMargim = 48;
        const yPosition = this.yPadding + topMargim;

        this.font(this.primaryFont)
            .fontSize(this.regularFontSize)
            .fillColor(this.primaryColor)
            .text(`Período: ${startDateText} - ${endDateText}`, this.xPadding, yPosition);
    }

    // Data de geração do relatorio no formato brasileiro
    private setActualDate(date: Date) {
        const dateText = date.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
        this.font(this.primaryFont).fontSize(10);
        const textWidth = this.widthOfString(`Gerado em: ${dateText}`);
        const xPosition = this.page.width - this.xPadding - textWidth;
        const yPosition = this.yPadding - 20;
        this.fillColor(this.primaryColor).text(`Gerado em: ${dateText}`, xPosition, yPosition);
    }

    private setTotalValues(totalValues: TotalValues, type: TypePdf) {
        let textTop = "";
        let textBottom = "";
        let textMarkup = "Total Markup";
        switch (type) {
            case TypePdf.SALE_CLIENTS:
                textTop = "Total Venda";
                textBottom = "Total Custo";
                break;
            case TypePdf.SALE_USER:
                textTop = "Total Venda";
                textBottom = "Total Custo";
                break;
            case TypePdf.USER:
                textTop = "Total Meta Venda";
                textBottom = "Total Venda";
                break;
            default:
                textTop = "Falta pagar";
                textBottom = "Valor pago";
                break;
        }
        this.font(this.primaryFont)
            .fontSize(this.regularFontSize)
            .fillColor(this.regularColor)
            .text(`${textTop}: ${formatCurrencyBR(totalValues.faltaPagar)}`, this.xPadding);
        this.font(this.primaryFont)
            .fontSize(this.regularFontSize)
            .fillColor(this.regularColor)
            .text(`${textBottom}: ${formatCurrencyBR(totalValues.pago)}`, this.xPadding);
        totalValues.valorMarkup !== undefined &&
            this.font(this.primaryFont)
                .fontSize(this.regularFontSize)
                .fillColor(this.regularColor)
                .text(`${textMarkup}: ${formatCurrencyBR(totalValues.valorMarkup)}`, this.xPadding);
    }

    private setOrganizationName(name: string) {
        const yCorrection = 10;
        const xPosition = this.page.width - this.xPadding - this.widthLogo;
        const yPosition = this.yPadding - yCorrection;
        const newYPositionForOrgName = yPosition + this.yCorrectionOrgName;

        const truncatedName = name.length > 17 ? name.slice(0, 17) + "." : name;
        this.font(this.primaryFont)
            .fontSize(this.focusFontSize)
            .text(truncatedName, xPosition, newYPositionForOrgName, { width: this.widthLogo })
            .fillColor(this.primaryColor);
    }

    private setLogo(logoBuffer: Uint8Array) {
        const yCorrection = 10;
        const xPosition = this.page.width - this.xPadding - this.widthLogo;
        const yPosition = this.yPadding - yCorrection;

        this.rect(xPosition, yPosition, this.widthLogo, this.heightLogo).fill(this.primaryColor);

        const logoPath = Buffer.from(logoBuffer);
        this.image(logoPath, xPosition, yPosition, { width: this.widthLogo, height: this.heightLogo });
    }

    private paintCell(initPosX: number, endPosX: number, initPosY: number, endPosY: number, color: string) {
        this.rect(
            initPosX + this.borderWidth,
            initPosY + this.borderWidth,
            endPosX - initPosX - this.borderWidth,
            endPosY - initPosY - this.borderWidth
        ).fill(color);
    }
    private setBorderCell(
        initPosX: number,
        endPosX: number,
        initPosY: number,
        endPosY: number,
        withoutBorder?: BorderSide
    ) {
        this.lineWidth(this.borderWidth);
        if (withoutBorder !== "top") this.moveTo(initPosX, initPosY).lineTo(endPosX, initPosY).stroke();
        if (withoutBorder !== "right") this.moveTo(endPosX, initPosY).lineTo(endPosX, endPosY).stroke();
        if (withoutBorder !== "bottom") this.moveTo(endPosX, endPosY).lineTo(initPosX, endPosY).stroke();
        if (withoutBorder !== "left") this.moveTo(initPosX, endPosY).lineTo(initPosX, initPosY).stroke();
    }

    private setTextCell(text: string, x: number, y: number, options?: TextOptions) {
        const width = (options?.width ?? 0) - 2 * (options?.xPadding ?? 0);
        const heihgt = (options?.height ?? 0) - 2 * (options?.yPadding ?? 0);

        const heightText = this.heightOfString(text, { width });
        const yCorrectionBottom = heihgt - heightText;
        const yCorrectionCenter = (heihgt - heightText) / 2;
        const yCorrection =
            options?.yAlign === "bottom"
                ? yCorrectionBottom
                : options?.yAlign === "center"
                  ? yCorrectionCenter
                  : (options?.yPadding ?? 0);

        const xPos = x + (options?.xPadding ?? 0);
        const yPos = y + yCorrection;

        this.fillColor(options?.textColor ?? this.regularColor);
        this.text(text, xPos, yPos, { width, align: options?.xAlign });
    }

    private setCell(text: string, x?: number, y?: number, options?: CellOptions) {
        const initPosX = x ?? this.x;
        const endPosX = initPosX + (options?.width ?? 0);
        const initPosY = y ?? this.y;
        const endPosY = initPosY + (options?.height ?? 0);

        if (options?.color) this.paintCell(initPosX, endPosX, initPosY, endPosY, options.color);
        this.setBorderCell(initPosX, endPosX, initPosY, endPosY, options?.withoutBorder);
        this.setTextCell(text, initPosX, initPosY, {
            textColor: options?.textColor,
            width: options?.width,
            height: options?.height,
            xAlign: options?.xAlign,
            yAlign: options?.yAlign,
            xPadding: options?.xPadding,
            yPadding: options?.yPadding,
        });
    }

    private setHeaders(headers: Header[]) {
        this.saveHeaders = headers;

        if (headers.length === 0) return;
        const defaultWidhtCell = this.maxWidthContent / headers.length;
        const headerHeight = 25;
        const horizontalPadding = 5;

        this.headerEndPosY = this.y + headerHeight;

        const currentPosX = this.x;
        const currentPosY = this.y;

        headers.map((header, index) => {
            const xPos = currentPosX + index * defaultWidhtCell;

            this.setCell(header.text, xPos, currentPosY, {
                width: header.options?.relativeWidth
                    ? (header.options.relativeWidth * this.maxWidthContent) / 100
                    : defaultWidhtCell,
                height: headerHeight,
                xPadding: horizontalPadding,
                xAlign: header.options?.xAlign ?? "left",
                yAlign: header.options?.yAlign ?? "center",
                textColor: this.headerTextColor,
                color: this.primaryColor,
                withoutBorder: index === 0 ? undefined : "left",
            });
        });
    }

    private canWriteRowOnPage(currentPosY: number, rowHeight: number) {
        return currentPosY + rowHeight < this.page.height - this.yPadding;
    }

    private calculateBodyRowHeight(row: RowCell[], xPaddingCell?: number, yPaddingCell?: number) {
        let maxHeight = 0;
        row.forEach((cell, index) => {
            const widthCell = this.calculateCellWidth(index);

            const heihgtCell = this.heightOfString(cell.text, { width: widthCell - 2 * (xPaddingCell ?? 0) });
            if (heihgtCell > maxHeight) maxHeight = heihgtCell;
        });
        return maxHeight + (yPaddingCell ?? 0);
    }

    private calculateCellWidth(cellIndex: number): number {
        if (this.saveHeaders.length < 1) return 0;
        const defaultCellWidth = this.maxWidthContent / this.saveHeaders.length;
        if (
            cellIndex < 0 ||
            cellIndex >= this.saveHeaders.length ||
            this.saveHeaders[cellIndex].options === undefined
        ) {
            return defaultCellWidth;
        }
        const relativeWidth = this.saveHeaders[cellIndex].options.relativeWidth;
        const cellWidth =
            typeof relativeWidth === "number" ? (relativeWidth * this.maxWidthContent) / 100 : defaultCellWidth;
        return cellWidth;
    }

    private setRows(rows: RowCell[][]) {
        if (this.saveHeaders.length < 1) return;
        const defaultWidthCell = this.maxWidthContent / this.saveHeaders.length;
        const horizontalPadding = 5;
        const verticalPadding = 5;

        if (!rows || rows.length === 0) {
            const currentPosY = this.headerEndPosY;
            this.setCell("Não existem dados para os filtros selecionados.", this.xPadding, currentPosY, {
                height: 30,
                width: this.maxWidthContent,
                textColor: this.regularColor,
                xAlign: "center",
                yAlign: "center",
            });
            return;
        }

        const initialPosX = this.xPadding;
        let accumulatedRowsHeight = 0;

        rows.map((row) => {
            const rowHeight = this.calculateBodyRowHeight(row, horizontalPadding) + 5;
            let currentPosY = this.headerEndPosY + accumulatedRowsHeight;

            if (!this.canWriteRowOnPage(currentPosY, rowHeight)) {
                this.addPage();
                this.moveTo(this.xPadding, this.yPadding);
                this.setHeaders(this.saveHeaders);
                currentPosY = this.headerEndPosY;
                accumulatedRowsHeight = 0;
            }

            row.map((cell, cellIdx) => {
                const currentPosX = initialPosX + cellIdx * defaultWidthCell;
                const cellWidth = this.calculateCellWidth(cellIdx);

                this.setCell(cell.text, currentPosX, currentPosY, {
                    height: rowHeight,
                    width: cellWidth,
                    textColor: this.regularColor,
                    xPadding: horizontalPadding,
                    yPadding: verticalPadding,
                    withoutBorder: cellIdx === 0 ? undefined : "left",
                    xAlign: cell.options?.xAlign ?? "left",
                    yAlign: cell.options?.yAlign ?? "top",
                });
            });

            accumulatedRowsHeight += rowHeight;
        });
    }

    public static createPipe(
        type: TypePdf,
        title: string,
        headers: Header[],
        saleNameInfoRows: SalePersonInfoRows[],
        res: Response,
        organization: OrganizationWithLogo,
        intervalDate?: IntervalDateType
    ) {
        const report = new Report({ size: "A4", margin: 30 });
        report.pipe(res);

        // Adiciona a data de geração do relatório
        report.setActualDate(new Date());

        saleNameInfoRows.forEach((info, index) => {
            if (index !== 0) {
                report.addPage();
                report.setActualDate(new Date()); // Adiciona a data de geração em cada página
            }

            report.setTitle(title);
            report.setSalesPersonName(info.name);
            if ("role" in info && info.role) {
                report.setSalesPersonRole(info.role, info.name);
            }
            if (intervalDate) report.setIntervalDate(intervalDate);
            if (organization.empresaLogo) report.setLogo(organization.empresaLogo.buffer);
            else report.setOrganizationName(organization.name);

            report.moveDown();
            report.setTotalValues(info.valoresTotais, type);

            report.moveDown();
            report.setHeaders(headers);
            report.setRows(info.rows);
        });

        return report;
    }
}
