import { NextFunction, Request, Response } from "express";

import ApiError from "../utils/apiError";

const KNOWN_NUMBER_KEYS = ["limit", "page"];
const KNOWN_DATE_KEYS = ["dataInicio", "dataFim"];

const isKnownNumber = (key: string) => KNOWN_NUMBER_KEYS.includes(key);
const isKnownDate = (key: string) => key.startsWith("gte_") || key.startsWith("lte_") || KNOWN_DATE_KEYS.includes(key);

const dateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/;
function isDate(value: any): boolean {
    return value && typeof value === "string" && dateFormat.test(value);
}

function convertToDateDateFields(dados: any, onlyKnown?: boolean) {
    if (dados === null || dados === undefined || typeof dados !== "object") return dados;

    for (const key of Object.keys(dados)) {
        const valor = dados[key];

        if (isDate(valor) && (onlyKnown ? isKnownDate(key) : true)) dados[key] = new Date(valor);
        else if (typeof valor === "object") convertToDateDateFields(valor);
    }
}

function convertToNumberNumericFields(dados: any) {
    if (dados === null || dados === undefined || typeof dados !== "object") return dados;

    for (const key of Object.keys(dados)) {
        const valor = dados[key];
        const converted = Number(valor);
        if (
            typeof valor === "string" &&
            !isDate(valor) &&
            !isNaN(converted) &&
            isFinite(converted) &&
            isKnownNumber(key)
        )
            dados[key] = converted;
        else if (typeof valor === "object") convertToNumberNumericFields(valor);
    }
}

export const reqInterceptor = (req: Request, _: Response, next: NextFunction) => {
    try {
        Object.defineProperty(req, "query", {
            //TODO: Isto está sendo necessário para voltar a fazer a query mutável. Tentar encontrar um método melhor.
            ...Object.getOwnPropertyDescriptor(req, "query"),
            value: req.query,
            writable: true,
        });

        convertToNumberNumericFields(req.query);
        convertToDateDateFields(req.query, true);
        convertToDateDateFields(req.body);

        //TODO: Após a atualização para o express 5 o body não está sendo inserido na requisição caso o cliente não envie.
        // No entanto nos validations está sendo requerido sempre. Deve-se remover o required do validation?
        if (!req.body) req.body = {};
        if (!req.params) req.params = {};
        if (!req.query) req.query = {};

        return next();
    } catch (err: any) {
        console.error("Req Interceptor", err);
        return next(new ApiError(500, err?.message ?? "Houve um erro desconhecido ao tratar a query."));
    }
};
