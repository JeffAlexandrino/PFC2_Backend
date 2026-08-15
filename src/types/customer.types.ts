import { Cliente, EstadoVenda, Origem, Prisma, Role } from "@prisma/client";
import { FindQueryProps } from "./commom.types";

//VARIETIES
export type NewCustomerWithSegmentName = Omit<NewCustomer, "segmentoId"> & { segmentoName: string };
export type NewCustomer = Pick<Cliente, "name" | "email" | "cnpj" | "telefone" | "segmentoId" | "origem">;
export type NewCustomerWithOrgId = NewCustomer & Pick<Cliente, "empresaId">;
export type UpdateCustomerProps = NewCustomer & Pick<Cliente, "id">;
export type CustomerUniqueFields = Pick<Cliente, "email" | "cnpj">;

export type CustomerWithSegment = Prisma.ClienteGetPayload<typeof customerWithSegment>;
const customerWithSegment = Prisma.validator<Prisma.ClienteDefaultArgs>()({
    select: { id: true, name: true, segmento: { select: { id: true, name: true } } },
});

//VALIDATION
export type ValidUpdateCustomer = { params: { id: string }; body: { data: Omit<UpdateCustomerProps, "id"> } };
export type ValidFindCustomers = { query: FindQueryProps<CustomerWhere, CustomerSortBy> };
export type ValidImportCustomers = { body: { data: NewCustomerWithSegmentName[] } };
export type ValidCreateCustomers = { body: { data: NewCustomer[] } };
export type ValidDeleteCustomer = { params: { id: string } };
export type ValidGetCustomer = { params: { id: string } };

export const CustomerSortBy = Prisma.ClienteScalarFieldEnum;
export type CustomerSortBy = Prisma.ClienteScalarFieldEnum;
export type CustomerWhere = Partial<{
    lte_updatedAt: Date;
    gte_updatedAt: Date;
    segmentoId: string;
    telefone: string;
    email: string;
    name: string;
    cnpj: string;
    responsavelId: string;
    origem: Origem;
    comprou: string;
}>;
export type CustomerWithSaleAndVisitWhere = CustomerWhere & {
    gte_dataVenda?: Date;
    lte_dataVenda?: Date;
    gte_invoiceDate?: Date;
    lte_invoiceDate?: Date;
    gte_dataVisita?: Date;
    lte_dataVisita?: Date;
    salePersonId?: string;
    comercialManagerId?: string;
    solutionArchitectId?: string;
    comercialAssistantId?: string;
    estadoVenda?: EstadoVenda;
    role?: Role;
};
