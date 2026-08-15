import { OrganizationSortBy, ValidFindOrganizations, ValidUpdateOrganization } from "../types/organization.types";

import yupFindQuerySchema from "./schema-base/yup-find-query.schema";
import yupParamsSchema from "./schema-base/yup-params.schema";
import yupBodySchema from "./schema-base/yup-body.schema";
import yupDataSchema from "./schema-base/yup-data.schema";
import yup from "../config/yup";

export default class OrganizationValidator {
    public static findMany: yup.ObjectSchema<ValidFindOrganizations> = yup.object({
        query: yupFindQuerySchema(
            {
                id: yup.string(),
                name: yup.string(),
                cnpj: yup.string(),
                userId: yup.string(),
            },
            Object.values(OrganizationSortBy)
        ),
    });

    public static updateOne: yup.ObjectSchema<ValidUpdateOrganization> = yup.object({
        params: yupParamsSchema({ id: yup.string().required("Deve ser passado um id.") }),
        body: yupBodySchema({
            data: yupDataSchema({
                name: yup.string().required("Deve ser passado um name."),
                cnpj: yup.string().cnpj("Insira um cnpj válido.").required("Deve ser passado um cnpj."),
                logo: yup.mixed<Buffer>().nullable(),
            }),
        }),
    });
}
