import { COMERCIAL_ROLES, ComercialRole } from "../types/user-role.types";
import { EstadoVenda, Prisma, TipoMeta } from "@prisma/client";

import yupFindQuerySchema from "./schema-base/yup-find-query.schema";
import yupDataArrSchema from "./schema-base/yup-data-arr.schema";
import yupParamsSchema from "./schema-base/yup-params.schema";
import yupQuerySchema from "./schema-base/yup-query.schema";
import yupBodySchema from "./schema-base/yup-body.schema";
import yupDataSchema from "./schema-base/yup-data.schema";
import yup from "../config/yup";

export default class TargetValidator {
    private static objectSchemaToCreateOrUpdate = {
        dataInicioMeta: yup.date().required("Deve ser passada uma dataInicioMeta."),
        dataFimMeta: yup.date().required("Deve ser passada uma dataFimMeta."),
        userRoleId: yup.string().required("Deve ser passado um userRoleId."),
        tiposMeta: yup
            .array(
                yup.object({
                    tipoMeta: yup
                        .mixed<TipoMeta>()
                        .oneOf(Object.values(TipoMeta))
                        .required("Deve ser passado um tipoMeta."),
                    aceleratorTriggerValue: yup.number().required("Deve ser passado um valor."),
                    commissionTriggerValue: yup.number().required("Deve ser passado um valor."),
                })
            )
            .required("Deve ser passado um tiposMeta.")
            .min(1, "Deve ser passado pelo menos um tipoMeta."),
    };

    private static optionalUserRole = { userRole: yup.mixed<ComercialRole>().oneOf(COMERCIAL_ROLES) };

    public static createTarget = yup.object({
        body: yupBodySchema({ data: yupDataArrSchema(this.objectSchemaToCreateOrUpdate) }),
        query: yupQuerySchema(this.optionalUserRole),
    });

    public static findTargets = yup.object({
        query: yupFindQuerySchema(
            {
                ...this.optionalUserRole,
                userRoleId: yup.string(),
                dataInicioMeta: yup.date(),
                dataFimMeta: yup.date(),
                estadoVenda: yup.mixed<EstadoVenda>().oneOf(Object.values(EstadoVenda)),
                vendaRenovacao: yup.boolean(),
            },
            Object.values(Prisma.MetaScalarFieldEnum)
        ),
    });

    public static getTarget = yup.object({
        params: yupParamsSchema({ id: yup.string().required("Deve ser passado um id.") }),
        query: yupQuerySchema(this.optionalUserRole),
    });

    public static updateTarget = yup.object({
        params: yupParamsSchema({ id: yup.string().required("Deve ser passado um id.") }),
        body: yupBodySchema({ data: yupDataSchema(this.objectSchemaToCreateOrUpdate) }),
        query: yupQuerySchema(this.optionalUserRole),
    });

    public static deleteTarget = yup.object({
        query: yupQuerySchema(this.optionalUserRole),
        params: yup
            .object({ id: yup.string().required("Deve ser passado um id.") })
            .required("Deve ser passado um params.")
            .noUnknown(true)
            .strict(),
    });
}

export type ValidCreateTargets = yup.InferType<typeof TargetValidator.createTarget>;
export type DataCreateTarget = ValidCreateTargets["body"]["data"][number];
export type QueryCreateTarget = ValidCreateTargets["query"];

export type ValidFindTargets = yup.InferType<typeof TargetValidator.findTargets>;
export type QueryFindTargets = ValidFindTargets["query"];

export type ValidGetTarget = yup.InferType<typeof TargetValidator.getTarget>;
export type ParamsGetTarget = ValidGetTarget["params"];
export type QueryGetTarget = ValidGetTarget["query"];

export type ValidUpdateTarget = yup.InferType<typeof TargetValidator.updateTarget>;
export type DataUpdateTarget = ValidUpdateTarget["body"]["data"];
export type QueryUpdateTarget = ValidUpdateTarget["query"];

export type ValidDeleteTarget = yup.InferType<typeof TargetValidator.deleteTarget>;
export type ParamsDeleteTarget = ValidDeleteTarget["params"];
export type QueryDeleteTarget = ValidDeleteTarget["query"];
