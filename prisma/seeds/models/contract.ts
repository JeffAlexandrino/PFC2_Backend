import { NewContractWithOrgId } from "../../../src/types/contract.type";
import { organizationA } from "./organization";

export type ContractTypeSeed = NewContractWithOrgId & { id: string };

export const contractA: ContractTypeSeed = {
    id: "contractA",
    name: "Contrato Suporte",
    comissaoPrimeiraParcela: true,
    empresaId: organizationA.id,
};

export const contractB: ContractTypeSeed = {
    id: "contractB",
    name: "Contrato Microsoft",
    comissaoPrimeiraParcela: false,
    empresaId: organizationA.id,
};
