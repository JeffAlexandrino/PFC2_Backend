import { Role } from "@prisma/client";

const allRoles: Role[] = Object.values(Role);

const rolesThatCanManageComissions: Role[] = [Role.ADMIN, Role.FINANCIAL_MANAGER];
const rolesThatCanCreateorUpdateComissions: Role[] = [...rolesThatCanManageComissions, Role.COMMISSIONING_ANALYST];
const rolesThatCanViewAllComissions: Role[] = [...rolesThatCanCreateorUpdateComissions];
const rolesThatCanManageAllSalesInAnyStatus: Role[] = [Role.ADMIN, Role.COMERCIAL_MANAGER, Role.FINANCIAL_MANAGER];
const rolesThatCanReadAllSales: Role[] = [...rolesThatCanManageAllSalesInAnyStatus, Role.COMMISSIONING_ANALYST];

const HIGH_ACCESS_ROLES: Role[] = [Role.ADMIN, Role.COMERCIAL_MANAGER, Role.FINANCIAL_MANAGER];

const HIGH_ACCESS_ROLES_AND_SALE_PERSON: Role[] = [...HIGH_ACCESS_ROLES, Role.VENDEDOR];
const rolesThatCanManageAllComDist: Role[] = [Role.ADMIN, Role.FINANCIAL_MANAGER, Role.COMERCIAL_MANAGER];
const rolesThatCanUpdateorCreateAllComDist: Role[] = rolesThatCanManageAllComDist;
const rolesThatCanViewAllComDist: Role[] = [...rolesThatCanUpdateorCreateAllComDist, Role.COMMISSIONING_ANALYST];

const rolesThatCanReadAllDash: Role[] = [
    Role.ADMIN,
    Role.FINANCIAL_MANAGER,
    Role.COMMISSIONING_ANALYST,
    Role.COMERCIAL_MANAGER,
    Role.MONITOR,
];

const rolesThatCanManageTargets: Role[] = [Role.ADMIN, Role.FINANCIAL_MANAGER];
const rolesThatCanCreateOrUpdateComercialTargets: Role[] = [...rolesThatCanManageTargets, Role.COMERCIAL_MANAGER];
const rolesThatCanCreateOrUpdateAnyTargets: Role[] = [...rolesThatCanManageTargets, Role.COMMISSIONING_ANALYST];
const rolesThatCanReadTargetWithoutRestriction: Role[] = [...rolesThatCanCreateOrUpdateAnyTargets, Role.MONITOR];

const rolesThatCanReadComercialTargets: Role[] = [
    Role.ADMIN,
    Role.FINANCIAL_MANAGER,
    Role.COMERCIAL_MANAGER,
    Role.COMMISSIONING_ANALYST,
    Role.MONITOR,
];

const onlyComercialNotManagerRoles: Role[] = [
    Role.VENDEDOR,
    Role.COMERCIAL_ASSISTANT,
    Role.SOLUTION_ARCHITECT,
    Role.REFERRER,
];

const rolesThatCanReadAnyUser: Role[] = [
    Role.ADMIN,
    Role.FINANCIAL_MANAGER,
    Role.COMERCIAL_MANAGER,
    Role.COMMISSIONING_ANALYST,
];

const rolesThatCanReadAnyUserRole: Role[] = [Role.ADMIN, Role.FINANCIAL_MANAGER];
const rolesThatCanManageVisit: Role[] = [Role.ADMIN, Role.COMERCIAL_MANAGER];
const rolesThatCanAddorUpdateVisitWithoutRestrictions: Role[] = [
    ...rolesThatCanManageVisit,
    Role.FINANCIAL_MANAGER,
    Role.COMMISSIONING_ANALYST,
];

const rolesThatCanAddorUpdateVisitWithRestrictions: Role[] = [
    Role.ADMIN,
    Role.COMERCIAL_MANAGER,
    Role.FINANCIAL_MANAGER,
    Role.COMMISSIONING_ANALYST,
    Role.VENDEDOR,
];

const rolesThatCanReadVisitWithoutRestrictions: Role[] = [
    Role.ADMIN,
    Role.COMERCIAL_MANAGER,
    Role.FINANCIAL_MANAGER,
    Role.COMMISSIONING_ANALYST,
];

const rolesThatCanReadVisitWithRestrictions: Role[] = [
    Role.ADMIN,
    Role.COMERCIAL_MANAGER,
    Role.FINANCIAL_MANAGER,
    Role.COMMISSIONING_ANALYST,
    Role.VENDEDOR,
];

const rolesThatCanManageAllCustomers: Role[] = [Role.ADMIN, Role.COMERCIAL_MANAGER];
const rolesThatCanUpdateAllCustomers: Role[] = [...rolesThatCanManageAllCustomers, Role.COMMISSIONING_ANALYST];
const rolesThatCanAddCustomers: Role[] = [...rolesThatCanManageAllCustomers, Role.FINANCIAL_MANAGER, Role.VENDEDOR];
const rolesThatCanReadAllCustomers = allRoles.filter((role) => role !== Role.MONITOR);

const rolesThatCanManageAllSegments: Role[] = [Role.ADMIN, Role.FINANCIAL_MANAGER, Role.COMERCIAL_MANAGER];
const rolesThatCanAddorUpdateSegment: Role[] = [
    ...rolesThatCanManageAllSegments,
    Role.VENDEDOR,
    Role.COMMISSIONING_ANALYST,
];

const rolesThatCanReadAllSegments = allRoles;
const rolesThatCanManageAllCategorys: Role[] = [Role.ADMIN, Role.FINANCIAL_MANAGER, Role.COMERCIAL_MANAGER];
const rolesThatCanAddorUpdateCategorys: Role[] = [...rolesThatCanManageAllCategorys, Role.VENDEDOR];

const rolesThatCanReadAllCategorys = allRoles;
const rolesThatCanManageAllManufacturers: Role[] = [Role.ADMIN, Role.FINANCIAL_MANAGER, Role.COMERCIAL_MANAGER];
const rolesThatCanAddorUpdateManufacturers: Role[] = [
    ...rolesThatCanManageAllManufacturers,
    Role.COMMISSIONING_ANALYST,
];

const rolesThatCanReadAllManufacturers = allRoles;
const rolesThatCanManageAllSuppliers: Role[] = [Role.ADMIN, Role.FINANCIAL_MANAGER, Role.COMERCIAL_MANAGER];
const rolesThatCanAddorUpdateSupplier: Role[] = [...rolesThatCanManageAllSuppliers, Role.COMMISSIONING_ANALYST];

const rolesThatCanReadAllSuppliers = allRoles.filter((role) => role !== Role.MONITOR);
const rolesThatCanManageAllPaymentMethod: Role[] = [Role.ADMIN];
const rolesThatCanAddorUpdatePaymentMethod: Role[] = [Role.ADMIN, Role.FINANCIAL_MANAGER, Role.COMMISSIONING_ANALYST];
const rolesThatCanReadAllPaymentMethod = allRoles;

const rolesThatCanManageAllPSTypes: Role[] = [Role.ADMIN];
const rolesThatCanAddorUpdatePSTypes: Role[] = [
    Role.ADMIN,
    Role.FINANCIAL_MANAGER,
    Role.COMMISSIONING_ANALYST,
    Role.COMERCIAL_MANAGER,
];

const rolesThatCanReadAllPSTypes = allRoles;
const rolesThatCanManageAllProducts: Role[] = [Role.ADMIN, Role.FINANCIAL_MANAGER, Role.COMERCIAL_MANAGER];
const rolesThatCanAddorUpdateProducts: Role[] = [...rolesThatCanManageAllProducts, Role.COMMISSIONING_ANALYST];

const rolesThatCanReadAllProducts = allRoles.filter((role) => role !== Role.MONITOR);
const rolesThatCanManageAllServices: Role[] = [Role.ADMIN, Role.FINANCIAL_MANAGER, Role.COMERCIAL_MANAGER];
const rolesThatCanAddorUpdateServices: Role[] = [...rolesThatCanManageAllServices, Role.COMMISSIONING_ANALYST];

const rolesThatCanReadAllServices = allRoles.filter((role) => role !== Role.MONITOR);
const rolesThatCanManageAllContracts: Role[] = [Role.ADMIN, Role.FINANCIAL_MANAGER];
const rolesThatCanAddorUpdateContracts: Role[] = [...rolesThatCanManageAllContracts, Role.COMMISSIONING_ANALYST];
const rolesThatCanReadAllContracts = allRoles;

export {
    rolesThatCanManageComissions,
    rolesThatCanCreateorUpdateComissions,
    rolesThatCanViewAllComissions,
    rolesThatCanManageAllSalesInAnyStatus,
    rolesThatCanReadAllSales,
    HIGH_ACCESS_ROLES,
    HIGH_ACCESS_ROLES_AND_SALE_PERSON,
    rolesThatCanManageAllComDist,
    rolesThatCanUpdateorCreateAllComDist,
    rolesThatCanViewAllComDist,
    rolesThatCanReadAllDash,
    rolesThatCanManageTargets,
    rolesThatCanCreateOrUpdateAnyTargets,
    rolesThatCanCreateOrUpdateComercialTargets,
    rolesThatCanReadTargetWithoutRestriction,
    rolesThatCanReadComercialTargets,
    onlyComercialNotManagerRoles,
    rolesThatCanReadAnyUser,
    rolesThatCanReadAnyUserRole,
    rolesThatCanManageVisit,
    rolesThatCanAddorUpdateVisitWithoutRestrictions,
    rolesThatCanAddorUpdateVisitWithRestrictions,
    rolesThatCanReadVisitWithoutRestrictions,
    rolesThatCanReadVisitWithRestrictions,
    rolesThatCanManageAllCustomers,
    rolesThatCanUpdateAllCustomers,
    rolesThatCanAddCustomers,
    rolesThatCanReadAllCustomers,
    rolesThatCanManageAllSegments,
    rolesThatCanAddorUpdateSegment,
    rolesThatCanReadAllSegments,
    rolesThatCanManageAllCategorys,
    rolesThatCanAddorUpdateCategorys,
    rolesThatCanReadAllCategorys,
    rolesThatCanManageAllManufacturers,
    rolesThatCanAddorUpdateManufacturers,
    rolesThatCanReadAllManufacturers,
    rolesThatCanManageAllSuppliers,
    rolesThatCanAddorUpdateSupplier,
    rolesThatCanReadAllSuppliers,
    rolesThatCanManageAllPaymentMethod,
    rolesThatCanAddorUpdatePaymentMethod,
    rolesThatCanReadAllPaymentMethod,
    rolesThatCanManageAllPSTypes,
    rolesThatCanAddorUpdatePSTypes,
    rolesThatCanReadAllPSTypes,
    rolesThatCanManageAllProducts,
    rolesThatCanAddorUpdateProducts,
    rolesThatCanReadAllProducts,
    rolesThatCanManageAllServices,
    rolesThatCanAddorUpdateServices,
    rolesThatCanReadAllServices,
    rolesThatCanManageAllContracts,
    rolesThatCanAddorUpdateContracts,
    rolesThatCanReadAllContracts,
};
