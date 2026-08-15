import { Gasto, Prisma, Role, Visita, VisitType } from "@prisma/client";
import { SalePersonWithUser } from "./sale-person.types";
import { FindQueryProps } from "./commom.types";

//VARIETIES
export type NewVisitWithOrgId = NewVisit & Pick<Visita, "empresaId">;
export type UpdateVisitsToPaidStatusProps = { visitasId: string[] };
export type UpdateVisitProps = UpdateVisit & Pick<Visita, "id">;
export type NewVisit = Pick<
    Visita,
    "clienteId" | "dataVisita" | "remoto" | "salePersonId" | "comentarios" | "visitaPaga" | "tipoVisita"
> & {
    gastos: Array<Omit<Gasto, "id" | "updatedAt" | "createdAt" | "visitaId">>;
};

export type UpdateVisit = Pick<
    Visita,
    "clienteId" | "dataVisita" | "remoto" | "salePersonId" | "comentarios" | "visitaPaga" | "tipoVisita"
> & {
    gastos: Array<Omit<Gasto, "id" | "updatedAt" | "createdAt">>;
};

export type VisitWithCustomers = Prisma.VisitaGetPayload<typeof visitWithCustomers>;
const visitWithCustomers = Prisma.validator<Prisma.VisitaDefaultArgs>()({ include: { cliente: true } });

export type VisitWithSalePersonRoles = Prisma.VisitaGetPayload<typeof visitWithSalePersonRoles>;
const visitWithSalePersonRoles = Prisma.validator<Prisma.VisitaDefaultArgs>()({
    include: { salePerson: { include: { user: { omit: { password: true } } } } },
});

export type VisitWithExpenses = Prisma.VisitaGetPayload<typeof visitWithExpenses>;
const visitWithExpenses = Prisma.validator<Prisma.VisitaDefaultArgs>()({ include: { gastos: true } });

export type MapVisitsAndNameBySalePersonRoleId = Record<
    string,
    { name: string; visitas: (VisitWithCustomers & VisitWithSalePersonRoles & VisitWithExpenses)[] }
>;

export type VisitInfoExpensesPerRole = {
    salePerson: SalePersonWithUser;
    total: number;
    pago: number;
    visitasIdsAPagar: string[];
};

//VALIDATIONS
export type ValidTypeFindVisitReports = { query: { where: VisitReportWhere }; body: { visitsIds: string[] } };
export type ValidFindInfoExpensesPerRole = { query: { where: VisitReportWhere } };
export type ValidDeleteVisit = { params: { id: string }; query?: { salePersonId?: string } };
export type ValidPayVisits = { body: { data: UpdateVisitsToPaidStatusProps } };
export type ValidFindVisits = { query: FindQueryProps<VisitWhere, VisitSortBy> };
export type ValidCreateVisits = { body: { data: NewVisit[] } };
export type ValidGetVisit = { params: { id: string } };
export type ValidUpdateVisit = {
    query?: { salePersonId?: string };
    body: { data: Omit<UpdateVisitProps, "id"> };
    params: Pick<Visita, "id">;
};

export const VisitSortBy = Prisma.VisitaScalarFieldEnum;
export type VisitSortBy = Prisma.VisitaScalarFieldEnum;
export type VisitWhere = {
    carroEmpresa?: string;
    clienteId?: string;
    comentarios?: string;
    codigoNota?: string;
    remoto?: string;
    salePersonId?: string;
    gte_updatedAt?: Date;
    lte_updatedAt?: Date;
    gte_dataVisita?: Date;
    lte_dataVisita?: Date;
    visitaPaga?: string;
    role?: Role;
    tipoVisita?: VisitType;
};

export type VisitReportWhere = Pick<VisitWhere, "salePersonId" | "gte_dataVisita" | "lte_dataVisita">;
export type VisitExpensesInfoPerRoleWhere = VisitReportWhere;
