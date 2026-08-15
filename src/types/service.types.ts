import { Prisma, Servico, TipoMoeda } from "@prisma/client";
import { FindQueryProps } from "./commom.types";

//VARIETIES
export type UpdateServiceProps = NewService & Pick<Servico, "id">;
export type NewService = Pick<
    Servico,
    "name" | "observacoes" | "tipoProdutoServicoId" | "valorCustoHora" | "tipoMoeda"
>;

export type ServicesInfoMappedByServiceId = Record<string, Servico>;

//VALIDATIONS
export type ValidUpdateService = { params: { id: string }; body: { data: Omit<UpdateServiceProps, "id"> } };
export type ValidCreateServices = { body: { data: NewService[] } };
export type ValidDeleteService = { params: { id: string } };
export type ValidGetService = { params: { id: string } };
export type ValidFindServices = { query: FindQueryProps<ServiceWhere, ServiceSortBy> };

export const ServiceSortBy = Prisma.ServicoScalarFieldEnum;
export type ServiceSortBy = Prisma.ServicoScalarFieldEnum;
export type ServiceWhere = Partial<{
    name: string;
    tipoProdutoServicoId: string;
    gte_updatedAt: Date;
    lte_updatedAt: Date;
    observacoes: string;
    tipoMoeda: TipoMoeda;
}>;
