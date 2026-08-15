import { UpdateProductProps, NewProduct, ProductSortBy, ProductWhere } from "../types/product.types";
import { FindQueryProps } from "../types/commom.types";
import { RequestContext } from "../middlewares/auth";
import { Acao, Tabela } from "@prisma/client";
import { randomUUID } from "crypto";

import PrismaUtils from "../utils/prisma.utils";
import httpStatus from "../utils/httpStatus";
import auditService from "./audit.service";
import ApiError from "../utils/apiError";
import prisma from "../prisma/prisma";

export default class ProductService {
    private readonly context: RequestContext;

    private readonly productIncludes = {
        tipoProdutoServico: true,
        fabricante: true,
        categoria: true,
    };

    constructor(context: RequestContext) {
        this.context = context;
    }

    public createMany = async (newProducts: NewProduct[]) => {
        await this.validateDuplicates(newProducts.map(({ partNumber }) => partNumber));

        const newProductsWithIds = newProducts.map((produto) => ({
            ...produto,
            id: randomUUID(),
            empresaId: this.context.currentUserRole.empresaId,
        }));

        const _createdProducts = prisma.produto.createManyAndReturn({ data: newProductsWithIds });

        const _audit = auditService.createAudit({
            data: newProductsWithIds,
            action: Acao.CREATE,
            table: Tabela.PRODUTO,
            context: this.context,
        });

        const [created] = await prisma.$transaction([_createdProducts, _audit]);
        return created.slice(0, newProductsWithIds.length);
    };

    public findMany = async (query: FindQueryProps<ProductWhere, ProductSortBy>) => {
        const { where } = query;

        return await prisma.produto.findMany({
            where: {
                tipoProdutoServicoId: where?.tipoProdutoServicoId,
                fabricanteId: where?.fabricanteId,
                categoriaId: where?.categoriaId,
                custoUnit: where?.custoUnit,
                name: where?.name ? { contains: where.name, mode: "insensitive" } : undefined,
                partNumber: where?.partNumber ? { contains: where.partNumber, mode: "insensitive" } : undefined,
                updatedAt: { gte: where?.gte_updatedAt, lte: where?.lte_updatedAt },
                empresaId: this.context.currentUserRole.empresaId,
                tipoMoeda: where?.tipoMoeda,
            },
            include: this.productIncludes,
            ...PrismaUtils.extractSortPageInfoFrom(query, "name", "asc"),
        });
    };

    public getOneBy = async (productId: string) => {
        return prisma.produto.findUnique({
            where: { id: productId, empresaId: this.context.currentUserRole.empresaId },
            include: this.productIncludes,
        });
    };

    public updateOne = async (updateProps: UpdateProductProps) => {
        await this.validateIfExist(updateProps.id);
        await this.validateDuplicates([updateProps.partNumber], updateProps.id);

        const { id, ...updateProductData } = updateProps;

        const _updatedProduct = prisma.produto.update({
            where: { id, empresaId: this.context.currentUserRole.empresaId },
            data: { ...updateProductData },
        });

        const _audit = auditService.createAudit({
            data: [updateProps],
            action: Acao.UPDATE,
            table: Tabela.PRODUTO,
            context: this.context,
        });

        const [updatedProduto] = await prisma.$transaction([_updatedProduct, _audit]);
        return updatedProduto;
    };

    public deleteOneBy = async (productId: string) => {
        const productToDelete = await this.validateIfExist(productId);
        await this.validateProductDependencies(productId);
        const _deletedProduct = prisma.produto.delete({
            where: { id: productId, empresaId: this.context.currentUserRole.empresaId },
        });

        const _audit = auditService.createAudit({
            data: [productToDelete],
            action: Acao.DELETE,
            table: Tabela.PRODUTO,
            context: this.context,
        });

        await prisma.$transaction([_deletedProduct, _audit]);
    };

    private validateDuplicates = async (partNumbers: string[], productIdUpdating?: string) => {
        const product = await prisma.produto.findFirst({
            where: {
                empresaId: this.context.currentUserRole.empresaId,
                partNumber: { in: partNumbers },
                id: { not: productIdUpdating },
            },
        });

        if (product) throw new ApiError(httpStatus.BAD_REQUEST, `O partNumber ${product.partNumber} já existe!`);
    };

    private validateProductDependencies = async (id: string) => {
        const product = await prisma.produto.findFirst({
            where: { id: id, empresaId: this.context.currentUserRole.empresaId },
            include: {
                vendasProduto: true,
            },
        });
        if (product?.vendasProduto.length! > 0) throw new ApiError(httpStatus.BAD_REQUEST, "Produto tem dependencias");

        return product;
    };

    private validateIfExist = async (productId: string) => {
        const product = await this.getOneBy(productId);
        if (!product) throw new ApiError(httpStatus.NOT_FOUND, "Produto não encontrado");

        return product;
    };

    public validateIfExistMany = async (productIds: string[]) => {
        const products = await prisma.produto.findMany({
            where: {
                id: { in: productIds },
                empresaId: this.context.currentUserRole.empresaId,
            },
        });
        //const someNotExist = productIds.some((id) => products.every((product) => product.id !== id));
        const methodIds = new Set(products.map((m) => m.id));
        const someNotExist = productIds.some((id) => !methodIds.has(id));
        if (someNotExist) throw new ApiError(httpStatus.NOT_FOUND, "Produto não encontrado");
    };
}
