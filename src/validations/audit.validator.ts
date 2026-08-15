import yupFindQuerySchema from "./schema-base/yup-find-query.schema";
import yup from "../config/yup";

import { AuditSortBy, ValidFindAudit } from "../types/audit.types";
import { Acao, Tabela } from "@prisma/client";

export default class AuditValidator {
    public static findAudits: yup.ObjectSchema<ValidFindAudit> = yup.object({
        query: yupFindQuerySchema(
            {
                tabela: yup.mixed<Tabela>().oneOf(Object.values(Tabela)),
                acao: yup.mixed<Acao>().oneOf(Object.values(Acao)),
                dadoId: yup.string(),
            },
            Object.values(AuditSortBy)
        ),
    });
}
