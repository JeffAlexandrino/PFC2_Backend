import { dataComAnoAtual } from "../../../test/support/constant-test.support";
import { productServiceTypeA } from "./product-service-type";
import { NewAudit } from "../../../src/types/audit.types";
import { organizationA } from "./organization";
import { manufacturerA } from "./manufacturer";
import { categoryA } from "./category";
import { serviceA } from "./service";
import { productA } from "./product";
import { admin } from "./user";

export type AuditTypeSeed = NewAudit & { id: string };

export const auditA: AuditTypeSeed = {
    id: "auditA",
    dadoId: productA.id,
    dado: {
        name: productA.name,
        partNumber: productA.partNumber,
        categoriaId: categoryA.id,
        fabricanteId: manufacturerA.id,
        tipoProdutoServicoId: productServiceTypeA.id,
    },
    tabela: "CLIENTE",
    acao: "CREATE",
    data: dataComAnoAtual(5, 1),
    userId: admin.id,
    empresaId: organizationA.id,
};

export const auditB: AuditTypeSeed = {
    id: "auditB",
    dadoId: serviceA.id,
    dado: {
        name: serviceA.name,
        tipoMoeda: serviceA.tipoMoeda,
        observacoes: serviceA.observacoes,
        valorCustoHora: 120,
        tipoProdutoServicoId: serviceA.tipoProdutoServicoId,
    },
    tabela: "SERVICO",
    acao: "UPDATE",
    data: dataComAnoAtual(5, 1),
    userId: admin.id,
    empresaId: organizationA.id,
};
