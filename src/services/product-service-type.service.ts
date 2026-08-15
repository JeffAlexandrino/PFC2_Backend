import { FindQueryProps } from "../types/commom.types";
import { RequestContext } from "../middlewares/auth";
import { Acao, Tabela } from "@prisma/client";

import * as T from "../types/product-service-type.types";

import PrismaUtils from "../utils/prisma.utils";
import httpStatus from "../utils/httpStatus";
import auditService from "./audit.service";
import SaleService from "./sale.service";
import ApiError from "../utils/apiError";
import prisma from "../prisma/prisma";

export default class ProductServiceTypeService {
    private readonly context: RequestContext;

    constructor(context: RequestContext) {
        this.context = context;
    }

    public createMany = async (newTypes: T.NewProductServiceType[]) => {
        await this.validateDuplicates(newTypes.map(({ name }) => name));

        const _create = prisma.tipoProdutoServico.createManyAndReturn({
            data: newTypes.map((type) => ({ ...type, empresaId: this.context.currentUserRole.empresaId })),
        });

        const _audit = auditService.createAudit({
            data: newTypes.map((newM) => ({ id: newM.name })),
            action: Acao.CREATE,
            table: Tabela.TIPO_PROD_SERV,
            context: this.context,
        });

        const [created] = await prisma.$transaction([_create, _audit]);
        return created.slice(0, newTypes.length);
    };

    public findManyBy = async (query: FindQueryProps<T.ProductServiceTypeWhere, T.ProductServiceTypeSortBy>) => {
        const { name } = query.where ?? {};

        return await prisma.tipoProdutoServico.findMany({
            where: {
                name: name ? { contains: name, mode: "insensitive" } : undefined,
                empresaId: this.context.currentUserRole.empresaId,
            },
            ...PrismaUtils.extractSortPageInfoFrom(query, "name", "asc"),
        });
    };

    public getOneBy = async (typeId: string) => {
        return await prisma.tipoProdutoServico.findUnique({
            where: { id: typeId, empresaId: this.context.currentUserRole.empresaId },
        });
    };

    public updateOne = async (updateProps: T.UpdateProductServiceTypeProps) => {
        await this.validateIfExist(updateProps.id);
        await this.validateDuplicates([updateProps.name], updateProps.id);

        const _update = prisma.tipoProdutoServico.update({
            where: { id: updateProps.id, empresaId: this.context.currentUserRole.empresaId },
            data: { ...updateProps, empresaId: this.context.currentUserRole.empresaId },
        });

        const _audit = auditService.createAudit({
            data: [{ ...updateProps }],
            action: Acao.UPDATE,
            table: Tabela.TIPO_PROD_SERV,
            context: this.context,
        });

        await prisma.$transaction([_update, _audit]);
        return;
    };

    public deleteOneBy = async (typeId: string) => {
        await this.validateIfExist(typeId);

        const _delete = prisma.tipoProdutoServico.delete({
            where: { id: typeId, empresaId: this.context.currentUserRole.empresaId },
        });

        const _audit = auditService.createAudit({
            data: [{ id: typeId }],
            action: Acao.DELETE,
            table: Tabela.TIPO_PROD_SERV,
            context: this.context,
        });

        await prisma.$transaction([_delete, _audit]);
        return;
    };

    public findManyWithProductIncludingProductSalesAndServiceIncludingServiceSales = async (
        props: T.FindManyWithProductIncludingProductSalesAndServiceIncludingServiceSalesProps
    ) => {
        const {
            lte_dataFaturamento,
            gte_dataFaturamento,
            lte_invoiceDate,
            gte_invoiceDate,
            gte_dataVenda,
            lte_dataVenda,
            ...rest
        } = props;

        return await prisma.tipoProdutoServico.findMany({
            where: { empresaId: this.context.currentUserRole.empresaId },
            select: {
                id: true,
                name: true,
                servicos: {
                    select: {
                        vendasServico: {
                            where: {
                                notaVenda: {
                                    dataFaturamento: { gte: gte_dataFaturamento, lte: lte_dataFaturamento },
                                    datasBoleto: { some: { data: { gte: gte_invoiceDate, lte: lte_invoiceDate } } },
                                    venda: {
                                        ...SaleService.getUserRoleSaleWhere(rest),
                                        estadoVenda: rest.estadoVenda,
                                        dataVenda: { gte: gte_dataVenda, lte: lte_dataFaturamento },
                                    },
                                },
                            },
                            include: { notaVenda: { include: { vendasServico: true, datasBoleto: true } } },
                        },
                    },
                },
                produtos: {
                    select: {
                        vendasProduto: {
                            where: {
                                notaVenda: {
                                    dataFaturamento: { gte: gte_dataFaturamento, lte: lte_dataFaturamento },
                                    datasBoleto: { some: { data: { gte: gte_invoiceDate, lte: lte_invoiceDate } } },
                                    venda: { ...SaleService.getUserRoleSaleWhere(rest), estadoVenda: rest.estadoVenda },
                                },
                            },
                            include: { notaVenda: { include: { vendasProduto: true, datasBoleto: true } } },
                        },
                    },
                },
            },
        });
    };

    private validateDuplicates = async (names: string[], typeIdUpdating?: string) => {
        const type = await prisma.tipoProdutoServico.findFirst({
            where: {
                empresaId: this.context.currentUserRole.empresaId,
                name: { in: names },
                id: { not: typeIdUpdating },
            },
        });

        if (type) throw new ApiError(httpStatus.BAD_REQUEST, `O nome '${type.name}' já existe!`);
    };

    private validateIfExist = async (typeId: string) => {
        const type = await this.getOneBy(typeId);
        if (!type) throw new ApiError(httpStatus.NOT_FOUND, "Tipo de Produto ou Serviço não encontrado.");
    };
}
