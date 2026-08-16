import { NewOrganization } from "../../../src/types/organization.types";

export type OrganizationTypeSeed = NewOrganization & { id: string };

export const organizationA: OrganizationTypeSeed = {
    id: "organizationA",
    name: "Projeto Satc LTDA",
    cnpj: "02372880000152",
};

export const organizationB: OrganizationTypeSeed = {
    id: "organizationB",
    name: "Organization B",
    cnpj: "02363012000106",
};
