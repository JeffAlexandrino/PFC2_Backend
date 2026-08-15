import { NewCategoryWithOrgId } from "../../../src/types/category.types";
import { organizationA } from "./organization";

export type CategoryTypeSeed = NewCategoryWithOrgId & { id: string };

export const categoryA: CategoryTypeSeed = {
    id: "categoryA",
    name: "Categoria A",
    empresaId: organizationA.id,
};

export const categoryB: CategoryTypeSeed = {
    id: "categoryB",
    name: "Categoria B",
    empresaId: organizationA.id,
};

export const categoryC: CategoryTypeSeed = {
    id: "categoryC",
    name: "Categoria C",
    empresaId: organizationA.id,
};
