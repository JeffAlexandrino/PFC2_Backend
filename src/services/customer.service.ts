import { FindQueryProps } from "../types/commom.types";
import { RequestContext } from "../middlewares/auth";
import { Acao, Tabela } from "@prisma/client";
import { randomUUID } from "crypto";

import PrismaUtils from "../utils/prisma.utils";
import httpStatus from "../utils/httpStatus";
import auditService from "./audit.service";
import SaleService from "./sale.service";
import ApiError from "../utils/apiError";
import prisma from "../prisma/prisma";

import * as T from "../types/customer.types";

export default class CustomerService {
    context: RequestContext;
    customersInclude = {
        segmento: true,
        responsavel: {
            select: {
                id: true,
                name: true,
            },
        },
    };
    constructor(context: RequestContext) {
        this.context = context;
    }

    public createMany = async (newCustomers: T.NewCustomer[]) => {
        await this.validateDuplications(newCustomers);

        const newCustomersWithIds = newCustomers.map((newCustomer) => ({
            ...newCustomer,
            id: randomUUID(),
            empresaId: this.context.currentUserRole.empresaId,
            responsavelId: this.context.user.id,
        }));

        const _createdCustomers = prisma.cliente.createManyAndReturn({ data: newCustomersWithIds });

        const _audit = auditService.createAudit({
            data: newCustomersWithIds,
            action: Acao.CREATE,
            table: Tabela.CLIENTE,
            context: this.context,
        });

        const [createdCustomers] = await prisma.$transaction([_createdCustomers, _audit]);
        return createdCustomers;
    };

    public importMany = async (newCustomers: T.NewCustomerWithSegmentName[]) => {
        const commingSegmentNames = newCustomers.map(({ segmentoName }) => segmentoName);

        const mapExistingSegmentsIdBySegmentNames = await this.getSegmentIdMappedBySegmentName(commingSegmentNames);

        const newSegmentsNames = commingSegmentNames.filter((name) => !mapExistingSegmentsIdBySegmentNames[name]);
        const newSegmentsWithId = newSegmentsNames.map((name) => ({
            empresaId: this.context.currentUserRole.empresaId,
            id: randomUUID(),
            name,
        }));

        const newSegmentIdMappedBySegmentName = newSegmentsWithId.reduce(
            (acc, segment) => ({ ...acc, [segment.name]: segment.id }),
            {} as Record<string, string>
        );

        const segmentIdMappedBySegmentName = {
            ...mapExistingSegmentsIdBySegmentNames,
            ...newSegmentIdMappedBySegmentName,
        };

        const _createdSegments = prisma.segmento.createMany({ data: newSegmentsWithId });

        const customersWithIdAndOrganizationId = newCustomers.map(({ segmentoName, ...newCustomer }) => ({
            ...newCustomer,
            id: randomUUID(),
            empresaId: this.context.currentUserRole.empresaId,
            segmentoId: segmentIdMappedBySegmentName[segmentoName],
            responsavelId: this.context.user.id,
        }));

        const _createdCustomers = prisma.cliente.createMany({
            data: customersWithIdAndOrganizationId,
            skipDuplicates: true,
        });

        const _audit = auditService.createAudit({
            data: customersWithIdAndOrganizationId,
            action: Acao.CREATE,
            table: Tabela.CLIENTE,
            context: this.context,
        });

        const [_, createdCustomers] = await prisma.$transaction([_createdSegments, _createdCustomers, _audit]);
        return createdCustomers;
    };

    public findManyBy = async (query: FindQueryProps<T.CustomerWhere, T.CustomerSortBy>) => {
        const { name, email, cnpj, telefone, gte_updatedAt, lte_updatedAt, ...restWhere } = query.where ?? {};

        return await prisma.cliente.findMany({
            where: {
                ...restWhere,
                name: { contains: name, mode: "insensitive" },
                email: { contains: email, mode: "insensitive" },
                cnpj: { contains: cnpj, mode: "insensitive" },
                telefone: { contains: telefone, mode: "insensitive" },
                updatedAt: { gte: gte_updatedAt, lte: lte_updatedAt },
                empresaId: this.context.currentUserRole.empresaId,
                comprou: restWhere.comprou === "true" ? true : restWhere.comprou === "false" ? false : undefined,
            },
            include: this.customersInclude,
            ...PrismaUtils.extractSortPageInfoFrom(query, "name", "asc"),
        });
    };

    public findManyWithSalesAndVisits = async (
        query: FindQueryProps<T.CustomerWithSaleAndVisitWhere, T.CustomerSortBy>
    ) => {
        const { name, email, cnpj, telefone, gte_updatedAt, lte_updatedAt, ...where } = query.where ?? {};

        return await prisma.cliente.findMany({
            where: {
                segmentoId: where.segmentoId,
                name: { contains: name, mode: "insensitive" },
                email: { contains: email, mode: "insensitive" },
                cnpj: { contains: cnpj, mode: "insensitive" },
                telefone: { contains: telefone, mode: "insensitive" },
                updatedAt: { gte: gte_updatedAt, lte: lte_updatedAt },
                empresaId: this.context.currentUserRole.empresaId,
            },
            include: {
                segmento: { select: { id: true, name: true } },
                vendas: {
                    where: {
                        dataVenda: { gte: where.gte_dataVenda, lte: where.lte_dataVenda },
                        notasVenda: {
                            some: {
                                datasBoleto: {
                                    some: { data: { gte: where.gte_invoiceDate, lte: where.lte_invoiceDate } },
                                },
                            },
                        },
                        ...SaleService.getUserRoleSaleWhere(where),
                        estadoVenda: where.estadoVenda,
                    },
                    include: {
                        notasVenda: {
                            include: { vendasServico: true, vendasProduto: true, comissoes: true, datasBoleto: true },
                        },
                    },
                },
                visitas: {
                    where: {
                        salePerson: { id: where.salePersonId, role: where.role },
                        dataVisita: { gte: where.gte_dataVisita, lte: where.lte_dataVisita },
                    },
                    include: { gastos: { where: { valor: undefined } } },
                },
            },
            ...PrismaUtils.extractSortPageInfoFrom(query, "name", "asc"),
        });
    };

    public getOneBy = (customerId: string) => {
        return prisma.cliente.findUnique({
            where: { id: customerId, empresaId: this.context.currentUserRole.empresaId },
            include: this.customersInclude,
        });
    };

    public updateOne = async (updateProps: T.UpdateCustomerProps) => {
        await this.validateIfCustomerExist(updateProps.id);
        await this.validateDuplications([updateProps], updateProps.id);

        const { id, ...updateData } = updateProps;

        const _updatedCustomer = prisma.cliente.update({
            where: { id, empresaId: this.context.currentUserRole.empresaId },
            data: updateData,
        });

        const _audit = auditService.createAudit({
            data: [updateProps],
            action: Acao.UPDATE,
            table: Tabela.CLIENTE,
            context: this.context,
        });

        const [updatedCliente] = await prisma.$transaction([_updatedCustomer, _audit]);
        return updatedCliente;
    };

    public deleteOne = async (customerId: string) => {
        const customerToDelete = await this.validateIfCustomerExist(customerId);

        const _deletedCustomer = prisma.cliente.delete({
            where: { id: customerId, empresaId: this.context.currentUserRole.empresaId },
        });

        const _audit = auditService.createAudit({
            data: [customerToDelete],
            action: Acao.DELETE,
            table: Tabela.CLIENTE,
            context: this.context,
        });

        await prisma.$transaction([_deletedCustomer, _audit]);
    };

    public updateComprouWhenSaleIsPaid = async (idCliente: string) => {
        await this.validateIfCustomerExist(idCliente);

        const _updatedCustomer = prisma.cliente.update({
            where: { id: idCliente, empresaId: this.context.currentUserRole.empresaId },
            data: { comprou: true },
        });

        const _audit = auditService.createAudit({
            data: [{id: idCliente}],
            action: Acao.UPDATE,
            table: Tabela.CLIENTE,
            context: this.context,
        });

        const [updatedCliente] = await prisma.$transaction([_updatedCustomer, _audit]);
        return updatedCliente;
    };

    private getSegmentIdMappedBySegmentName = async (segmentNames: string[]) => {
        const segmentos = await prisma.segmento.findMany({
            where: { name: { in: segmentNames }, empresaId: this.context.currentUserRole.empresaId },
            select: { id: true, name: true },
        });
        return segmentos.reduce(
            (acc, segment) => ({ ...acc, [segment.name]: segment.id }),
            {} as Record<string, string>
        );
    };

    private validateIfCustomerExist = async (customerId: string) => {
        const customer = await this.getOneBy(customerId);
        if (!customer) throw new ApiError(httpStatus.NOT_FOUND, "Cliente não encontrado.");

        return customer;
    };

    private validateDuplications = async (customers: T.CustomerUniqueFields[], customerIdToUpdate?: string) => {
        const customerWithSameName = await prisma.cliente.findFirst({
            where: {
                empresaId: this.context.currentUserRole.empresaId,
                OR: [{ email: { in: customers.map((c) => c.email) } }, { cnpj: { in: customers.map((c) => c.cnpj) } }],
                id: { not: customerIdToUpdate },
            },
        });

        if (customerWithSameName)
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                `O email ${customerWithSameName.email} ou cnpj ${customerWithSameName.cnpj} já está em uso!`
            );
    };
}
