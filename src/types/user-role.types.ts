import { EstadoVenda, Prisma, Role, User, UserRole } from "@prisma/client";
import { DataUpdateUserRoles } from "../validations/user.validator";
import { FindQueryProps } from "./commom.types";

export const HIGH_ACCESS_ROLES = [Role.ADMIN, Role.FINANCIAL_MANAGER, Role.COMERCIAL_MANAGER];
export const NOT_COMERCIAL_ROLES = [Role.ADMIN, Role.COMMISSIONING_ANALYST];
export const COMERCIAL_ROLES = [
    Role.COMERCIAL_MANAGER,
    Role.COMERCIAL_ASSISTANT,
    Role.SOLUTION_ARCHITECT,
    Role.VENDEDOR,
    Role.REFERRER,
];
export type ComercialRole = (typeof COMERCIAL_ROLES)[number];
export type NotComercialRole = (typeof NOT_COMERCIAL_ROLES)[number];
export type HighAccessRoles = (typeof HIGH_ACCESS_ROLES)[number];

//VALIDATIONS
export type ValidFindUserRoles = { query: FindQueryProps<UserRoleWhere, UserRoleSortBy> };
export type ValidGetUserRole = { params: { id: string } };

export const UserRoleSortBy = Prisma.UserRoleScalarFieldEnum;
export type UserRoleSortBy = Prisma.UserRoleScalarFieldEnum;
export type UserRoleWhere = Partial<{
    gte_updatedAt: Date;
    lte_updatedAt: Date;
    bloqueado: string;
    role: Role;
    id: string;
}>;

export type FindManyWithSalesAndVisitsProps = {
    role?: Role;
    gte_dataVenda?: Date;
    lte_dataVenda?: Date;
    gte_invoiceDate?: Date;
    lte_invoiceDate?: Date;
    gte_dataVisita?: Date;
    lte_dataVisita?: Date;
    salePersonId?: string;
    referrerId?: string;
    comercialManagerId?: string;
    comercialAssistantId?: string;
    solutionArchitectId?: string;
    estadoVenda?: EstadoVenda;
};

export type UserWithRoles = Omit<User, "password"> & {
    userRoles: UserRole[];
};

export type updateUserRolesType = DataUpdateUserRoles["userRoles"];
