import yupQuerySchema from "./schema-base/yup-query.schema";
import yupBodySchema from "./schema-base/yup-body.schema";
import yup from "../config/yup";

import { EstadoVenda, Role } from "@prisma/client";

export default class ReportValidator {
    public static findVisitReports = yup.object({
        query: yupQuerySchema({
            where: yup
                .object({
                    gte_dataVisita: yup.date().required("Deve ser passado um gte_dataVisita."),
                    lte_dataVisita: yup.date().required("Deve ser passado um lte_dataVisita."),
                    salePersonId: yup.string(),
                })
                .required("Deve ser passado um where.")
                .noUnknown(true)
                .strict(),
        }),
        body: yupBodySchema({
            visitsIds: yup
                .array()
                .of(yup.string().required("Ids da visita devem ser definidos."))
                .required("Deve ser passado um visitsIds."),
        }),
    });

    public static findCommissionReports = yup.object({
        query: yupQuerySchema({
            where: yup
                .object({
                    gte_dataComissao: yup.date().required("Deve ser passado um gte_dataComissao."),
                    lte_dataComissao: yup.date().required("Deve ser passado um lte_dataComissao."),
                    estadoVenda: yup.mixed<EstadoVenda>().oneOf(Object.values(EstadoVenda)),
                    distributorPaid: yup.mixed<"true" | "false">().oneOf(["true", "false"]),
                    userId: yup.string(),
                })
                .required("Deve ser passado um where.")
                .noUnknown(true)
                .strict(),
        }),
        body: yupBodySchema({
            commissionsIds: yup.array().of(yup.string().required("Ids da comissão devem ser definidos.")),
        }),
    });

    public static findSalesReports = yup.object({
        query: yupQuerySchema({
            where: yup
                .object({
                    gte_dataVenda: yup.date().required("Deve ser passado um gte_dataVenda."),
                    lte_dataVenda: yup.date().required("Deve ser passado um lte_dataVenda."),
                    estadoVenda: yup.mixed<EstadoVenda>().oneOf(Object.values(EstadoVenda)),
                    numPedidoDistribuidor: yup.string(),
                    clienteId: yup.string(),
                })
                .required("Deve ser passado um where.")
                .noUnknown(true)
                .strict(),
        }),
        body: yupBodySchema({
            salesIds: yup.array().of(yup.string().required("Ids da comissão devem ser definidos.")),
        }),
    });

    public static findUserReports = yup.object({
        query: yupQuerySchema({
            where: yup.object({
                role: yup.mixed<Role>().oneOf(Object.values(Role)),
                gte_dataVenda: yup.date(),
                lte_dataVenda: yup.date(),
            }),
        }),
        body: yupBodySchema({
            usersIds: yup.array().of(yup.string().required("Ids dos usuarios devem ser definidos.")),
        }),
    });
}

export type ValidFindVisitReports = yup.InferType<typeof ReportValidator.findVisitReports>;
export type QueryFindVisitReports = ValidFindVisitReports["query"];
export type DataFindVisitReports = ValidFindVisitReports["body"];

export type ValidFindCommissionReports = yup.InferType<typeof ReportValidator.findCommissionReports>;

export type ValidFindSalesReports = yup.InferType<typeof ReportValidator.findSalesReports>;

export type ValidFindUserReports = yup.InferType<typeof ReportValidator.findUserReports>;
