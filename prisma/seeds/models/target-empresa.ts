import { dataComAnoAtual } from "../../../test/support/constant-test.support";
import { MetaEmpresa, ValorTipoMetaEmpresa } from "@prisma/client";
import { organizationA } from "./organization";

type NewTargetWithIdSeed = Pick<MetaEmpresa, "dataInicioMeta" | "dataFimMeta" | "id" | "empresaId"> & {
    tiposMeta: Pick<ValorTipoMetaEmpresa, "id" | "valorMeta" | "tipoMeta" | "valorAtual">[];
};
//Valor atual vai ser preenchido pelo sistema

const targetsEmpresa: NewTargetWithIdSeed[] = [
    {
        id: "target1EmpresaA",
        dataInicioMeta: dataComAnoAtual(1, 1),
        dataFimMeta: dataComAnoAtual(3, 30),
        empresaId: organizationA.id,
        tiposMeta: [{ id: "TipoMeta1A", tipoMeta: "VISITA", valorMeta: 5, valorAtual: 1 }],
    },
    {
        id: "target2EmpresaA",
        dataInicioMeta: dataComAnoAtual(1, 1),
        dataFimMeta: dataComAnoAtual(3, 30),
        empresaId: organizationA.id,
        tiposMeta: [
            {
                id: "TipoMeta2A",
                tipoMeta: "FATURAMENTO",
                valorMeta: 500000,
                valorAtual: 50000,
            },
        ],
    },
    {
        id: "target3EmpresaA",
        dataInicioMeta: dataComAnoAtual(1, 1),
        dataFimMeta: dataComAnoAtual(3, 30),
        empresaId: organizationA.id,
        tiposMeta: [
            {
                id: "TipoMeta3A",
                tipoMeta: "MARGEM",
                valorMeta: 1000000,
                valorAtual: 100000,
            },
        ],
    },
];
export default targetsEmpresa;
