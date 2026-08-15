import { MetaEmpresa, Prisma, TipoMeta, ValorTipoMetaEmpresa } from "@prisma/client";
import { FindQueryProps } from "./commom.types";

//VARIETIES
export type UpdateTargetEmpresaProps = NewTargetEmpresa & Pick<MetaEmpresa, "id">;
export type NewTargetEmpresa = Pick<MetaEmpresa, "dataInicioMeta" | "dataFimMeta"> & {
    tiposMeta: Pick<ValorTipoMetaEmpresa, "valorMeta" | "tipoMeta">[];
};

//VALIDATIONS
export type ValidCreateTargetsEmpresa = { body: { data: NewTargetEmpresa[] } };
export type ValidUpdateTargetEmpresa = { params: { id: string }; body: { data: Omit<UpdateTargetEmpresaProps, "id"> } };
export type ValidDeleteTargetEmpresa = { params: { id: string } };
export type ValidGetTargetEmpresa = { params: { id: string } };
export type ValidFindTargetsEmpresa = { query: FindQueryProps<TargetEmpresaWhere, TargetEmpresaSortBy> };

export const TargetEmpresaSortBy = Prisma.MetaEmpresaScalarFieldEnum;
export type TargetEmpresaSortBy = Prisma.MetaEmpresaScalarFieldEnum;
export type TargetEmpresaWhere = {
    dataInicioMeta?: Date;
    dataFimMeta?: Date;
    tipoMeta?: TipoMeta;
};

export type ActualValuesTypes = {
    VALOR_VENDA: number;
    MARKUP_BRUTO: number;
    MARKUP_LIQUIDO: number;
    MARGEM: number;
    FATURAMENTO: number;
    VISITA: number;
};
