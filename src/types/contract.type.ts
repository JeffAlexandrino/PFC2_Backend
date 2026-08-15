import { Contrato, Prisma } from "@prisma/client";
import { FindQueryProps } from "./commom.types";

//VARIETIES
export type NewContractWithOrgId = NewContract & Pick<Contrato, "empresaId">;
export type NewContract = Pick<Contrato, "name" | "comissaoPrimeiraParcela">;
export type UpdateContractProps = NewContract & Pick<Contrato, "id">;

export type ContractInfoMappedByContractId = Record<string, Contrato>;

//VALIDATIONS
export type ValidUpdateContract = { params: { id: string }; body: { data: Omit<UpdateContractProps, "id"> } };
export type ValidFindContracts = { query: FindQueryProps<ContractWhere, ContractSortBy> };
export type ValidCreateContracts = { body: { data: NewContract[] } };
export type ValidDeleteContract = { params: { id: string } };
export type ValidGetContract = { params: { id: string } };

export const ContractSortBy = Prisma.ContratoScalarFieldEnum;
export type ContractSortBy = Prisma.ContratoScalarFieldEnum;
export type ContractWhere = Partial<{ name: string }>;
