import { FindQueryProps } from "../types/commom.types";
import { RequestContext } from "../middlewares/auth";
import { Acao, Tabela } from "@prisma/client";
import { randomUUID } from "crypto";

import PrismaUtils from "../utils/prisma.utils";
import httpStatus from "../utils/httpStatus";
import auditService from "./audit.service";
import ApiError from "../utils/apiError";
import prisma from "../prisma/prisma";

import * as T from "../types/service.types";

export default class ServiceService {
    private readonly context: RequestContext;
    private readonly serviceIncludes = { tipoProdutoServico: true } as const;

    constructor(context: RequestContext) {
        this.context = context;
    }

    public createMany = async (newServices: T.NewService[]) => {
        await this.validateDuplicates(newServices.map(({ name }) => name));

        const newServicesWithIds = this.getServicesWithIds(newServices);

        const _createdServices = prisma.servico.createManyAndReturn({ data: newServicesWithIds });
        const _audit = auditService.createAudit({
            data: newServicesWithIds,
            action: Acao.CREATE,
            table: Tabela.SERVICO,
            context: this.context,
        });

        const [created] = await prisma.$transaction([_createdServices, _audit]);
        return created.slice(0, newServicesWithIds.length);
    };

    public findManyBy = async (query: FindQueryProps<T.ServiceWhere, T.ServiceSortBy>) => {
        const { where } = query;

        return await prisma.servico.findMany({
            where: {
                tipoProdutoServicoId: where?.tipoProdutoServicoId,
                name: where?.name ? { contains: where.name, mode: "insensitive" } : undefined,
                updatedAt: { gte: where?.gte_updatedAt, lte: where?.lte_updatedAt },
                observacoes: where?.observacoes ? { contains: where.observacoes, mode: "insensitive" } : undefined,
                empresaId: this.context.currentUserRole.empresaId,
                tipoMoeda: where?.tipoMoeda,
            },
            include: this.serviceIncludes,
            ...PrismaUtils.extractSortPageInfoFrom(query, "name", "asc"),
        });
    };

    public getOneBy = async (serviceId: string) => {
        return prisma.servico.findUnique({
            where: { id: serviceId, empresaId: this.context.currentUserRole.empresaId },
            include: this.serviceIncludes,
        });
    };

    public updateOne = async (updateProps: T.UpdateServiceProps) => {
        await this.validateIfExist(updateProps.id);
        await this.validateDuplicates([updateProps.name], updateProps.id);

        const _updatedService = prisma.servico.update({
            where: { id: updateProps.id, empresaId: this.context.currentUserRole.empresaId },
            data: updateProps,
        });

        const _audit = auditService.createAudit({
            data: [updateProps],
            action: Acao.UPDATE,
            table: Tabela.SERVICO,
            context: this.context,
        });

        const [updatedService] = await prisma.$transaction([_updatedService, _audit]);
        return updatedService;
    };

    public deleteOneBy = async (serviceId: string) => {
        const serviceToDelete = await this.validateIfExist(serviceId);

        await this.validateServiceDependencies(serviceId);

        const _deletedService = prisma.servico.delete({
            where: { id: serviceId, empresaId: this.context.currentUserRole.empresaId },
        });

        const _auditoria = auditService.createAudit({
            data: [serviceToDelete],
            action: Acao.DELETE,
            table: Tabela.SERVICO,
            context: this.context,
        });

        await prisma.$transaction([_deletedService, _auditoria]);
        return;
    };

    public async getServicesInfoMappedByServiceId(serviceIds: string[]) {
        const services = await prisma.servico.findMany({
            where: {
                empresaId: this.context.currentUserRole.empresaId,
                id: {
                    in: serviceIds,
                },
            },
        });

        const someServiceNotFounded = serviceIds.some((servicoId) => services.every(({ id }) => id !== servicoId));
        if (someServiceNotFounded) throw new ApiError(httpStatus.NOT_FOUND, "Serviço não encontrado.");

        return services.reduce((acc, { id, ...restService }) => {
            return { ...acc, [id]: { ...restService, id } };
        }, {} as T.ServicesInfoMappedByServiceId);
    }

    private validateDuplicates = async (names: string[], serviceIdUpdating?: string) => {
        const service = await prisma.servico.findFirst({
            where: {
                id: { not: serviceIdUpdating },
                name: { in: names },
                empresaId: this.context.currentUserRole.empresaId,
            },
        });
        if (service) throw new ApiError(httpStatus.BAD_REQUEST, `O nome ${service.name} já está em uso.`);
    };

    private validateServiceDependencies = async (id: string) => {
        const product = await prisma.servico.findFirst({
            where: { id: id, empresaId: this.context.currentUserRole.empresaId },
            include: {
                vendasServico: true,
            },
        });
        if (product?.vendasServico.length! > 0) throw new ApiError(httpStatus.BAD_REQUEST, "Servico tem dependencias");

        return product;
    };

    private getServicesWithIds = (services: T.NewService[]) => {
        return services.map((service) => ({
            ...service,
            id: randomUUID(),
            empresaId: this.context.currentUserRole.empresaId,
        }));
    };

    private validateIfExist = async (serviceId: string) => {
        const service = await this.getOneBy(serviceId);
        if (!service) throw new ApiError(httpStatus.NOT_FOUND, "Serviço não encontrado.");

        return service;
    };
}
