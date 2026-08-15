import yupFindQuerySchema from "./schema-base/yup-find-query.schema";
import yupDataArrSchema from "./schema-base/yup-data-arr.schema";
import yupParamsSchema from "./schema-base/yup-params.schema";
import yupBodySchema from "./schema-base/yup-body.schema";
import yupDataSchema from "./schema-base/yup-data.schema";
import yup from "../config/yup";

import * as T from "../types/payment-method.types";

export default class PaymentMethodValidator {
    private static objectSchemaToCreateOrUpdate = {
        name: yup.string().required("Deve ser passado um nome.").max(256, "Deve ter no máximo 256 caracteres."),
    };

    public static createPaymentMethods: yup.ObjectSchema<T.ValidCreatePaymentMethods> = yup.object({
        body: yupBodySchema({ data: yupDataArrSchema(this.objectSchemaToCreateOrUpdate) }),
    });

    public static findPaymentMethods: yup.ObjectSchema<T.ValidFindPaymentMethods> = yup.object({
        query: yupFindQuerySchema({ name: yup.string() }, Object.values(T.PaymentMethodSortBy)),
    });

    public static getPaymentMethod: yup.ObjectSchema<T.ValidGetPaymentMethod> = yup.object({
        params: yupParamsSchema({ id: yup.string().required("Deve ser passado um id.") }),
    });

    public static updatePaymentMethod: yup.ObjectSchema<T.ValidUpdatePaymentMethod> = yup.object({
        params: yupParamsSchema({ id: yup.string().required("Deve ser passado um id.") }),
        body: yupBodySchema({ data: yupDataSchema(this.objectSchemaToCreateOrUpdate) }),
    });

    public static deletePaymentMethod: yup.ObjectSchema<T.ValidDeletePaymentMethod> = yup.object({
        params: yupParamsSchema({
            id: yup.string().required("Deve ser passado um id."),
        }),
    });
}
