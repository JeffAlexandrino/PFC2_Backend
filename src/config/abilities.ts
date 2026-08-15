import { DataCreateSale, DataUpdateSale, QueryDeleteSale, QueryFindSales } from "@src/validations/sale.validator";
import { DataUpdateUserRoles, QueryUpdateUserInfo, QueryUpdateUserRoles } from "@src/validations/user.validator";
import { Comissao, EstadoVenda, Meta, MetaEmpresa, Role, User, UserRole, Venda, Visita } from "@prisma/client";
import { QueryCreateTarget, QueryDeleteTarget } from "@src/validations/target.validator";
import { COMERCIAL_ROLES, ComercialRole, UserRoleWhere } from "../types/user-role.types";
import { QueryFindTargets, QueryUpdateTarget } from "@src/validations/target.validator";
import { DataUpdateVisit, QueryUpdateVisit } from "@src/validations/visit.validator";
import { CommissionDistributionWhere } from "../types/commission-distribution.types";
import { DataCreateUser, QueryDeleteUser } from "@src/validations/user.validator";
import { createMongoAbility, AbilityBuilder, MongoAbility } from "@casl/ability";
import { QueryGetSale, QueryUpdateSale } from "@src/validations/sale.validator";
import { QueryFindCommissions } from "@src/validations/commission.validator";
import { OrganizationWhere } from "../types/organization.types";
import { NewVisit, VisitWhere } from "@src/types/visit.types";
import { DashboardsWhere } from "../types/dashboards.types";
import { AuditWhere } from "../types/audit.types";

import config from "./config";
import { QueryFindOrganizationTargets } from "@src/validations/organization-target.validator";

const INIT_HOUR_OF_WORK = "08:00:00";
const LAST_HOUR_OF_WORK = "18:00:00";

export const fnSubject = (subject: Subjects, params?: {}) => ({ __typename: subject, ...params });

export type AppAbility = MongoAbility<[Actions, Subjects | objSubject | { __typename: Subjects }]>;
export type objSubject = User | Venda | UserRole | Meta | MetaEmpresa | Role | Comissao;

export type Actions = "manage" | "create" | "read" | "update" | "delete";
export type Subjects =
    | "User"
    | "Cliente"
    | "Fornecedor"
    | "Fabricante"
    | "Categoria"
    | "DistribuicaoComissao"
    | "Venda"
    | "Servico"
    | "Produto"
    | "Meta"
    | "MetaEmpresa"
    | "TipoProdutoServico"
    | "Auth"
    | "Segmento"
    | "Auditoria"
    | "Dashboard"
    | "Comissao"
    | "FormaPagamento"
    | "Visita"
    | "Contrato"
    | "Empresa"
    | "UserRole"
    | "all";

export function defineAbilitiesFor(user: { currentUserRole: UserRole; userId: string }): AppAbility {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

    const { role, userId, id: userRoleId } = user.currentUserRole;

    //Globlal permissions
    can("read", "TipoProdutoServico");
    can("read", "FormaPagamento");
    can("read", "Fornecedor");
    can("read", "Fabricante");
    can("read", "Categoria");
    can("read", "Contrato");
    can("read", "Segmento");
    can("read", "Servico");
    can("read", "Produto");
    can("read", "Cliente");
    can("read", "User");

    can<OrganizationWhere>("read", "Empresa", { userId });

    can<UserRoleWhere>("read", "UserRole", { role: { $in: COMERCIAL_ROLES } });
    can<UserRoleWhere>("read", "UserRole", { id: userRoleId });

    cannot(["update", "delete"], "Auditoria");

    if (Role.MONITOR === role) {
        can("read", "Dashboard");
        can("read", "Meta");
        can("read", "MetaEmpresa");

        cannot("read", "Cliente");
        cannot("read", "Fornecedor");
        cannot("read", "Produto");
        cannot("read", "Servico");
        cannot("read", "DistribuicaoComissao");

        cannot(["create", "update", "delete"], "all");
    }

    if (Role.ADMIN === role) {
        can("manage", "DistribuicaoComissao");
        can("manage", "UserRole");
        can("manage", "Comissao");
        can("manage", "Contrato");
        can("manage", "Visita");
        can("manage", "Venda");
        can("manage", "User");
        can("manage", "Meta");
        can(["read", "update", "create"], "MetaEmpresa");

        can("manage", "TipoProdutoServico");
        can("manage", "FormaPagamento");
        can("manage", "Fornecedor");
        can("manage", "Fabricante");
        can("manage", "Categoria");
        can("manage", "Segmento");
        can("manage", "Produto");
        can("manage", "Servico");
        can("manage", "Cliente");

        can("read", "Dashboard");
        can("read", "Auditoria");

        can("update", "Empresa");
    }

    if (Role.FINANCIAL_MANAGER === role) {
        can("manage", "DistribuicaoComissao");
        can("manage", "TipoProdutoServico");
        can("manage", "FormaPagamento");
        can("manage", "Fornecedor");
        can("manage", "Fabricante");
        can("manage", "Categoria");
        can("manage", "Comissao");
        can("manage", "Contrato");
        can("manage", "Segmento");
        can("manage", "Produto");
        can("manage", "Servico");
        can("manage", "Venda");
        can("manage", "Meta");

        can(["read", "update", "create"], "Visita");

        can(["update", "create"], "Cliente");

        can("read", "UserRole");
        can("read", "Dashboard");
        can("read", "Auditoria");
        can("read", "MetaEmpresa");
    }

    if (Role.COMMISSIONING_ANALYST === role) {
        can(["create", "read", "update"], "Comissao"); //TODO: Retirar update e ajustar os testes
        can(["create", "read", "update"], "Visita");

        can("update", "Cliente");
        can("update", "Comissao", { estadoVenda: EstadoVenda.AVAILABLE_PAYMENT });

        can(["update", "create"], "Produto");
        can(["update", "create"], "Servico");
        can(["update", "create"], "Contrato");
        can(["update", "create"], "Fabricante");
        can(["update", "create"], "Fornecedor");
        can(["update", "create"], "FormaPagamento");
        can(["update", "create"], "TipoProdutoServico");
        can(["update", "create"], "Segmento");

        can("read", "Venda");
        can("read", "DistribuicaoComissao");
        can("read", "Dashboard");
        //can("read", "Auditoria");
        can("read", "Meta");

        can<UserRoleWhere>("read", "UserRole", { id: userRoleId });
        // TODO: Review these restrictions
        //cannot("manage", "UserRole", { role: Role.ADMIN || Role.MONITOR });
        //cannot("manage", "User", { role: Role.ADMIN || Role.MONITOR });

        const statusToCreate = [
            EstadoVenda.INITIAL,
            EstadoVenda.BILLING_AUDIT,
            EstadoVenda.FINANCIAL_AUDIT,
            EstadoVenda.AVAILABLE_PAYMENT,
        ];
        can<DataCreateSale>("create", "Venda", { estadoVenda: { $in: statusToCreate } });

        const statusToUpdate = [...statusToCreate, EstadoVenda.PAID];
        const permitedUpdateStatus = [
            EstadoVenda.INITIAL,
            EstadoVenda.BILLING_AUDIT,
            EstadoVenda.FINANCIAL_AUDIT,
            EstadoVenda.AVAILABLE_PAYMENT,
        ];
        can<DataUpdateSale & QueryUpdateSale>("update", "Venda", {
            estadoVenda: { $in: statusToUpdate },
            estadoVendaAtual: { $in: permitedUpdateStatus },
        });

        const permitedDeleteStatus = permitedUpdateStatus;
        can<QueryDeleteSale>("delete", "Venda", { estadoVendaAtual: { $in: permitedDeleteStatus } }); //TODO: remover essa possibilidade
    }

    if (COMERCIAL_ROLES.includes(role as ComercialRole)) {
        // can<AuditWhere>("read", "Auditoria", {
        //     tabela: { $in: ["COMISSAO", "CLIENTE", "FORNECEDOR", "PRODUTO", "SERVICO", "VENDA"] },
        // });
        can<CommissionDistributionWhere>("read", "DistribuicaoComissao", { userRoleId, role });
        can<DashboardsWhere>("read", "Dashboard", { userRoleId });
        can<QueryFindCommissions["where"]>("read", "Comissao", { userId });
        can<QueryFindTargets["where"]>("read", "Meta", { userRoleId });

        // TODO: Review these restrictions
        //cannot("manage", "UserRole", { role: Role.ADMIN || Role.MONITOR });
        //cannot("manage", "User", { role: Role.ADMIN || Role.MONITOR });
    }

    if (Role.COMERCIAL_MANAGER === role) {
        const comercialNotManagerRoles = [
            Role.VENDEDOR,
            Role.SOLUTION_ARCHITECT,
            Role.COMERCIAL_ASSISTANT,
            Role.REFERRER,
        ];

        can("manage", "Venda");
        can("manage", "Cliente");
        can("manage", "Categoria");
        can("manage", "Produto");
        can("manage", "Servico");
        can("manage", "Fornecedor");
        can("manage", "Fabricante");
        can("manage", "Segmento");
        can("manage", "Visita");
        can("manage", "DistribuicaoComissao");

        can(["update", "create"], "TipoProdutoServico");

        can("read", "Dashboard");
        can("read", "Auditoria");
        can("read", "MetaEmpresa");
        //can<AuditWhere>("read", "Auditoria", { tabela: { $in: ["USUARIO", "VISITA", "VENDA", "PRODUTO"] } });
        can<QueryFindTargets["where"]>("read", "Meta", {
            userRole: { $in: comercialNotManagerRoles },
        });

        can<DataCreateUser>("create", "User", {
            role: { $in: comercialNotManagerRoles },
        });
        can<QueryCreateTarget>("create", "Meta", {
            userRole: { $in: comercialNotManagerRoles },
        });

        can<QueryUpdateUserInfo | QueryUpdateUserRoles>("update", "User", { onlyComercialNotManagerRoles: "true" });
        can<DataUpdateUserRoles>("update", "User", {
            userRoles: { $elemMatch: { role: { $in: comercialNotManagerRoles } } },
        });
        can<QueryUpdateTarget>("update", "Meta", {
            userRole: { $in: comercialNotManagerRoles },
        });

        can<QueryDeleteUser>("delete", "User", { onlyComercialNotManagerRoles: "true" });
        can<QueryDeleteTarget>("delete", "Meta", {
            userRole: { $in: comercialNotManagerRoles },
        });
    }

    if (Role.VENDEDOR === role) {
        // can<AuditWhere>("read", "Auditoria", { tabela: { $in: ["VISITA"] } });
        can<QueryGetSale>("read", "Venda", { accountManagerIdAtual: userRoleId });
        can<QueryFindSales["where"]>("read", "Venda", { salePersonId: userRoleId });
        can<VisitWhere>("read", "Visita", { salePersonId: userRoleId });

        const statusToCreate = [EstadoVenda.INITIAL, EstadoVenda.BILLING_AUDIT];
        can<DataCreateSale>("create", "Venda", { estadoVenda: { $in: statusToCreate }, accountManagerId: userRoleId });
        can<DataCreateSale>("create", "Venda", { estadoVenda: { $in: statusToCreate }, insideSalesId: userRoleId });
        can<NewVisit>("create", "Visita", { salePersonId: userRoleId });

        const statusToUpdate = statusToCreate;
        const permitedUpdateStatus = [EstadoVenda.INITIAL];
        can<QueryUpdateSale & DataUpdateSale>("update", "Venda", {
            estadoVenda: { $in: statusToUpdate },
            estadoVendaAtual: { $in: permitedUpdateStatus },
            accountManagerIdAtual: userRoleId,
        });
        can<QueryUpdateSale & DataUpdateSale>("update", "Venda", {
            estadoVenda: { $in: statusToUpdate },
            estadoVendaAtual: { $in: permitedUpdateStatus },
            insideSalesIdAtual: userRoleId,
        });
        can<QueryUpdateVisit & DataUpdateVisit>("update", "Visita", {
            salePersonId: userRoleId,
            currentSalePersonId: userRoleId,
        });

        const permitedDeleteStatus = permitedUpdateStatus;
        can<QueryDeleteSale>("delete", "Venda", {
            estadoVendaAtual: { $in: permitedDeleteStatus },
            accountManagerIdAtual: userRoleId,
        });

        const currentTimeStr = new Date().toLocaleTimeString("pt-BR", {
            timeZone: "America/Sao_Paulo",
        });

        can("create", "Categoria");

        can(["create", "update"], "Cliente");
        can(["update", "create"], "Segmento");
        can(["update", "create"], "Produto");
        can(["update", "create"], "Fornecedor");
        can(["update", "create"], "Fabricante");
        can(["update", "create"], "Servico");

        if ((currentTimeStr < INIT_HOUR_OF_WORK || currentTimeStr > LAST_HOUR_OF_WORK) && config.env !== "test") {
            cannot<Venda>("create", "Venda");
            cannot<Venda>("update", "Venda");
            cannot<Venda>("delete", "Venda");

            cannot<Visita>("create", "Visita");
            cannot<Visita>("update", "Visita");
            cannot<Visita>("delete", "Visita");
        }
    }

    if (Role.SOLUTION_ARCHITECT === role) {
        can<QueryFindSales["where"]>("read", "Venda", { solutionArchitectId: userRoleId });

        can(["update", "create"], "Segmento");

        cannot("update", "Cliente");

        //TODO: can only read their own commissions
        //can<QueryFindCommissions["where"]>("read", "Comissao", { userId: userRoleId });
    }

    if (Role.COMERCIAL_ASSISTANT === role) {
        can<QueryFindSales["where"]>("read", "Venda", { comercialAssistantId: userRoleId });
    }

    if (Role.REFERRER === role) {
        can<QueryFindSales["where"]>("read", "Venda", { referrerId: userRoleId });
    }

    return build({ detectSubjectType: (object: any) => object.__typename });
}
