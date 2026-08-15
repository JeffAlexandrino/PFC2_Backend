import yupFindQuerySchema from "./schema-base/yup-find-query.schema";
import yupDataArrSchema from "./schema-base/yup-data-arr.schema";
import yupParamsSchema from "./schema-base/yup-params.schema";
import yupDataSchema from "./schema-base/yup-data.schema";
import yupBodySchema from "./schema-base/yup-body.schema";
import yup from "../config/yup";

import * as T from "../types/supplier.types";

export default class SupplierValidator {
    private static objectSchemaToCreateOrUpdate = {
        email: yup
            .string()
            .trim("E-mail inválido. Remova os espaços em branco.")
            .email("Insira um e-mail válido.")
            .required("Deve ser passado um e-mail."),
        name: yup.string().required("Deve ser passado um nome.").max(256, "Deve ter no máximo 256 caracteres."),
        cnpj: yup.string().cnpj("O cnpj é inválido.").required("Deve ser passado um cnpj."),
    };

    public static createSuppliers: yup.ObjectSchema<T.ValidCreateSuppliers> = yup.object({
        body: yupBodySchema({ data: yupDataArrSchema(this.objectSchemaToCreateOrUpdate) }),
    });

    public static findSuppliers: yup.ObjectSchema<T.ValidFindSuppliers> = yup.object({
        query: yupFindQuerySchema(
            {
                name: yup.string(),
                email: yup.string(),
                cnpj: yup.string(),
                gte_updatedAt: yup.date(),
                lte_updatedAt: yup.date(),
            },
            Object.values(T.SupplierSortBy)
        ),
    });

    public static getSupplier: yup.ObjectSchema<T.ValidGetSupplier> = yup.object({
        params: yupParamsSchema({ id: yup.string().required("Deve ser passado um id.") }),
    });

    public static updateSupplier: yup.ObjectSchema<T.ValidUpdateSupplier> = yup.object({
        params: yupParamsSchema({ id: yup.string().required("Deve ser passado um id.") }),
        body: yupBodySchema({ data: yupDataSchema(this.objectSchemaToCreateOrUpdate) }),
    });

    public static deleteSupplier: yup.ObjectSchema<T.ValidDeleteSupplier> = yup.object({
        params: yupParamsSchema({ id: yup.string().required("Deve ser passado um id.") }),
    });
}
