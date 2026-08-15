import { EstadoVenda, Meta, Prisma, Role, ValorTipoMeta } from "@prisma/client";
import { FindQueryProps } from "./commom.types";

//VARIETIES
export type UpdateTargetProps = NewTarget & Pick<Meta, "id">;
export type NewTarget = Pick<Meta, "dataInicioMeta" | "dataFimMeta" | "userRoleId"> & {
    tiposMeta: Pick<ValorTipoMeta, "aceleratorTriggerValue" | "commissionTriggerValue" | "tipoMeta">[];
};

export type TargetWithSalePersonAndTypes = Prisma.MetaGetPayload<typeof targetWithSalePersonAndTypes>;
const targetWithSalePersonAndTypes = Prisma.validator<Prisma.MetaDefaultArgs>()({
    include: { userRole: true, tiposMeta: true },
});

//VALIDATIONS
export type ValidCreateTargets = { body: { data: NewTarget[] } };
export type ValidUpdateTarget = { params: { id: string }; body: { data: Omit<UpdateTargetProps, "id"> } };
export type ValidDeleteTarget = { params: { id: string } };
export type ValidGetTarget = { params: { id: string } };
export type ValidFindTargets = { query: FindQueryProps<TargetWhere, TargetSortBy> };

export const TargetSortBy = Prisma.MetaScalarFieldEnum;
export type TargetSortBy = Prisma.MetaScalarFieldEnum;
export type TargetWhere = {
    userRoleId?: string;
    dataInicioMeta?: Date;
    dataFimMeta?: Date;
    estadoVenda?: EstadoVenda;
    vendaRenovacao?: boolean;
    role?: Role;
};
