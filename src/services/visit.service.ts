import { DataUpdateVisit, QueryDeleteVisit, QueryUpdateVisit } from "../validations/visit.validator";
import { Acao, Role, Tabela, Visita } from "@prisma/client";
import { FindQueryProps } from "../types/commom.types";
import { RequestContext } from "../middlewares/auth";
import { randomUUID } from "crypto";

import UserRoleService from "./user-role.service";
import PrismaUtils from "../utils/prisma.utils";
import httpStatus from "../utils/httpStatus";
import auditService from "./audit.service";
import ApiError from "../utils/apiError";
import prisma from "../prisma/prisma";

import * as T from "../types/visit.types";

export default class VisitService {
    private readonly context: RequestContext;

    private readonly userRoleService: UserRoleService;

    private readonly visitIncludes = {
        salePerson: { include: { user: { omit: { password: true } } } },
        gastos: true,
        cliente: true,
    } as const;

    constructor(context: RequestContext) {
        this.context = context;
        this.userRoleService = new UserRoleService(context);
    }

    public createMany = async (newVisits: T.NewVisit[]) => {
        const newVisitsNormalized = this.normalizeVisitsForType(newVisits);
        await this.validateDuplicates(
            newVisits.flatMap((nv) => nv.gastos.map((g) => g.nota).filter((n) => n !== null))
        );

        await this.userRoleService.validateUserRoles(
            newVisits.map(({ salePersonId }) => salePersonId),
            Role.VENDEDOR
        );

        const newVisitsWithIds = this.getNewVisitsWithIds(newVisitsNormalized);

        const _createdVisits = newVisitsWithIds.map(({ ...newVisit }) =>
            prisma.visita.create({
                data: {
                    id: newVisit.id,
                    empresaId: newVisit.empresaId,
                    clienteId: newVisit.clienteId,
                    salePersonId: newVisit.salePersonId,
                    comentarios: newVisit.comentarios ?? null,
                    tipoVisita: newVisit.tipoVisita,
                    remoto: newVisit.remoto,
                    visitaPaga: newVisit.visitaPaga ?? false,
                    dataVisita: newVisit.dataVisita,
                    gastos: { create: newVisit.gastos },
                },
            })
        );

        const _audit = auditService.createAudit({
            action: Acao.CREATE,
            table: Tabela.VISITA,
            data: newVisitsWithIds,
            context: this.context,
        });

        const [_, ...createdVisits] = await prisma.$transaction([_audit, ..._createdVisits]);
        return createdVisits;
    };

    public findManyBy = async (query: FindQueryProps<T.VisitWhere, T.VisitSortBy>) => {
        const { codigoNota, role, ...where } = query.where ?? {};

        return await prisma.visita.findMany({
            where: {
                clienteId: where.clienteId,
                comentarios: where.comentarios ? { contains: where.comentarios, mode: "insensitive" } : undefined,
                gastos: codigoNota ? { some: { nota: { contains: codigoNota, mode: "insensitive" } } } : undefined,
                remoto: where.remoto === "true" ? true : where.remoto === "false" ? false : undefined,
                salePerson: { id: where.salePersonId, role },
                updatedAt: { lte: where.lte_updatedAt, gte: where.gte_updatedAt },
                dataVisita: { lte: where.lte_dataVisita, gte: where.gte_dataVisita },
                visitaPaga: where.visitaPaga === "true" ? true : where.visitaPaga === "false" ? false : undefined,
                // carroEmpresa: carroEmpresa === "true" ? true : carroEmpresa === "false" ? false : undefined,
                empresaId: this.context.currentUserRole.empresaId,
                tipoVisita: where.tipoVisita,
            },
            include: this.visitIncludes,
            ...PrismaUtils.extractSortPageInfoFrom(query, "dataVisita", "desc"),
        });
    };

    public getOneBy = async (id: string, query?: QueryUpdateVisit) => {
        return prisma.visita.findUnique({
            where: { id, empresaId: this.context.currentUserRole.empresaId, salePersonId: query?.currentSalePersonId },
            include: this.visitIncludes,
        });
    };

    public findAllIn = async (visitsIds: string[], where: { salePersonId?: string; visitaPaga?: boolean }) => {
        const uniqueVisitsIds = [...new Set(visitsIds)];

        const visits = await prisma.visita.findMany({
            where: {
                id: { in: uniqueVisitsIds },
                empresaId: this.context.currentUserRole.empresaId,
                salePersonId: where.salePersonId,
                visitaPaga: where.visitaPaga,
            },
            include: this.visitIncludes,
        });

        if (visits.length !== visitsIds.length)
            throw new ApiError(
                httpStatus.NOT_FOUND,
                "Número de visitas passadas não batem com os resultados retornados."
            );

        return visits;
    };

    public updateOne = async (
        visitId: string,
        updateData: DataUpdateVisit,
        query?: QueryUpdateVisit
    ): Promise<Visita> => {
        const visitToEdit = await this.validateIfExistAndReturn(visitId, query);
        this.validateIfCanBeModified(visitToEdit);
        await this.userRoleService.validateUserRoles([updateData.salePersonId], Role.VENDEDOR);

        const notas = updateData.gastos.map((g) => g.nota).filter((n): n is string => n !== null && n !== undefined);
        await this.validateDuplicates(notas, visitId);

        const _deletedVisitExpenses = prisma.gasto.deleteMany({
            where: { visita: { id: visitId, empresaId: this.context.currentUserRole.empresaId } },
        });

        const updatePayload: any = {
            clienteId: updateData.clienteId,
            salePersonId: updateData.salePersonId,
            remoto: updateData.remoto,
            dataVisita: updateData.dataVisita,

            gastos: { create: updateData.gastos },
        };

        if (Object.prototype.hasOwnProperty.call(updateData, "comentarios")) {
            updatePayload.comentarios = updateData.comentarios ?? null;
        }

        if (Object.prototype.hasOwnProperty.call(updateData, "visitaPaga")) {
            updatePayload.visitaPaga = updateData.visitaPaga;
        }

        const _updatedVisit = prisma.visita.update({
            where: { id: visitId, empresaId: this.context.currentUserRole.empresaId },
            data: updatePayload,
        });

        const _audit = auditService.createAudit({
            action: Acao.UPDATE,
            table: Tabela.VISITA,
            data: [{ id: visitId, ...updateData }],
            context: this.context,
        });

        const [_, updatedVisit] = await prisma.$transaction([_deletedVisitExpenses, _updatedVisit, _audit]);
        return updatedVisit;
    };

    public payMany = async (data: T.UpdateVisitsToPaidStatusProps) => {
        await this.validateIfAllExistsToPay(data.visitasId);

        const _paidVisits = prisma.visita.updateMany({
            where: { empresaId: this.context.currentUserRole.empresaId, id: { in: data.visitasId } },
            data: { visitaPaga: true },
        });

        const _audit = auditService.createAudit({
            action: Acao.UPDATE,
            table: Tabela.VISITA,
            data: data.visitasId.map((id) => ({ id, visitaPaga: true })),
            context: this.context,
        });

        await prisma.$transaction([_paidVisits, _audit]);
        return;
    };

    public deleteOneBy = async (visitId: string, query?: QueryDeleteVisit) => {
        const visitToDelete = await this.validateIfExistAndReturn(visitId, query);
        this.validateIfCanBeModified(visitToDelete);

        const _deletedVisit = prisma.visita.delete({
            where: { id: visitId, empresaId: this.context.currentUserRole.empresaId },
        });

        const _audit = auditService.createAudit({
            action: Acao.DELETE,
            table: Tabela.VISITA,
            data: [visitToDelete],
            context: this.context,
        });

        await prisma.$transaction([_deletedVisit, _audit]);
        return;
    };

    public getInfoExpensesPerRole = async (query: { where?: T.VisitExpensesInfoPerRoleWhere }) => {
        const visits = await this.findManyBy(query);

        const infoExpensesPerRole: T.VisitInfoExpensesPerRole[] = [];

        for (const visit of visits) {
            const total = visit.gastos.reduce((acc, { valor }) => acc + valor, 0);
            const pago = visit.visitaPaga ? visit.gastos.reduce((acc, { valor }) => acc + valor, 0) : 0;

            const salePersonIndex = infoExpensesPerRole.findIndex((vv) => vv.salePerson?.id === visit.salePersonId);

            if (salePersonIndex === -1) {
                infoExpensesPerRole.push({
                    salePerson: visit.salePerson,
                    visitasIdsAPagar: visit.visitaPaga ? [] : [visit.id],
                    total,
                    pago,
                });
            } else {
                infoExpensesPerRole[salePersonIndex].total += total;
                infoExpensesPerRole[salePersonIndex].pago += pago;
                if (!visit.visitaPaga) infoExpensesPerRole[salePersonIndex].visitasIdsAPagar.push(visit.id);
            }
        }
        return infoExpensesPerRole;
    };

    private validateDuplicates = async (invoiceCodes: string[], visitIdToUpdate?: string) => {
        const invoiceWithSameInvoiceCode = await prisma.gasto.findFirst({
            where: {
                nota: { in: invoiceCodes },
                visita: { empresaId: this.context.currentUserRole.empresaId, id: { not: visitIdToUpdate } },
            },
        });

        if (invoiceWithSameInvoiceCode)
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                `O código da nota ${invoiceWithSameInvoiceCode.nota} já está em uso.`
            );
    };

    private normalizeVisitsForType<T extends T.NewVisit>(visits: T[]): T[] {
        return visits.map((visita) => ({
            ...visita,
            gastos: visita.remoto
                ? []
                : visita.gastos.map((gasto) => ({
                      ...gasto,
                      tipoViagem: gasto.tipoViagem ?? null,
                      nota: gasto.nota ?? null,
                      dataViagem: gasto.dataViagem ?? null,
                  })),
        }));
    }

    private getNewVisitsWithIds = (newVisits: T.NewVisit[]) => {
        return newVisits.map((visit) => ({
            ...visit,
            id: randomUUID(),
            empresaId: this.context.currentUserRole.empresaId,
        }));
    };

    private validateIfExistAndReturn = async (visitId: string, query?: QueryUpdateVisit) => {
        const visit = await this.getOneBy(visitId);
        if (!visit) throw new ApiError(httpStatus.NOT_FOUND, "Visita não encontrada.");

        return visit;
    };

    private validateIfCanBeModified = (visit: Visita) => {
        if (visit.visitaPaga)
            throw new ApiError(httpStatus.BAD_REQUEST, "Visita já foi paga e não pode ser modificada.");
    };

    private validateIfAllExistsToPay = async (visitsIds: string[]) => {
        const visits = await prisma.visita.findMany({
            where: { id: { in: visitsIds }, empresaId: this.context.currentUserRole.empresaId, visitaPaga: false },
        });

        if (visits.length !== visitsIds.length)
            throw new ApiError(httpStatus.NOT_FOUND, "Algumas destas visitas não existem ou já foram pagas.");
    };
}
