import yupFindQuerySchema from "./schema-base/yup-find-query.schema";
import yupDataArrSchema from "./schema-base/yup-data-arr.schema";
import yupParamsSchema from "./schema-base/yup-params.schema";
import yupBodySchema from "./schema-base/yup-body.schema";
import yupDataSchema from "./schema-base/yup-data.schema";
import yup from "../config/yup";

import * as T from "../types/commission-distribution.types";

import { Role } from "@prisma/client";

export default class CommissionDistributionValidator {
    private static objectSchemaToCreateOrUpdate = {
        roleCommissions: yup
            .array(
                yup
                    .object({
                        userRoleId: yup.string().required("Deve ser passado um roleId."),
                        comissao: yup.number().required("Deve ser passado uma comissao."),
                        acelerator: yup.number().required("Deve ser passado um acelerator."),
                    })
                    .strict()
            )
            .required()
            .min(1),
    };

    public static createMany: yup.ObjectSchema<T.ValidCreateCommissionDistribution> = yup.object({
        body: yupBodySchema({
            data: yupDataArrSchema(this.objectSchemaToCreateOrUpdate),
        }),
    });

    public static findMany: yup.ObjectSchema<T.ValidFindCommissionDistribution> = yup.object({
        query: yupFindQuerySchema(
            { userRoleId: yup.string(), role: yup.mixed<Role>().oneOf(Object.values(Role)) },
            Object.values(T.CommissionDistributionSortBy)
        ),
    });

    public static getOne: yup.ObjectSchema<T.ValidGetCommissionDistribution> = yup.object({
        params: yupParamsSchema({ id: yup.string().required("Deve ser passado um id.") }),
    });

    public static updateOne: yup.ObjectSchema<T.ValidUpdateCommissionDistribution> = yup.object({
        params: yupParamsSchema({ id: yup.string().required("Deve ser passado um id.") }),
        body: yupBodySchema({ data: yupDataSchema(this.objectSchemaToCreateOrUpdate) }),
    });

    public static deleteOne: yup.ObjectSchema<T.ValidDeleteCommissionDistribution> = yup.object({
        params: yupParamsSchema({ id: yup.string().required("Deve ser passado um id.") }),
    });
}
