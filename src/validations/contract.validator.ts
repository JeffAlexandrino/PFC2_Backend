import yupFindQuerySchema from "./schema-base/yup-find-query.schema";
import yupDataArrSchema from "./schema-base/yup-data-arr.schema";
import yupParamsSchema from "./schema-base/yup-params.schema";
import yupDataSchema from "./schema-base/yup-data.schema";
import yupBodySchema from "./schema-base/yup-body.schema";
import yup from "../config/yup";

import * as T from "../types/contract.type";

export default class ContractValidator {
    private static objectSchemaToCreateOrUpdate = {
        name: yup.string().required("Deve ser passado um nome.").max(256, "Deve ter no máximo 256 caracteres."),
        comissaoPrimeiraParcela: yup.boolean().required("Deve ser passado um comissaoPrimeiraParcela."),
    };

    public static createMany: yup.ObjectSchema<T.ValidCreateContracts> = yup.object({
        body: yupBodySchema({
            data: yupDataArrSchema(this.objectSchemaToCreateOrUpdate),
        }),
    });

    public static findMany: yup.ObjectSchema<T.ValidFindContracts> = yup.object({
        query: yupFindQuerySchema({ name: yup.string() }, Object.values(T.ContractSortBy)),
    });

    public static getOne: yup.ObjectSchema<T.ValidGetContract> = yup.object({
        params: yupParamsSchema({ id: yup.string().required("Deve ser passado um id.") }),
    });

    public static updateOne: yup.ObjectSchema<T.ValidUpdateContract> = yup.object({
        params: yupParamsSchema({ id: yup.string().required("Deve ser passado um id.") }),
        body: yupBodySchema({ data: yupDataSchema(this.objectSchemaToCreateOrUpdate) }),
    });

    public static deleteOne: yup.ObjectSchema<T.ValidDeleteContract> = yup.object({
        params: yupParamsSchema({ id: yup.string().required("Deve ser passado um id.") }),
    });
}
