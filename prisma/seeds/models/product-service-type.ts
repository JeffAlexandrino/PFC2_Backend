import { NewProductServiceTypeWithOrgId } from "../../../src/types/product-service-type.types";
import { organizationA } from "./organization";

export type ProductServiceTypeSeed = NewProductServiceTypeWithOrgId & { id: string };

export const productServiceTypeA: ProductServiceTypeSeed = {
    id: "productServiceTypeA",
    name: "Tipo Produto Servico A",
    empresaId: organizationA.id,
};

export const productServiceTypeB: ProductServiceTypeSeed = {
    id: "productServiceTypeB",
    name: "Tipo Produto Servico B",
    empresaId: organizationA.id,
};

export const productServiceTypeC: ProductServiceTypeSeed = {
    id: "productServiceTypeC",
    name: "DeleteMe",
    empresaId: organizationA.id,
};
