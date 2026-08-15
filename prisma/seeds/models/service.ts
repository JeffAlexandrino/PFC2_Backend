import { productServiceTypeA, productServiceTypeB } from "./product-service-type";
import { NewService } from "../../../src/types/service.types";
import { organizationA } from "./organization";
import { Servico } from "@prisma/client";

export type NewServiceWithOrgId = NewService & Pick<Servico, "empresaId"> & { id: string };

export const serviceA: NewServiceWithOrgId = {
    id: "serviceA",
    name: "Serviço A",
    tipoProdutoServicoId: productServiceTypeA.id,
    valorCustoHora: 45,
    observacoes: " importante",
    tipoMoeda: "BRL",
    empresaId: organizationA.id,
};

export const serviceB: NewServiceWithOrgId = {
    id: "serviceB",
    name: "Serviço B",
    tipoProdutoServicoId: productServiceTypeB.id,
    valorCustoHora: 50,
    observacoes: "Muito importante",
    tipoMoeda: "USD",
    empresaId: organizationA.id,
};

export const serviceC: NewServiceWithOrgId = {
    id: "serviceC",
    name: "Serviço C",
    tipoProdutoServicoId: productServiceTypeA.id,
    valorCustoHora: 55,
    observacoes: "Nao existe em nenhuma venda",
    tipoMoeda: "USD",
    empresaId: organizationA.id,
};
