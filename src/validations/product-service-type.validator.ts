import yupFindQuerySchema from "./schema-base/yup-find-query.schema";
import yupDataArrSchema from "./schema-base/yup-data-arr.schema";
import yupParamsSchema from "./schema-base/yup-params.schema";
import yupBodySchema from "./schema-base/yup-body.schema";
import yupDataSchema from "./schema-base/yup-data.schema";
import yup from "../config/yup";

import * as T from "../types/product-service-type.types";

export default class ProductServiceTypeValidator {
    private static objectSchemaToCreateOrUpdate = {
        name: yup.string().required("Deve ser passado um nome.").max(256, "Deve ter no máximo 256 caracteres."),
    };

    public static createMany: yup.ObjectSchema<T.ValidCreateProductServiceTypes> = yup.object({
        body: yupBodySchema({ data: yupDataArrSchema(this.objectSchemaToCreateOrUpdate) }),
    });

    public static findMany: yup.ObjectSchema<T.ValidFindProductserviceTypes> = yup.object({
        query: yupFindQuerySchema({ name: yup.string() }, Object.values(T.ProductServiceTypeSortBy)),
    });

    public static getOne: yup.ObjectSchema<T.ValidGetProductServiceType> = yup.object({
        params: yupParamsSchema({ id: yup.string().required("Deve ser passado um id.") }),
    });

    public static updateOne: yup.ObjectSchema<T.ValidUpdateProductServiceType> = yup.object({
        params: yupParamsSchema({ id: yup.string().required("Deve ser passado um id.") }),
        body: yupBodySchema({ data: yupDataSchema(this.objectSchemaToCreateOrUpdate) }),
    });

    public static deleteOne: yup.ObjectSchema<T.ValidDeleteProductServiceType> = yup.object({
        params: yupParamsSchema({ id: yup.string().required("Deve ser passado um id.") }),
    });
}
