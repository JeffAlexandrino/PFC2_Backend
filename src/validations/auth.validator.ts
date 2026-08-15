import yupQuerySchema from "./schema-base/yup-query.schema";
import yupBodySchema from "./schema-base/yup-body.schema";
import yupDataSchema from "./schema-base/yup-data.schema";
import yup from "../config/yup";

import * as T from "../types/auth.types";

export default class AuthValidator {
    public static login: yup.ObjectSchema<T.ValidLogin> = yup.object({
        body: yupBodySchema({
            email: yup
                .string()
                .trim("E-mail inválido. Remova os espaços em branco.")
                .email("Insira um e-mail válido.")
                .required("Deve ser passado um e-mail."),
            password: yup.string().required("Deve ser passado um password."),
        }),
    });

    public static logout: yup.ObjectSchema<T.ValidLogout> = yup.object({
        body: yupBodySchema({
            accessToken: yup.string().required("Deve ser passado um accessToken"),
            refreshToken: yup.string().required("Deve ser passado um refreshToken"),
        }),
    });

    public static refreshTokens: yup.ObjectSchema<T.ValidRefreshToken> = yup.object({
        body: yupBodySchema({ refreshToken: yup.string().required("Deve ser passado um refreshToken") }),
    });

    public static getResetPassToken: yup.ObjectSchema<T.ValidGetResetPasswordToken> = yup.object({
        body: yupBodySchema({
            email: yup.string().trim().email("Insira um e-mail válido.").required("Deve ser passado um email."),
            redirect: yup.string().required("Deve ser passado um redirect"),
        }),
    });

    public static updatePassword: yup.ObjectSchema<T.ValidResetPassword> = yup.object({
        body: yupBodySchema({ password: yup.string().required("Deve ser passado um password.") }),
        query: yupQuerySchema({ token: yup.string().required("Deve ser passado um token") }),
    });

    public static updateSessionRole: yup.ObjectSchema<T.ValidUpdateSessionRole> = yup.object({
        body: yupBodySchema({
            data: yupDataSchema({ userRoleId: yup.string().required("Deve ser passado um userRoleId.") }),
        }),
    });
}
