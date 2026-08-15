import { HIGH_ACCESS_ROLES, HighAccessRoles } from "../types/user-role.types";
import { Prisma, TipoMeta } from "@prisma/client";

import yupFindQuerySchema from "./schema-base/yup-find-query.schema";
import yupDataArrSchema from "./schema-base/yup-data-arr.schema";
import yupParamsSchema from "./schema-base/yup-params.schema";
import yupQuerySchema from "./schema-base/yup-query.schema";
import yupBodySchema from "./schema-base/yup-body.schema";
import yupDataSchema from "./schema-base/yup-data.schema";
import yup from "../config/yup";

export default class OrganizationTargetValidator {
    private static objectSchemaToCreate = {
        dataInicioMeta: yup.date().required("Deve ser passada uma dataInicioMeta."),
        dataFimMeta: yup.date().required("Deve ser passada uma dataFimMeta."),
        tiposMeta: yup
            .array(
                yup.object({
                    tipoMeta: yup
                        .mixed<TipoMeta>()
                        .oneOf(Object.values(TipoMeta))
                        .required("Deve ser passado um tipoMeta."),
                    valorMeta: yup.number().required("Deve ser passado um valor."),
                })
            )
            .required("Deve ser passado um tiposMeta.")
            .min(1, "Deve ser passado pelo menos um tipoMeta."),
    };

    private static objectSchemaToUpdate = {
        dataInicioMeta: yup.date().required("Deve ser passada uma dataInicioMeta."),
        dataFimMeta: yup.date().required("Deve ser passada uma dataFimMeta."),
        tiposMeta: yup
            .array(
                yup.object({
                    tipoMeta: yup
                        .mixed<TipoMeta>()
                        .oneOf(Object.values(TipoMeta))
                        .required("Deve ser passado um tipoMeta."),
                    valorMeta: yup.number().required("Deve ser passado um valor."),
                })
            )
            .required("Deve ser passado um tiposMeta.")
            .min(1, "Deve ser passado pelo menos um tipoMeta."),
    };

    private static optionalUserRole = { userRole: yup.mixed<HighAccessRoles>().oneOf(HIGH_ACCESS_ROLES) };

    public static createOrganizationTarget = yup.object({
        body: yupBodySchema({ data: yupDataArrSchema(this.objectSchemaToCreate) }),
        query: yupQuerySchema(this.optionalUserRole),
    });

    public static findOrganizationTargets = yup.object({
        query: yupFindQuerySchema(
            {
                ...this.optionalUserRole,
                dataInicioMeta: yup.date(),
                dataFimMeta: yup.date(),
                tipoMeta: yup.mixed<TipoMeta>().oneOf(Object.values(TipoMeta)),
            },
            Object.values(Prisma.MetaEmpresaScalarFieldEnum)
        ),
    });

    public static getOrganizationTargets = yup.object({
        params: yupParamsSchema({ id: yup.string().required("Deve ser passado um id.") }),
        query: yupQuerySchema(this.optionalUserRole),
    });

    public static updateOrganizationTarget = yup.object({
        params: yupParamsSchema({ id: yup.string().required("Deve ser passado um id.") }),
        body: yupBodySchema({ data: yupDataSchema(this.objectSchemaToUpdate) }),
        query: yupQuerySchema(this.optionalUserRole),
    });

    public static deleteOrganizationTarget = yup.object({
        query: yupQuerySchema(this.optionalUserRole),
        params: yup
            .object({ id: yup.string().required("Deve ser passado um id.") })
            .required("Deve ser passado um params.")
            .noUnknown(true)
            .strict(),
    });
}

export type ValidCreateOrganizationTargets = yup.InferType<typeof OrganizationTargetValidator.createOrganizationTarget>;
export type DataCreateOrganizationTarget = ValidCreateOrganizationTargets["body"]["data"][number];
export type QueryCreateOrganizationTarget = ValidCreateOrganizationTargets["query"];

export type ValidFindOrganizationTargets = yup.InferType<typeof OrganizationTargetValidator.findOrganizationTargets>;
export type QueryFindOrganizationTargets = ValidFindOrganizationTargets["query"];

export type ValidGetOrganizationTarget = yup.InferType<typeof OrganizationTargetValidator.getOrganizationTargets>;
export type ParamsGetOrganizationTarget = ValidGetOrganizationTarget["params"];
export type QueryGetOrganizationTarget = ValidGetOrganizationTarget["query"];

export type ValidUpdateOrganizationTarget = yup.InferType<typeof OrganizationTargetValidator.updateOrganizationTarget>;
export type DataUpdateOrganizationTarget = ValidUpdateOrganizationTarget["body"]["data"];
export type QueryUpdateOrganizationTarget = ValidUpdateOrganizationTarget["query"];

export type ValidDeleteOrganizationTarget = yup.InferType<typeof OrganizationTargetValidator.deleteOrganizationTarget>;
export type ParamsDeleteOrganizationTarget = ValidDeleteOrganizationTarget["params"];
export type QueryDeleteOrganizationTarget = ValidDeleteOrganizationTarget["query"];
