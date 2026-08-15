import yupFindQuerySchema from "./schema-base/yup-find-query.schema";
import yupDataArrSchema from "./schema-base/yup-data-arr.schema";
import yupParamsSchema from "./schema-base/yup-params.schema";
import yupBodySchema from "./schema-base/yup-body.schema";
import yupDataSchema from "./schema-base/yup-data.schema";
import yup from "../config/yup";

import * as T from "../types/product.types";

import { TipoMoeda } from "@prisma/client";

export default class ProductValidator {
    private static objectSchemaToCreateOrUpdate = {
        name: yup.string().required("Deve ser passado um nome.").max(256, "Deve ter no máximo 256 caracteres."),
        tipoProdutoServicoId: yup.string().required("Deve ser passado um tipoProdutoServicoId."),
        fabricanteId: yup.string().required("Deve ser passado um fabricanteId."),
        categoriaId: yup.string().required("Deve ser passado um categoryId."),
        custoUnit: yup.number().min(0.01, "Deve ser no mínimo 0,01.").required("Deve ser passado um custoUnit."),
        partNumber: yup
            .string()
            .required("Deve ser passado um partNumber.")
            .max(256, "Deve ter no máximo 256 caracteres."),
        tipoMoeda: yup.mixed<TipoMoeda>().oneOf(Object.values(TipoMoeda)).default(TipoMoeda.BRL), //TODO: Depois de adicionar os valores no banco, remover nullable
    };

    public static createProducts: yup.ObjectSchema<T.ValidCreateProducts> = yup.object({
        body: yupBodySchema({ data: yupDataArrSchema(this.objectSchemaToCreateOrUpdate) }),
    });

    public static findProducts: yup.ObjectSchema<T.ValidFindProducts> = yup.object({
        query: yupFindQuerySchema(
            {
                tipoProdutoServicoId: yup.string(),
                fabricanteId: yup.string(),
                categoriaId: yup.string(),
                partNumber: yup.string(),
                name: yup.string(),
                custoUnit: yup.number(),
                gte_updatedAt: yup.date(),
                lte_updatedAt: yup.date(),
                tipoMoeda: yup.mixed<TipoMoeda>().oneOf(Object.values(TipoMoeda)),
            },
            Object.values(T.ProductSortBy)
        ),
    });

    public static getProduct: yup.ObjectSchema<T.ValidGetProduct> = yup.object({
        params: yupParamsSchema({ id: yup.string().required("Deve ser passado um id.") }),
    });

    public static updateProduct: yup.ObjectSchema<T.ValidUpdateProduct> = yup.object({
        params: yupParamsSchema({ id: yup.string().required("Deve ser passado um id.") }),
        body: yupBodySchema({ data: yupDataSchema(this.objectSchemaToCreateOrUpdate) }),
    });

    public static deleteProduct: yup.ObjectSchema<T.ValidDeleteProduct> = yup.object({
        params: yupParamsSchema({ id: yup.string().required("Deve ser passado um id.") }),
    });
}
