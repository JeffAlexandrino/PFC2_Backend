import { Acao, Auditoria, Prisma, Tabela } from "@prisma/client";
import { InputJsonValue } from "@prisma/client/runtime/client.js";
import { RequestContext } from "../middlewares/auth";
import { FindQueryProps } from "./commom.types";

//VARIETIES
export type NewAudit = Pick<Auditoria, "acao" | "dadoId" | "data" | "empresaId" | "tabela" | "userId"> & {
    dado: InputJsonValue;
};

export type CreateAuditProps = {
    data: ({ id: string } & object)[];
    context: Omit<RequestContext, "user">; //Adicionado Omit
    table: Tabela;
    action: Acao;
};

//VALIDATION
export type ValidFindAudit = { query: FindQueryProps<AuditWhere, Prisma.AuditoriaScalarFieldEnum> };

export type AuditWhere = { dadoId?: string; tabela?: Tabela; acao?: Acao };
export const AuditSortBy = Prisma.AuditoriaScalarFieldEnum;
export type AuditSortBy = Prisma.AuditoriaScalarFieldEnum;