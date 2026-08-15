import { COMERCIAL_ROLES, ComercialRole } from "../types/user-role.types";
import { EstadoVenda } from "@prisma/client";

import yupQuerySchema from "./schema-base/yup-query.schema";
import yup from "../config/yup";

import * as T from "../types/dashboards.types";

export default class DashboardsValidator {
    private static objectSchemaWithoutMetric = {
        role: yup.mixed<ComercialRole>().oneOf(COMERCIAL_ROLES),
        estadoVenda: yup.mixed<EstadoVenda>().oneOf(Object.values(EstadoVenda)),
        dataInicio: yup.date().required("Deve ser passado uma dataInicio."),
        dataFim: yup.date().required("Deve ser passado uma dataFim."),
        userRoleId: yup.string(),
    };

    private static objectSchemaWithMetric = {
        ...this.objectSchemaWithoutMetric,
        metrica: yup.mixed<T.DashboardMetric>().oneOf(Object.values(T.DashboardMetric)),
    };

    public static getTotalValues: yup.ObjectSchema<T.ValidFindDashboardsWithMetric> = yup.object({
        query: yupQuerySchema(this.objectSchemaWithMetric),
    });

    public static getCustomerRank: yup.ObjectSchema<T.ValidFindDashboardsWithMetric> = yup.object({
        query: yupQuerySchema(this.objectSchemaWithMetric),
    });

    public static getSalePersonRank: yup.ObjectSchema<T.ValidFindDashboardsWithMetric> = yup.object({
        query: yupQuerySchema(this.objectSchemaWithMetric),
    });

    public static getCategoryRank: yup.ObjectSchema<T.ValidFindDashboardsWithMetric> = yup.object({
        query: yupQuerySchema(this.objectSchemaWithMetric),
    });

    public static getEvolution: yup.ObjectSchema<T.ValidFindDashboardsWithMetric> = yup.object({
        query: yupQuerySchema(this.objectSchemaWithMetric),
    });

    public static getProductServiceTypesValues: yup.ObjectSchema<T.ValidFindDashboardsWithMetric> = yup.object({
        query: yupQuerySchema(this.objectSchemaWithMetric),
    });

    public static getAchievedTarget: yup.ObjectSchema<T.ValidFindDashboardsWithMetric> = yup.object({
        query: yupQuerySchema(this.objectSchemaWithMetric),
    });

    public static getContributionMargin: yup.ObjectSchema<T.ValidFindDashboardsWithoutMetric> = yup.object({
        query: yupQuerySchema(this.objectSchemaWithoutMetric),
    });
}
