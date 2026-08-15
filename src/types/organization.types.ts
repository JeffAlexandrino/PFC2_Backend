import { Empresa, Prisma } from "@prisma/client";
import { FindQueryProps } from "./commom.types";

//VARIETIES
export type NewOrganization = Pick<Empresa, "name" | "cnpj">;
export type UpdateOrganizationProps = NewOrganization & Pick<Empresa, "id">;

export type OrganizationWithLogo = Prisma.EmpresaGetPayload<typeof organizationWithLogo>;
const organizationWithLogo = Prisma.validator<Prisma.EmpresaDefaultArgs>()({ include: { empresaLogo: true } });

//VALIDATIONS
export type ValidFindOrganizations = { query: FindQueryProps<OrganizationWhere, OrganizationSortBy> };
export type ValidUpdateOrganization = { params: { id: string }; body: { data: Omit<UpdateOrganizationProps, "id"> } };

export type OrganizationWhere = { id?: string; name?: string; cnpj?: string; userId?: string };
export const OrganizationSortBy = Prisma.EmpresaScalarFieldEnum;
export type OrganizationSortBy = Prisma.EmpresaScalarFieldEnum;
