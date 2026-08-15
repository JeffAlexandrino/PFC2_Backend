import { dataComAnoAtual } from "../../../test/support/constant-test.support";
import { salePersonRoleA, salePersonRoleB } from "./user-role";
import { customerA, customerB } from "./customer";
import { organizationA } from "./organization";
import { Gasto, Visita } from "@prisma/client";
import { TipoGasto } from "@prisma/client";

export type NewVisitSeed = Pick<
    Visita,
    | "id"
    | "clienteId"
    | "dataVisita"
    | "remoto"
    | "salePersonId"
    | "comentarios"
    | "visitaPaga"
    | "carroEmpresa"
    | "kmInicial"
    | "kmFinal"
> & {
    empresaId?: Visita["empresaId"];
    gastos: Array<
        Omit<
            Gasto,
            "id" | "updatedAt" | "createdAt" | "visitaId" | "carroEmpresa" | "kmInicial" | "kmFinal" | "dataViagem"
        >
    >;
};

export const visitA: NewVisitSeed = {
    id: "visitA",
    dataVisita: dataComAnoAtual(5, 18),
    carroEmpresa: false,
    kmInicial: 0,
    kmFinal: 0,
    comentarios: "Comentário A",
    remoto: false,
    salePersonId: salePersonRoleA.id,
    clienteId: customerA.id,
    visitaPaga: true,
    empresaId: organizationA.id,
    gastos: [
        {
            nota: "notaA",
            tipoGasto: TipoGasto.ALIMENTACAO,
            tipoViagem: null,
            valor: 10,
        },
    ],
};

export const visitAb: NewVisitSeed = {
    id: "visitAb",
    dataVisita: dataComAnoAtual(5, 18),
    carroEmpresa: false,
    kmInicial: null,
    kmFinal: null,
    comentarios: "Comentário A",
    remoto: false,
    salePersonId: salePersonRoleB.id,
    clienteId: customerA.id,
    visitaPaga: true,
    empresaId: organizationA.id,
    gastos: [
        {
            nota: "notaAb",
            tipoGasto: TipoGasto.ALIMENTACAO,
            tipoViagem: null,
            valor: 10,
        },
    ],
};

export const visitB: NewVisitSeed = {
    id: "visitB",
    dataVisita: dataComAnoAtual(6, 19),
    carroEmpresa: false,
    kmInicial: null,
    kmFinal: null,
    comentarios: "Comentário B",
    remoto: true,
    visitaPaga: false,
    salePersonId: salePersonRoleB.id,
    clienteId: customerB.id,
    empresaId: organizationA.id,
    gastos: [],
};

export const visitC: NewVisitSeed = {
    id: "visitC",
    dataVisita: dataComAnoAtual(6, 29),
    carroEmpresa: false,
    kmInicial: null,
    kmFinal: null,
    comentarios: "Comentário C",
    remoto: false,
    visitaPaga: false,
    salePersonId: salePersonRoleB.id,
    clienteId: customerB.id,
    empresaId: organizationA.id,
    gastos: [
        {
            nota: "notaC",
            tipoGasto: TipoGasto.ALIMENTACAO,
            tipoViagem: null,
            valor: 20,
        },
    ],
};

export const visitD: NewVisitSeed = {
    id: "visitD",
    dataVisita: dataComAnoAtual(7, 5),
    carroEmpresa: true,
    kmInicial: 2000,
    kmFinal: 2100,
    comentarios: "Comentário D",
    remoto: false,
    salePersonId: salePersonRoleA.id,
    clienteId: customerA.id,
    visitaPaga: false,
    empresaId: organizationA.id,
    gastos: [
        {
            nota: "notaD",
            tipoGasto: TipoGasto.ALIMENTACAO,
            tipoViagem: null,
            valor: 10,
        },
    ],
};
