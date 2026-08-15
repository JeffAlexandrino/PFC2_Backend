import { Prisma, Produto, TipoMoeda } from "@prisma/client";
import { FindQueryProps } from "./commom.types";

//VARIETIES
export type NewProduct = Pick<
    Produto,
    "name" | "categoriaId" | "tipoProdutoServicoId" | "custoUnit" |"fabricanteId" | "partNumber" | "tipoMoeda"
>;
export type NewProductOrgId = NewProduct & Pick<Produto, "empresaId">;
export type UpdateProductProps = NewProduct & Pick<Produto, "id">;

//VALIDATIONS
export type ValidUpdateProduct = { params: { id: string }; body: { data: Omit<UpdateProductProps, "id"> } };
export type ValidFindProducts = { query: FindQueryProps<ProductWhere, ProductSortBy> };
export type ValidCreateProducts = { body: { data: NewProduct[] } };
export type ValidDeleteProduct = { params: { id: string } };
export type ValidGetProduct = { params: { id: string } };

export const ProductSortBy = Prisma.ProdutoScalarFieldEnum;
export type ProductSortBy = Prisma.ProdutoScalarFieldEnum;
export type ProductWhere = Partial<{
    tipoProdutoServicoId: string;
    fabricanteId: string;
    categoriaId: string;
    partNumber: string;
    name: string;
    custoUnit: number;
    tipoMoeda: TipoMoeda;
    gte_updatedAt: Date;
    lte_updatedAt: Date;
}>;
