import { NextFunction, Request, Response } from "express";

import httpStatus from "../utils/httpStatus";
import ApiError from "../utils/apiError";
import pick from "../utils/pick";

import * as yup from "yup";

export const yupValidate = (schema: yup.AnySchema) => async (req: Request, _: Response, next: NextFunction) => {
    try {
        const object: any = pick(req, ["body", "params", "query"]);
        await schema.validate(object, { abortEarly: false, stripUnknown: true });
        return next();
    } catch (err: any) {
        if (err instanceof yup.ValidationError)
            return next(
                new ApiError(
                    httpStatus.BAD_REQUEST,
                    err.errors[0] ?? "Houve um erro desconhecido ao validar sua requisição."
                )
            );

        console.error("Yup Validate:", err);
        return next(
            new ApiError(
                httpStatus.INTERNAL_SERVER_ERROR,
                err.errors[0] ?? "Houve um erro desconhecido ao validar sua requisição."
            )
        );
    }
};
