import { Request, Response, NextFunction } from "express-serve-static-core";
import { RequestHandler } from "express";

export interface CustomParamsDictionary {
    [key: string]: any;
}

const catchAsync =
    (fn: RequestHandler<CustomParamsDictionary, any, any, qs.ParsedQs, Record<string, any>>) =>
    async (
        req: Request<CustomParamsDictionary, any, any, any, Record<string, any>>,
        res: Response<any, Record<string, any>, number>,
        next: NextFunction
    ) => {
        try {
            await fn(req, res, next);
        } catch (err) {
            next(err);
        }
    };

export default catchAsync;
