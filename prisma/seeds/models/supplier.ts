import { NewSupplier } from "../../../src/types/supplier.types";
import { organizationA } from "./organization";
import { Fornecedor } from "@prisma/client";

export type NewSupplierWithOrgIdSeed = NewSupplier & Pick<Fornecedor, "empresaId"> & { id: string };

export const supplierA: NewSupplierWithOrgIdSeed = {
    id: "supplierA",
    name: "FornecedorA",
    email: "fornecedorA@fornecedorA.com",
    cnpj: "02281027000125",
    empresaId: organizationA.id,
};

export const supplierB: NewSupplierWithOrgIdSeed = {
    id: "supplierB",
    name: "FornecedorB",
    email: "fornecedorB@fornecedorB.com",
    cnpj: "02363012000106",
    empresaId: organizationA.id,
};

export const supplierC: NewSupplierWithOrgIdSeed = {
    id: "supplierC",
    name: "FornecedorC",
    email: "fornecedorC@fornecedorC.com",
    cnpj: "73015092000157",
    empresaId: organizationA.id,
};
