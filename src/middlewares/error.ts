import httpStatus from "../utils/httpStatus";
import ApiError from "../utils/apiError";
import config from "../config/config";
import logger from "../config/logger";

import { ForbiddenError } from "@casl/ability";
import { ErrorRequestHandler } from "express";
import { Prisma } from "@prisma/client";

const mapPrismaCodeError: Record<string, string> = {
    P2003: "Isto não é permitido pois existem recursos que dependem destes dados.",
};

export const errorConverter: ErrorRequestHandler = (err, _req, _res, next) => {
    if (config.env !== "test" || err.status === 500 || err.status === 403) console.error("Error Converter: ", err);

    if (!(err instanceof ApiError)) {
        switch (true) {
            case err instanceof ForbiddenError:
                err = new ApiError(httpStatus.FORBIDDEN, "Você não possui permissões para esta requisição.", true);
                break;
            case err instanceof Prisma.PrismaClientKnownRequestError:
                console.error('Prisma known request error:', err.code, err.message);
                err = new ApiError(
                    httpStatus.BAD_REQUEST,
                    mapPrismaCodeError[err.code] ?? "Esta ação não é permitida.",
                    true
                );
                break;
            default:
                err = new ApiError(httpStatus.INTERNAL_SERVER_ERROR, undefined, false);
                break;
        }
    }

    next(err);
};

export const errorHandler: ErrorRequestHandler = (err, _, res, next) => {
    //Evita que o handler padrão do express seja chamado e força este handler a ser chamado
    if (res.headersSent) return next(err);

    let { statusCode, message } = err;

    if (config.env === "production" && !err.isOperational) {
        statusCode = httpStatus.INTERNAL_SERVER_ERROR;
        message = "O servidor encontrou um estado com o qual não sabe lidar.";
    }

    res.locals.errorMessage = err.message;

    const response = {
        code: statusCode,
        message,
        ...(config.env === "development" && { stack: err.stack }),
    };

    if (config.env === "development") {
        logger.error(err);
    }

    res.status(statusCode).send(response);
};
