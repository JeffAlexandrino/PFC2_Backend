import yupFindQuerySchema from "./schema-base/yup-find-query.schema";
import yupDataArrSchema from "./schema-base/yup-data-arr.schema";
import yupParamsSchema from "./schema-base/yup-params.schema";
import yupDataSchema from "./schema-base/yup-data.schema";
import yupBodySchema from "./schema-base/yup-body.schema";
import yup from "../config/yup";

import * as T from "../types/service.types";

import { TipoMoeda } from "@prisma/client";

export default class ServiceValidator {
    private static objectSchemaToCreateOrUpdate = {
        tipoMoeda: yup.mixed<TipoMoeda>().oneOf(Object.values(TipoMoeda)).required("Deve ser passado um tipoMoeda."),
        name: yup.string().required("Deve ser passado um nome.").max(256, "Deve ter no máximo 256 caracteres."),
        tipoProdutoServicoId: yup.string().required("Deve ser passado um tipoProdutoServicoId."),
        valorCustoHora: yup
            .number()
            .min(0.01, "Deve ser no mínimo 0,01.")
            .required("Deve ser passado um valorCustoHora."),
        observacoes: yup
            .string()
            .required("Deve ser passado observacoes.")
            .max(255, "Deve ter no máximo 255 caracteres."),
    };

    public static createServices: yup.ObjectSchema<T.ValidCreateServices> = yup.object({
        body: yupBodySchema({ data: yupDataArrSchema(this.objectSchemaToCreateOrUpdate) }),
    });

    public static findServices: yup.ObjectSchema<T.ValidFindServices> = yup.object({
        query: yupFindQuerySchema(
            {
                name: yup.string(),
                tipoProdutoServicoId: yup.string(),
                gte_updatedAt: yup.date(),
                lte_updatedAt: yup.date(),
                observacoes: yup.string(),
                tipoMoeda: yup.mixed<TipoMoeda>().oneOf(Object.values(TipoMoeda)),
            },
            Object.values(T.ServiceSortBy)
        ),
    });

    public static getService: yup.ObjectSchema<T.ValidGetService> = yup.object({
        params: yupParamsSchema({ id: yup.string().required("Deve ser passado um id.") }),
    });

    public static updateService: yup.ObjectSchema<T.ValidUpdateService> = yup.object({
        params: yupParamsSchema({ id: yup.string().required("Deve ser passado um id.") }),
        body: yupBodySchema({ data: yupDataSchema(this.objectSchemaToCreateOrUpdate) }),
    });

    public static deleteService: yup.ObjectSchema<T.ValidDeleteService> = yup.object({
        params: yupParamsSchema({ id: yup.string().required("Deve ser passado um id.") }),
    });
}
