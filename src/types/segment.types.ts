import { Prisma, Segmento } from "@prisma/client";
import { FindQueryProps } from "./commom.types";

//VARIETIES
export type NewSegmentWithOrgId = NewSegment & Pick<Segmento, "empresaId">;
export type UpdateSegmentProps = NewSegment & Pick<Segmento, "id">;
export type NewSegment = Pick<Segmento, "name">;

//VALIDATIONS
export type ValidUpdateSegment = { params: { id: string }; body: { data: Omit<UpdateSegmentProps, "id"> } };
export type ValidFindSegments = { query: FindQueryProps<SegmentWhere, SegmentSortBy> };
export type ValidCreateSegments = { body: { data: NewSegment[] } };
export type ValidDeleteSegment = { params: { id: string } };
export type ValidGetSegment = { params: { id: string } };

export const SegmentSortBy = Prisma.SegmentoScalarFieldEnum;
export type SegmentSortBy = Prisma.SegmentoScalarFieldEnum;
export type SegmentWhere = { name?: string };
