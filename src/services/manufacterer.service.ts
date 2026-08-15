import { FindQueryProps } from "../types/commom.types";
import { RequestContext } from "../middlewares/auth";
import { Acao, Tabela } from "@prisma/client";

import * as T from "../types/manufacturer.types";

import PrismaUtils from "../utils/prisma.utils";
import httpStatus from "../utils/httpStatus";
import auditService from "./audit.service";
import ApiError from "../utils/apiError";
import prisma from "../prisma/prisma";

export default class ManufacturerService {
    private readonly context: RequestContext;

    constructor(context: RequestContext) {
        this.context = context;
    }

    public createMany = async (newManufacturers: T.NewManufacturer[]) => {
        await this.validateDuplications(newManufacturers.map(({ name }) => name));

        const _created = prisma.fabricante.createManyAndReturn({
            data: newManufacturers.map((newManufacturer) => ({
                ...newManufacturer,
                empresaId: this.context.currentUserRole.empresaId,
            })),
        });

        const _audit = auditService.createAudit({
            data: newManufacturers.map((newC) => ({ id: newC.name })),
            action: Acao.CREATE,
            table: Tabela.FABRICANTE,
            context: this.context,
        });

        const [created] = await prisma.$transaction([_created, _audit]);
        return created.slice(0, newManufacturers.length);
    };

    public findManyBy = async (query: FindQueryProps<T.ManufacturerWhere, T.ManufacturerSortBy>) => {
        const { name } = query.where ?? {};

        return await prisma.fabricante.findMany({
            where: {
                name: name ? { contains: name, mode: "insensitive" } : undefined,
                empresaId: this.context.currentUserRole.empresaId,
            },
            ...PrismaUtils.extractSortPageInfoFrom(query, "name", "asc"),
        });
    };

    public getOneBy = async (manufactererId: string) => {
        return prisma.fabricante.findUnique({
            where: { id: manufactererId, empresaId: this.context.currentUserRole.empresaId },
        });
    };

    public updateOne = async (updateProps: T.UpdateManufacturerProps) => {
        await this.validateIfExist(updateProps.id);
        await this.validateDuplications([updateProps.name]);

        const _update = prisma.fabricante.update({
            where: { id: updateProps.id, empresaId: this.context.currentUserRole.empresaId },
            data: { ...updateProps, empresaId: this.context.currentUserRole.empresaId },
        });

        const _audit = auditService.createAudit({
            data: [{ ...updateProps }],
            action: Acao.UPDATE,
            table: Tabela.FABRICANTE,
            context: this.context,
        });

        await prisma.$transaction([_update, _audit]);
        return;
    };

    public deleteOneBy = async (manufactererId: string): Promise<void> => {
        await this.validateIfExist(manufactererId);

        const _delete = prisma.fabricante.delete({
            where: { id: manufactererId, empresaId: this.context.currentUserRole.empresaId },
        });

        const _audit = auditService.createAudit({
            data: [{ id: manufactererId }],
            action: Acao.DELETE,
            table: Tabela.FABRICANTE,
            context: this.context,
        });

        await prisma.$transaction([_delete, _audit]);
        return;
    };

    private validateDuplications = async (names: string[], manufacturerIdUpdating?: string[]) => {
        const manufacturerWithSameName = await prisma.fabricante.findFirst({
            where: {
                empresaId: this.context.currentUserRole.empresaId,
                name: { in: names },
                id: { notIn: manufacturerIdUpdating },
            },
        });

        if (manufacturerWithSameName)
            throw new ApiError(httpStatus.BAD_REQUEST, `O nome ${manufacturerWithSameName.name} já está em uso!`);
    };

    private validateIfExist = async (manufactererId: string) => {
        const manufacterer = await this.getOneBy(manufactererId);
        if (!manufacterer) throw new ApiError(httpStatus.NOT_FOUND, "Fabricante não encontrado.");
    };
}
