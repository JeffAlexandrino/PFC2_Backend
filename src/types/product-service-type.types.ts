import { EstadoVenda, Prisma, Role, TipoProdutoServico } from "@prisma/client";
import { FindQueryProps } from "./commom.types";

//VARIETIES
export type NewProductServiceTypeWithOrgId = NewProductServiceType & Pick<TipoProdutoServico, "empresaId">;
export type UpdateProductServiceTypeProps = NewProductServiceType & Pick<TipoProdutoServico, "id">;
export type NewProductServiceType = Pick<TipoProdutoServico, "name">;

//VALIDATIONS
export type ValidFindProductserviceTypes = { query: FindQueryProps<ProductServiceTypeWhere, ProductServiceTypeSortBy> };
export type ValidCreateProductServiceTypes = { body: { data: NewProductServiceType[] } };
export type ValidDeleteProductServiceType = { params: { id: string } };
export type ValidGetProductServiceType = { params: { id: string } };
export type ValidUpdateProductServiceType = {
    params: { id: string };
    body: { data: Omit<UpdateProductServiceTypeProps, "id"> };
};

export const ProductServiceTypeSortBy = Prisma.TipoProdutoServicoScalarFieldEnum;
export type ProductServiceTypeSortBy = Prisma.TipoProdutoServicoScalarFieldEnum;
export type ProductServiceTypeWhere = Partial<{ name: string }>;

export type FindManyWithProductIncludingProductSalesAndServiceIncludingServiceSalesProps = {
    gte_dataFaturamento?: Date;
    lte_dataFaturamento?: Date;
    gte_invoiceDate?: Date;
    lte_invoiceDate?: Date;
    gte_dataVenda?:Date;
    lte_dataVenda?:Date;
    estadoVenda?: EstadoVenda;
    salePersonId?: string;
    comercialManagerId?: string;
    comercialAssistantId?: string;
    solutionArchitectId?: string;
    role?: Role;
};
