import { NewManufacturerWithId } from "../../../src/types/manufacturer.types";
import { organizationA } from "./organization";

export type ManufacturerTypeSeed = NewManufacturerWithId & { id: string };

export const manufacturerA: ManufacturerTypeSeed = {
    id: "manufacturerA",
    name: "Fabricante A",
    empresaId: organizationA.id,
};

export const manufacturerB: ManufacturerTypeSeed = {
    id: "manufacturerB",
    name: "Fabricante B",
    empresaId: organizationA.id,
};

export const manufacturerC: ManufacturerTypeSeed = {
    id: "manufacturerC",
    name: "DeleteMe",
    empresaId: organizationA.id,
};
