import { Fabricante, Prisma } from "@prisma/client";
import { FindQueryProps } from "./commom.types";

//VARIETIES
export type NewManufacturerWithId = NewManufacturer & Pick<Fabricante, "empresaId">;
export type UpdateManufacturerProps = NewManufacturer & Pick<Fabricante, "id">;
export type NewManufacturer = Pick<Fabricante, "name">;

//VALIDATIONS
export type ValidCreateManufacturers = { body: { data: NewManufacturer[] } };
export type ValidUpdateManufacturer = { body: { data: Omit<UpdateManufacturerProps, "id"> }; params: { id: string } };
export type ValidDeleteManufacturer = { params: { id: string } };
export type ValidGetManufacturer = { params: { id: string } };
export type ValidFindManufacturers = { query: FindQueryProps<ManufacturerWhere, ManufacturerSortBy> };

export const ManufacturerSortBy = Prisma.FabricanteScalarFieldEnum;
export type ManufacturerSortBy = Prisma.FabricanteScalarFieldEnum;
export type ManufacturerWhere = Partial<{ name: string }>;
