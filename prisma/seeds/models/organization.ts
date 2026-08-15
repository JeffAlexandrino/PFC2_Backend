import { NewOrganization } from "../../../src/types/organization.types";

export type OrganizationTypeSeed = NewOrganization & { id: string };

export const organizationA: OrganizationTypeSeed = {
    id: "organizationA",
    name: "Protect Solutions LTDA",
    cnpj: "02281027000125",
};

export const organizationB: OrganizationTypeSeed = {
    id: "organizationB",
    name: "Organization B",
    cnpj: "02363012000106",
};
