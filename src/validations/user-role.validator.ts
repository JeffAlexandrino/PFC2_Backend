import yupFindQuerySchema from "./schema-base/yup-find-query.schema";
import yupParamsSchema from "./schema-base/yup-params.schema";
import yup from "../config/yup";

import * as T from "../types/user-role.types";

import { Role } from "@prisma/client";

export default class UserRoleValidator {
    public static findUserRoles: yup.ObjectSchema<T.ValidFindUserRoles> = yup.object({
        query: yupFindQuerySchema(
            {
                role: yup.mixed<Role>().oneOf(Object.values(Role)),
                gte_updatedAt: yup.date(),
                lte_updatedAt: yup.date(),
                bloqueado: yup.string(),
                id: yup.string(),
            },
            Object.values(T.UserRoleSortBy)
        ),
    });

    public static getUserRole: yup.ObjectSchema<T.ValidGetUserRole> = yup.object({
        params: yupParamsSchema({ id: yup.string().required("Deve ser passado um id.") }),
    });
}
