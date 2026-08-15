import yupFindQuerySchema from "./schema-base/yup-find-query.schema";
import yupDataArrSchema from "./schema-base/yup-data-arr.schema";
import yupParamsSchema from "./schema-base/yup-params.schema";
import yupQuerySchema from "./schema-base/yup-query.schema";
import yupBodySchema from "./schema-base/yup-body.schema";
import yupDataSchema from "./schema-base/yup-data.schema";
import yup from "../config/yup";

import { Prisma, Role } from "@prisma/client";

export default class UserValidator {
    private static objectSchemaToUpdateInfo = {
        //This data structure needs to have the datas of the type on front in user.util.tsx to update on db
        name: yup.string().required("Deve ser passado um nome.").max(256, "Deve ter no máximo 256 caracteres."),
        email: yup.string().email("Insira um e-mail válido.").required("Deve ser passado um e-mail."),
        bloqueado: yup.boolean(),
    };

    private static objectSchemaToCreate = {
        ...this.objectSchemaToUpdateInfo,
        role: yup.mixed<Role>().oneOf(Object.values(Role)).required("Deve ser passado um role."),
    };

    private static optionalOnlyComercialNotManagerRoles = {
        onlyComercialNotManagerRoles: yup.string().oneOf(["true", "false"]),
    };

    public static createUsers = yup.object({
        body: yupBodySchema({ data: yupDataArrSchema(this.objectSchemaToCreate) }),
    });

    public static findUsers = yup.object({
        query: yupFindQuerySchema(
            {
                ...this.optionalOnlyComercialNotManagerRoles,
                id: yup.string(),
                role: yup.mixed<Role>().oneOf(Object.values(Role)),
                gte_updatedAt: yup.date(),
                lte_updatedAt: yup.date(),
                email: yup.string(),
                name: yup.string(),
                bloqueado: yup.string().oneOf(["true", "false"]),
            },
            Object.values(Prisma.UserScalarFieldEnum)
        ),
    });

    public static getOneUser = yup.object({
        params: yupParamsSchema({ id: yup.string().required("Deve ser passado um id.") }),
        query: yupQuerySchema(this.optionalOnlyComercialNotManagerRoles),
    });

    public static updateUserRoles = yup.object({
        params: yupParamsSchema({ id: yup.string().required("Deve ser passado um id.") }),
        body: yupBodySchema({
            data: yupDataSchema({
                userRoles: yup
                    .array()
                    .of(
                        yup.object({
                            role: yup.mixed<Role>().oneOf(Object.values(Role)).required(),
                            fixedCommission: yup.boolean().default(false),
                        })
                    )
                    .required("Deve ser passado um userRole."),
            }),
        }),
        query: yupQuerySchema(this.optionalOnlyComercialNotManagerRoles),
    });

    public static updateUserInfo = yup.object({
        //when the back gets the info from the front, it separetes here to check the types of data to be used
        params: yupParamsSchema({ id: yup.string().required("Deve ser passado um id.") }),
        body: yupBodySchema({
            data: yupDataSchema(this.objectSchemaToUpdateInfo),
        }),
        query: yupQuerySchema(this.optionalOnlyComercialNotManagerRoles),
    });

    public static deleteUser = yup.object({
        params: yupParamsSchema({ id: yup.string().required("Deve ser passado um id.") }),
        query: yupQuerySchema(this.optionalOnlyComercialNotManagerRoles),
    });
}

export type ValidUpdateUserRoles = yup.InferType<typeof UserValidator.updateUserRoles>;
export type DataUpdateUserRoles = ValidUpdateUserRoles["body"]["data"];
export type ParamsUpdateUserRoles = ValidUpdateUserRoles["params"];
export type QueryUpdateUserRoles = ValidUpdateUserRoles["query"];

export type ValidCreateUsers = yup.InferType<typeof UserValidator.createUsers>;
export type DataCreateUser = ValidCreateUsers["body"]["data"][number];

export type ValidGetOneUser = yup.InferType<typeof UserValidator.getOneUser>;
export type ParamsGetOneUser = ValidGetOneUser["params"];
export type QueryGetOneUser = ValidGetOneUser["query"];

export type ValidUpdateUserInfo = yup.InferType<typeof UserValidator.updateUserInfo>;
export type DataUpdateUserInfo = ValidUpdateUserInfo["body"]["data"];
export type ParamsUpdateUserInfo = ValidUpdateUserInfo["params"];
export type QueryUpdateUserInfo = ValidUpdateUserInfo["query"];

export type ValidDeleteUser = yup.InferType<typeof UserValidator.deleteUser>;
export type ParamsDeleteUser = ValidDeleteUser["params"];
export type QueryDeleteUser = ValidDeleteUser["query"];

export type ValidFindUsers = yup.InferType<typeof UserValidator.findUsers>;
export type QueryFindUsers = ValidFindUsers["query"];
