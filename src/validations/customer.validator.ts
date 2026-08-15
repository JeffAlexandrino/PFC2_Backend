import yupFindQuerySchema from "./schema-base/yup-find-query.schema";
import yupDataArrSchema from "./schema-base/yup-data-arr.schema";
import yupParamsSchema from "./schema-base/yup-params.schema";
import yupBodySchema from "./schema-base/yup-body.schema";
import yupDataSchema from "./schema-base/yup-data.schema";
import yup from "../config/yup";

import { Origem } from "@prisma/client";

import * as T from "../types/customer.types";

export default class CustomerValidator {
    private static objectSchemaBaseToCreateUpdateOrImport = {
        name: yup.string().required("Deve ser passado um nome.").max(256, "Deve ter no máximo 256 caracteres."),
        cnpj: yup.string().cnpj("Insira um cnpj válido.").required("Deve ser passado um cnpj."),
        email: yup
            .string()
            .trim("E-mail inválido. Remova os espaços em branco.")
            .email("Insira um e-mail válido.")
            .required("Deve ser passado um e-mail."),
        telefone: yup.string().required("Deve ser passado um telefone."),
        origem: yup
            .mixed<Origem>()
            .oneOf(Object.values(Origem) as Origem[], "Origem deve ser um dos valores válidos.")
            .nullable()
            .default(null),
    };
    private static objectSchemaToCreateOrUpdate = {
        ...this.objectSchemaBaseToCreateUpdateOrImport,
        segmentoId: yup.string().required("Deve ser passado um segmentoId."),
    };

    public static createCustomers: yup.ObjectSchema<T.ValidCreateCustomers> = yup.object({
        body: yupBodySchema({ data: yupDataArrSchema(this.objectSchemaToCreateOrUpdate) }),
    });

    public static importCustomers: yup.ObjectSchema<T.ValidImportCustomers> = yup.object({
        body: yupBodySchema({
            data: yupDataArrSchema({
                ...this.objectSchemaBaseToCreateUpdateOrImport,
                segmentoName: yup.string().required("Deve ser passado o nome do segmento."),
            }),
        }),
    });

    public static findCustomers: yup.ObjectSchema<T.ValidFindCustomers> = yup.object({
        query: yupFindQuerySchema(
            {
                gte_updatedAt: yup.date(),
                lte_updatedAt: yup.date(),
                segmentoId: yup.string(),
                origem: yup.mixed<Origem>().oneOf(Object.values(Origem), "Origem deve ser um dos valores válidos."),
                telefone: yup.string(),
                email: yup.string(),
                name: yup.string(),
                cnpj: yup.string(),
                comprou: yup.string().oneOf(["true", "false"]),
            },
            Object.values(T.CustomerSortBy)
        ),
    });

    public static getCustomer: yup.ObjectSchema<T.ValidGetCustomer> = yup.object({
        params: yupParamsSchema({ id: yup.string().required("Deve ser passado um id.") }),
    });

    public static updateCustomer: yup.ObjectSchema<T.ValidUpdateCustomer> = yup.object({
        params: yupParamsSchema({ id: yup.string().required("Deve ser passado um id.") }),
        body: yupBodySchema({ data: yupDataSchema(this.objectSchemaToCreateOrUpdate) }),
        query: yupFindQuerySchema({ currentSalePersonId: yup.string() }, Object.values(T.CustomerSortBy)),
    });

    public static deleteCustomer: yup.ObjectSchema<T.ValidDeleteCustomer> = yup.object({
        params: yupParamsSchema({ id: yup.string().required("Deve ser passado um id.") }),
    });
}

export type ValidUpdateCustomer = yup.InferType<typeof CustomerValidator.updateCustomer>;
export type DataUpdateCustomer = ValidUpdateCustomer["body"]["data"];
export type QueryUpdateCustomer = ValidUpdateCustomer["params"] extends { query: infer Q }
    ? Q
    : Record<string, unknown>;
