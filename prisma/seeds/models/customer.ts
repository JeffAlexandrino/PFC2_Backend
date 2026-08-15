import { NewCustomerWithOrgId } from "../../../src/types/customer.types";
import { NewSegmentWithOrgId } from "../../../src/types/segment.types";
import { salePersonA, salePersonB } from "./user";
import { organizationA } from "./organization";

export type SegmentTypeSeed = NewSegmentWithOrgId & { id: string };

export type CustomerTypeSeed = NewCustomerWithOrgId & { id: string; responsavelId: string | null };

export const segmentA: SegmentTypeSeed = {
    id: "segmentA",
    name: "Segmento A",
    empresaId: organizationA.id,
};

export const segmentB: SegmentTypeSeed = {
    id: "segmentB",
    name: "Segmento B",
    empresaId: organizationA.id,
};

export const customerA: CustomerTypeSeed = {
    id: "customerA",
    name: "Cliente A",
    email: "clienteA@clienteA.com",
    cnpj: "02281027000125",
    telefone: "48993214502",
    segmentoId: segmentA.id,
    empresaId: organizationA.id,
    responsavelId: salePersonA.id,
    origem: "INSTAGRAM",
};

export const customerB: CustomerTypeSeed = {
    id: "customerB",
    name: "Cliente B",
    email: "clienteB@clienteB.com",
    cnpj: "02363012000106",
    telefone: "48993214502",
    segmentoId: segmentA.id,
    empresaId: organizationA.id,
    responsavelId: salePersonB.id,
    origem: "WHATSAPP",
};

export const customerC: CustomerTypeSeed = {
    id: "customerC",
    name: "Cliente C",
    email: "clienteC@clienteC.com",
    cnpj: "07341446000129",
    telefone: "48993234502",
    segmentoId: segmentA.id,
    empresaId: organizationA.id,
    responsavelId: null,
    origem: "LINKEDIN",
};
