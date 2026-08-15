import yupFindQuerySchema from "./schema-base/yup-find-query.schema";
import yupDataArrSchema from "./schema-base/yup-data-arr.schema";
import yupParamsSchema from "./schema-base/yup-params.schema";
import yupDataSchema from "./schema-base/yup-data.schema";
import yupBodySchema from "./schema-base/yup-body.schema";
import yup from "../config/yup";

import * as T from "../types/segment.types";

export default class SegmentValidator {
    private static objectSchemaToCreateOrUpdate = {
        name: yup.string().required("Deve ser passado um nome.").max(256, "Deve ter no máximo 256 caracteres."),
    };

    public static createSegments: yup.ObjectSchema<T.ValidCreateSegments> = yup.object({
        body: yupBodySchema({ data: yupDataArrSchema(this.objectSchemaToCreateOrUpdate) }),
    });

    public static findSegments: yup.ObjectSchema<T.ValidFindSegments> = yup.object({
        query: yupFindQuerySchema({ name: yup.string() }, Object.values(T.SegmentSortBy)),
    });

    public static getSegment: yup.ObjectSchema<T.ValidGetSegment> = yup.object({
        params: yupParamsSchema({ id: yup.string().required("Deve ser passado um id.") }),
    });

    public static updateSegment: yup.ObjectSchema<T.ValidUpdateSegment> = yup.object({
        params: yupParamsSchema({ id: yup.string().required("Deve ser passado um id.") }),
        body: yupBodySchema({ data: yupDataSchema(this.objectSchemaToCreateOrUpdate) }),
    });

    public static deleteSegment: yup.ObjectSchema<T.ValidDeleteSegment> = yup.object({
        params: yupParamsSchema({ id: yup.string().required("Deve ser passado um id.") }),
    });
}
