import yupFindQuerySchema from "./schema-base/yup-find-query.schema";
import yupDataArrSchema from "./schema-base/yup-data-arr.schema";
import yupParamsSchema from "./schema-base/yup-params.schema";
import yupBodySchema from "./schema-base/yup-body.schema";
import yupDataSchema from "./schema-base/yup-data.schema";
import yup from "../config/yup";

import * as T from "../types/category.types";

export default class CategoryValidator {
    private static objectSchemaToCreateOrUpdate = {
        name: yup.string().required("Deve ser passado um nome.").max(256, "Deve ter no máximo 256 caracteres."),
    };

    public static createCategories: yup.ObjectSchema<T.ValidCreateCategories> = yup.object({
        body: yupBodySchema({
            data: yupDataArrSchema(this.objectSchemaToCreateOrUpdate),
        }),
    });

    public static findCategories: yup.ObjectSchema<T.ValidFindCategories> = yup.object({
        query: yupFindQuerySchema({ name: yup.string() }, Object.values(T.CategorySortBy)),
    });

    public static getCategory: yup.ObjectSchema<T.ValidGetCategory> = yup.object({
        params: yupParamsSchema({ id: yup.string().required("Deve ser passado um id.") }),
    });

    public static updateCategory: yup.ObjectSchema<T.ValidUpdateCategory> = yup.object({
        params: yupParamsSchema({ id: yup.string().required("Deve ser passado um id.") }),
        body: yupBodySchema({
            data: yupDataSchema(this.objectSchemaToCreateOrUpdate),
        }),
    });

    public static deleteCategory: yup.ObjectSchema<T.ValidDeleteCategory> = yup.object({
        params: yupParamsSchema({ id: yup.string().required("Deve ser passado um id.") }),
    });
}
