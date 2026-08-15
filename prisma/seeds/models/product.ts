import { productServiceTypeA, productServiceTypeB } from "./product-service-type";
import { NewProductOrgId } from "../../../src/types/product.types";
import { manufacturerA, manufacturerB } from "./manufacturer";
import { categoryA, categoryB } from "./category";
import { organizationA } from "./organization";

export type ProductTypeSeed = NewProductOrgId & { id: string };

export const productA: ProductTypeSeed = {
    id: "productA",
    name: "Produto A",
    fabricanteId: manufacturerA.id,
    custoUnit: 1000,
    partNumber: "productA",
    categoriaId: categoryA.id,
    tipoProdutoServicoId: productServiceTypeA.id,
    empresaId: organizationA.id,
    tipoMoeda: "BRL",
};

export const productB: ProductTypeSeed = {
    id: "productB",
    name: "Produto B",
    fabricanteId: manufacturerA.id,
    custoUnit: 1000,
    partNumber: "productB",
    categoriaId: categoryB.id,
    tipoProdutoServicoId: productServiceTypeB.id,
    empresaId: organizationA.id,
    tipoMoeda: "BRL",
};

export const productC: ProductTypeSeed = {
    id: "productC",
    name: "Produto C",
    fabricanteId: manufacturerB.id,
    custoUnit: 1000,
    partNumber: "productC",
    categoriaId: categoryB.id,
    tipoProdutoServicoId: productServiceTypeB.id,
    empresaId: organizationA.id,
    tipoMoeda: "USD",
};

export const productD: ProductTypeSeed = {
    id: "productD",
    name: "Produto D",
    fabricanteId: manufacturerA.id,
    custoUnit: 1000,
    partNumber: "productD",
    categoriaId: categoryA.id,
    tipoProdutoServicoId: productServiceTypeA.id,
    empresaId: organizationA.id,
    tipoMoeda: "USD",
};

export const productE: ProductTypeSeed = {
    id: "productE",
    name: "DeleteMe",
    fabricanteId: manufacturerA.id,
    custoUnit: null,
    partNumber: "productE",
    categoriaId: categoryA.id,
    tipoProdutoServicoId: productServiceTypeA.id,
    empresaId: organizationA.id,
    tipoMoeda: "BRL",
};
