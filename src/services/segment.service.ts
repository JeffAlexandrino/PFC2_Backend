import { UpdateSegmentProps, NewSegment, SegmentSortBy, SegmentWhere } from "../types/segment.types";
import { FindQueryProps } from "../types/commom.types";
import { RequestContext } from "../middlewares/auth";
import { Acao, Tabela } from "@prisma/client";

import PrismaUtils from "../utils/prisma.utils";
import httpStatus from "../utils/httpStatus";
import auditService from "./audit.service";
import ApiError from "../utils/apiError";
import prisma from "../prisma/prisma";

export default class SegmentService {
    private readonly context: RequestContext;

    constructor(context: RequestContext) {
        this.context = context;
    }

    public createMany = async (newSegments: NewSegment[]) => {
        await this.validateDuplicates(newSegments.map(({ name }) => name));

        const _create = prisma.segmento.createManyAndReturn({
            data: newSegments.map((newSegment) => ({
                ...newSegment,
                empresaId: this.context.currentUserRole.empresaId,
            })),
        });

        const _audit = auditService.createAudit({
            data: newSegments.map((newM) => ({ id: newM.name })),
            action: Acao.CREATE,
            table: Tabela.SEGMENTO,
            context: this.context,
        });

        const [created] = await prisma.$transaction([_create, _audit]);
        return created.slice(0, newSegments.length);
    };

    public findManyBy = async (query: FindQueryProps<SegmentWhere, SegmentSortBy>) => {
        const { name } = query.where ?? {};

        return await prisma.segmento.findMany({
            where: {
                name: name ? { contains: name, mode: "insensitive" } : undefined,
                empresaId: this.context.currentUserRole.empresaId,
            },
            ...PrismaUtils.extractSortPageInfoFrom(query, "name", "asc"),
        });
    };

    public getOneBy = async (segmentId: string) => {
        return prisma.segmento.findUnique({
            where: { id: segmentId, empresaId: this.context.currentUserRole.empresaId },
        });
    };

    public updateOne = async (updateProps: UpdateSegmentProps) => {
        await this.validateIfExist(updateProps.id);
        await this.validateDuplicates([updateProps.name], updateProps.id);

        const _update = prisma.segmento.update({
            where: { id: updateProps.id, empresaId: this.context.currentUserRole.empresaId },
            data: updateProps,
        });

        const _audit = auditService.createAudit({
            data: [{ ...updateProps }],
            action: Acao.UPDATE,
            table: Tabela.SEGMENTO,
            context: this.context,
        });

        await prisma.$transaction([_update, _audit]);
        return;
    };

    public deleteOneBy = async (segmentId: string) => {
        await this.validateIfExist(segmentId);

        const _delete = prisma.segmento.delete({
            where: { id: segmentId, empresaId: this.context.currentUserRole.empresaId },
        });

        const _audit = auditService.createAudit({
            data: [{ id: segmentId }],
            action: Acao.DELETE,
            table: Tabela.SEGMENTO,
            context: this.context,
        });

        await prisma.$transaction([_delete, _audit]);
        return;
    };

    private validateDuplicates = async (names: string[], segmentIdUpdating?: string) => {
        const segment = await prisma.segmento.findFirst({
            where: {
                name: { in: names },
                empresaId: this.context.currentUserRole.empresaId,
                id: { not: segmentIdUpdating },
            },
        });

        if (segment) throw new ApiError(httpStatus.BAD_REQUEST, `O nome ${segment.name} já existe!`);
    };

    private validateIfExist = async (segmentId: string) => {
        const segment = await this.getOneBy(segmentId);
        if (!segment) throw new ApiError(httpStatus.NOT_FOUND, "Segmento não encontrado");
    };
}
