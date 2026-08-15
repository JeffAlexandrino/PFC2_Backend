import { NewSupplier, SupplierWhere, SupplierSortBy, UpdateSupplierProps } from "../types/supplier.types";
import { FindQueryProps } from "../types/commom.types";
import { RequestContext } from "../middlewares/auth";
import { Acao, Tabela } from "@prisma/client";
import { randomUUID } from "crypto";

import PrismaUtils from "../utils/prisma.utils";
import httpStatus from "../utils/httpStatus";
import auditService from "./audit.service";
import ApiError from "../utils/apiError";
import prisma from "../prisma/prisma";

export default class SupplierService {
    private readonly context: RequestContext;

    constructor(context: RequestContext) {
        this.context = context;
    }

    public createMany = async (newSuppliers: NewSupplier[]) => {
        const emails = newSuppliers.map((supplier) => supplier.email);
        const cnpjs = newSuppliers.map((supplier) => supplier.cnpj);

        await this.validateDuplicates({ cnpjs, emails });

        const newSupplierdsWithIds = this.getSuppliersWithIds(newSuppliers);

        const _createSuppliers = prisma.fornecedor.createManyAndReturn({ data: newSupplierdsWithIds });

        const _audit = auditService.createAudit({
            data: newSupplierdsWithIds,
            action: Acao.CREATE,
            table: Tabela.FORNECEDOR,
            context: this.context,
        });

        const [created] = await prisma.$transaction([_createSuppliers, _audit]);
        return created.slice(0, newSupplierdsWithIds.length);
    };

    public findManyBy = async (query: FindQueryProps<SupplierWhere, SupplierSortBy>) => {
        const { where } = query;

        return await prisma.fornecedor.findMany({
            where: {
                name: where?.name ? { contains: where.name, mode: "insensitive" } : undefined,
                email: where?.email ? { contains: where.email, mode: "insensitive" } : undefined,
                cnpj: where?.cnpj ? { contains: where.cnpj, mode: "insensitive" } : undefined,
                updatedAt: { gte: where?.gte_updatedAt, lte: where?.lte_updatedAt },
                empresaId: this.context.currentUserRole.empresaId,
            },
            ...PrismaUtils.extractSortPageInfoFrom(query, "name", "asc"),
        });
    };

    public getOneBy = async (supplierId: string) => {
        return prisma.fornecedor.findUnique({
            where: { id: supplierId, empresaId: this.context.currentUserRole.empresaId },
        });
    };

    public updateOne = async (updateProps: UpdateSupplierProps) => {
        await this.validateIfExistAndReturn(updateProps.id);
        await this.validateDuplicates({ emails: [updateProps.email], cnpjs: [updateProps.cnpj] }, updateProps.id);

        const _updateSupplier = prisma.fornecedor.update({
            where: { id: updateProps.id, empresaId: this.context.currentUserRole.empresaId },
            data: updateProps,
        });

        const _audit = auditService.createAudit({
            data: [updateProps],
            action: Acao.UPDATE,
            table: Tabela.FORNECEDOR,
            context: this.context,
        });

        const [updatedSupplier] = await prisma.$transaction([_updateSupplier, _audit]);
        return updatedSupplier;
    };

    public deleteOneBy = async (supplierId: string) => {
        const supplierToDelete = await this.validateIfExistAndReturn(supplierId);
        await this.validateIfUsing(supplierId);

        const _deletedSupplier = prisma.fornecedor.delete({
            where: { id: supplierId, empresaId: this.context.currentUserRole.empresaId },
        });

        const _audit = auditService.createAudit({
            data: [supplierToDelete],
            action: Acao.DELETE,
            table: Tabela.FORNECEDOR,
            context: this.context,
        });
        await prisma.$transaction([_deletedSupplier, _audit]);
        return;
    };

    private validateDuplicates = async (props: { cnpjs: string[]; emails: string[] }, supplierIdUpdating?: string) => {
        const supplierWithSameEmailOrCnpj = await prisma.fornecedor.findFirst({
            where: {
                id: { not: supplierIdUpdating },
                empresaId: this.context.currentUserRole.empresaId,
                OR: [{ email: { in: props.emails } }, { cnpj: { in: props.cnpjs } }],
            },
        });

        if (supplierWithSameEmailOrCnpj)
            throw new ApiError(httpStatus.BAD_REQUEST, "Já existe um fornecedor com este email ou cnpj.");
    };

    private getSuppliersWithIds = (newSuppliers: NewSupplier[]) => {
        return newSuppliers.map((supplier) => ({
            ...supplier,
            id: randomUUID(),
            empresaId: this.context.currentUserRole.empresaId,
        }));
    };

    private validateIfExistAndReturn = async (supplierId: string) => {
        const supplier = await this.getOneBy(supplierId);
        if (!supplier) throw new ApiError(httpStatus.NOT_FOUND, "Fornecedor não encontrado.");

        return supplier;
    };

    private validateIfUsing = async (supplierId: string) => {
        const productSale = await prisma.vendaProduto.findFirst({
            where: { fornecedores: { some: { id: supplierId } } },
        });
        if (productSale) throw new ApiError(httpStatus.BAD_REQUEST, "Este fornecedor está sendo usado em uma venda.");
    };
}
