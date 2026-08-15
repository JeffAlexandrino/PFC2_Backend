import { Fornecedor, Prisma } from "@prisma/client";
import { FindQueryProps } from "./commom.types";

//VARIETIES
export type UpdateSupplierProps = NewSupplier & Pick<Fornecedor, "id">;
export type NewSupplier = Pick<Fornecedor, "name" | "email" | "cnpj">;

//VALIDATIONS
export type ValidUpdateSupplier = { body: { data: Omit<UpdateSupplierProps, "id"> }; params: { id: string } };
export type ValidFindSuppliers = { query: FindQueryProps<SupplierWhere, SupplierSortBy> };
export type ValidCreateSuppliers = { body: { data: NewSupplier[] } };
export type ValidDeleteSupplier = { params: { id: string } };
export type ValidGetSupplier = { params: { id: string } };

export const SupplierSortBy = Prisma.FornecedorScalarFieldEnum;
export type SupplierSortBy = Prisma.FornecedorScalarFieldEnum;
export type SupplierWhere = Partial<{
    name: string;
    email: string;
    cnpj: string;
    gte_updatedAt: Date;
    lte_updatedAt: Date;
}>;
