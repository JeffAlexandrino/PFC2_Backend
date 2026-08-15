import { Categoria, EstadoVenda, Prisma, Role } from "@prisma/client";
import { FindQueryProps } from "./commom.types";

//VARIETIES
export type NewCategoryWithOrgId = NewCategory & Pick<Categoria, "empresaId">;
export type UpdateCategoryProps = NewCategory & Pick<Categoria, "id">;
export type NewCategory = Pick<Categoria, "name">;

//VALIDATION
export type ValidUpdateCategory = { params: { id: string }; body: { data: Omit<UpdateCategoryProps, "id"> } };
export type ValidFindCategories = { query: FindQueryProps<CategoryWhere, CategorySortBy> };
export type ValidCreateCategories = { body: { data: NewCategory[] } };
export type ValidGetCategory = { params: { id: string } };
export type ValidDeleteCategory = { params: { id: string } };

export const CategorySortBy = Prisma.CategoriaScalarFieldEnum;
export type CategorySortBy = Prisma.CategoriaScalarFieldEnum;
export type CategoryWhere = Partial<{ name: string }>;

export type FindManyWithProductIncludingProductSalesProps = {
    gte_dataVenda?: Date;
    lte_dataVenda?: Date;
    gte_invoiceDate?: Date;
    lte_invoiceDate?: Date;
    salePersonId?: string;
    comercialManagerId?: string;
    comercialAssistantId?: string;
    solutionArchitectId?: string;
    estadoVenda?: EstadoVenda;
    role?: Role;
};
