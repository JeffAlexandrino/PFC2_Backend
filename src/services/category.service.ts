import {
    CategorySortBy,
    CategoryWhere,
    UpdateCategoryProps,
    NewCategory,
    FindManyWithProductIncludingProductSalesProps,
} from "../types/category.types";
import { FindQueryProps } from "../types/commom.types";
import { RequestContext } from "../middlewares/auth";
import { Acao, Tabela } from "@prisma/client";

import PrismaUtils from "../utils/prisma.utils";
import httpStatus from "../utils/httpStatus";
import auditService from "./audit.service";
import SaleService from "./sale.service";
import ApiError from "../utils/apiError";
import prisma from "../prisma/prisma";

export default class CategoryService {
    private readonly context: RequestContext;

    constructor(context: RequestContext) {
        this.context = context;
    }

    public createMany = async (newCategories: NewCategory[]) => {
        await this.validateDuplications(newCategories.map(({ name }) => name));

        const newCategoriesWithOrgId = newCategories.map((newCategory) => ({
            ...newCategory,
            empresaId: this.context.currentUserRole.empresaId,
        }));

        const _category = prisma.categoria.createManyAndReturn({ data: newCategoriesWithOrgId });

        const _audit = auditService.createAudit({
            data: newCategoriesWithOrgId.map((newCat) => ({ id: newCat.empresaId, name: newCat.name })),
            action: Acao.CREATE,
            table: Tabela.CATEGORIA,
            context: this.context,
        });

        const [created] = await prisma.$transaction([_category, _audit]);
        return created.slice(0, newCategoriesWithOrgId.length);
    };

    public findManyBy = async (query: FindQueryProps<CategoryWhere, CategorySortBy>) => {
        const { name } = query.where ?? {};

        return await prisma.categoria.findMany({
            where: {
                name: name ? { contains: name, mode: "insensitive" } : undefined,
                empresaId: this.context.currentUserRole.empresaId,
            },
            ...PrismaUtils.extractSortPageInfoFrom(query, "name", "asc"),
        });
    };

    public getOneBy = async (categoryId: string) => {
        return prisma.categoria.findUnique({
            where: { id: categoryId, empresaId: this.context.currentUserRole.empresaId },
        });
    };

    public updateOne = async ({ id: categoryId, ...updateData }: UpdateCategoryProps) => {
        await this.validateIfCategoryExist(categoryId);
        await this.validateDuplications([updateData.name], categoryId);

        const _category = prisma.categoria.update({
            where: { id: categoryId, empresaId: this.context.currentUserRole.empresaId },
            data: updateData,
        });

        const _audit = auditService.createAudit({
            data: [{ id: categoryId, ...updateData }],
            action: Acao.UPDATE,
            table: Tabela.CATEGORIA,
            context: this.context,
        });

        await prisma.$transaction([_category, _audit]);
        return;
    };

    public deleteOneBy = async (categoryId: string) => {
        await this.validateIfCategoryExist(categoryId);

        const _category = prisma.categoria.delete({ where: { id: categoryId } });

        const _audit = auditService.createAudit({
            data: [{ id: categoryId }],
            action: Acao.DELETE,
            table: Tabela.CATEGORIA,
            context: this.context,
        });

        await prisma.$transaction([_category, _audit]);
        return;
    };

    public findManyWithProductIncludingProductSales = async (props: FindManyWithProductIncludingProductSalesProps) => {
        const { gte_dataVenda, lte_dataVenda, gte_invoiceDate, lte_invoiceDate, ...rest } = props;

        return await prisma.categoria.findMany({
            where: { empresaId: this.context.currentUserRole.empresaId },
            select: {
                id: true,
                name: true,
                produtos: {
                    select: {
                        vendasProduto: {
                            include: { notaVenda: { include: { datasBoleto: true } } },
                            where: {
                                notaVenda: {
                                    datasBoleto: { some: { data: { gte: gte_invoiceDate, lte: lte_invoiceDate } } },
                                    venda: {
                                        ...SaleService.getUserRoleSaleWhere(rest),
                                        estadoVenda: rest.estadoVenda,
                                        dataVenda: { gte: gte_dataVenda, lte: lte_dataVenda },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
    };

    private validateIfCategoryExist = async (categoryId: string) => {
        const category = await this.getOneBy(categoryId);

        if (!category) throw new ApiError(httpStatus.NOT_FOUND, "Categoria não encontrada.");
    };

    private validateDuplications = async (names: string[], categoryIdToUpdate?: string) => {
        const categoryWithSameName = await prisma.categoria.findFirst({
            where: {
                empresaId: this.context.currentUserRole.empresaId,
                name: { in: names },
                id: { not: categoryIdToUpdate },
            },
        });

        if (categoryWithSameName)
            throw new ApiError(httpStatus.BAD_REQUEST, `O nome ${categoryWithSameName.name} já está em uso!`);
    };
}
