import yupFindQuerySchema from "./schema-base/yup-find-query.schema";
import yupDataArrSchema from "./schema-base/yup-data-arr.schema";
import yupParamsSchema from "./schema-base/yup-params.schema";
import yupDataSchema from "./schema-base/yup-data.schema";
import yupBodySchema from "./schema-base/yup-body.schema";
import yup from "../config/yup";

import * as T from "../types/manufacturer.types";

export default class ManufacturerValidator {
    private static objectSchemaToCreateOrUpdate = {
        name: yup.string().required("Deve ser passado um nome.").max(256, "Deve ter no máximo 256 caracteres."),
    };

    public static createManufacterers: yup.ObjectSchema<T.ValidCreateManufacturers> = yup.object({
        body: yupBodySchema({ data: yupDataArrSchema(this.objectSchemaToCreateOrUpdate) }),
    });

    public static findManufacterer: yup.ObjectSchema<T.ValidFindManufacturers> = yup.object({
        query: yupFindQuerySchema({ name: yup.string() }, Object.values(T.ManufacturerSortBy)),
    });

    public static getManufacterer: yup.ObjectSchema<T.ValidGetManufacturer> = yup.object({
        params: yupParamsSchema({ id: yup.string().required("Deve ser passado um id.") }),
    });

    public static updateManufacterer: yup.ObjectSchema<T.ValidUpdateManufacturer> = yup.object({
        params: yupParamsSchema({ id: yup.string().required("Deve ser passado um id.") }),
        body: yupBodySchema({ data: yupDataSchema(this.objectSchemaToCreateOrUpdate) }),
    });

    public static deleteManufacterer: yup.ObjectSchema<T.ValidDeleteManufacturer> = yup.object({
        params: yupParamsSchema({ id: yup.string().required("Deve ser passado um id.") }),
    });
}
