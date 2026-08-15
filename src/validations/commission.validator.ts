import yupFindQuerySchema from "./schema-base/yup-find-query.schema";
import yupParamsSchema from "./schema-base/yup-params.schema";
import yupQuerySchema from "./schema-base/yup-query.schema";
import yupBodySchema from "./schema-base/yup-body.schema";
import yupDataSchema from "./schema-base/yup-data.schema";
import yup from "../config/yup";

import * as T from "../types/commission.types";

import { EstadoVenda } from "@prisma/client";

export default class CommissionValidator {
    public static findMany = yup.object({
        query: yupFindQuerySchema(
            {
                estadoVenda: yup.mixed<EstadoVenda>().oneOf(Object.values(EstadoVenda)),
                gte_dataComissao: yup.date(),
                lte_dataComissao: yup.date(),
                comissaoPaga: yup.mixed<"true" | "false">().oneOf(["true", "false"]),
                gte_updatedAt: yup.date(),
                lte_updatedAt: yup.date(),
                codigoNota: yup.string(),
                numOportunidadeCRM: yup.string(),
                saleInvoiceId: yup.string(),
                clienteId: yup.string(),
                userId: yup.string(),
                distributorPaid: yup.mixed<"true" | "false">().oneOf(["true", "false"]),
            },
            Object.values(T.CommissionSortBy)
        ),
    });

    public static getOne = yup.object({
        params: yupParamsSchema({ id: yup.string().required("Deve ser passado um id.") }),
    });

    public static disableOne = yup.object({
        params: yupParamsSchema({ id: yup.string().required("Deve ser passado um id.") }),
    });

    public static payOne = yup.object({
        params: yupParamsSchema({ id: yup.string().required("Deve ser passado um id.") }),
    });

    public static payMany = yup.object({
        body: yupBodySchema({
            data: yupDataSchema({
                comissoesId: yup.array().of(yup.string().required()).required("Deve ser passado um comissoesId."),
            }),
        }),
    });

    public static toggleDistributorPaid = yup.object({
        body: yupBodySchema({
            data: yupDataSchema({
                saleInvoiceId: yup.string().required("Deve ser passado um saleInvoiceId."),
                commissionDate: yup.date().required("Deve ser passado um commissionDate."),
            }),
        }),
    });

    public static approveMany = yup.object({
        body: yupBodySchema({
            data: yupDataSchema({
                comissoesId: yup.array().of(yup.string().required()).required("Deve ser passado um comissoesId."),
            }),
        }),
    });

    public static getInfoPerUser = yup.object({
        query: yupQuerySchema({
            where: yup
                .object({
                    gte_dataComissao: yup.date().required("Deve ser passado um gte_dataComissao."),
                    lte_dataComissao: yup.date().required("Deve ser passado um lte_dataComissao."),
                    estadoVenda: yup.mixed<EstadoVenda>().oneOf(Object.values(EstadoVenda)),
                    distributorPaid: yup.mixed<"true" | "false">().oneOf(["true", "false"]),
                    userId: yup.string(),
                })
                .noUnknown(true)
                .strict(),
        }),
    });
}

export type ValidFindCommissions = yup.InferType<typeof CommissionValidator.findMany>;
export type QueryFindCommissions = yup.InferType<typeof CommissionValidator.findMany>["query"];

export type ValidGetOneCommission = yup.InferType<typeof CommissionValidator.getOne>;
export type ValidPayOneCommission = yup.InferType<typeof CommissionValidator.payOne>;
export type ValidDisableOneCommission = yup.InferType<typeof CommissionValidator.disableOne>;

export type ValidToggleCommissionsDistributorPaid = yup.InferType<typeof CommissionValidator.toggleDistributorPaid>;
export type DataToggleCommissionsDistributorPaid = ValidToggleCommissionsDistributorPaid["body"]["data"];

export type ValidPayManyCommissions = yup.InferType<typeof CommissionValidator.payMany>;
export type ValidApproveManyCommissions = yup.InferType<typeof CommissionValidator.approveMany>;
export type ValidGetCommissionInfoPerUser = yup.InferType<typeof CommissionValidator.getInfoPerUser>;
