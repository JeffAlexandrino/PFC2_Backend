import { AppAbility, defineAbilitiesFor } from "../config/abilities";
import { NextFunction, Request, Response } from "express";
import { Token, User, UserRole } from "@prisma/client";
import { DoneData } from "../config/passport";

import httpStatus from "../utils/httpStatus";
import ApiError from "../utils/apiError";
import passport from "passport";

export type RequestContext = { user: User; userAbilities: AppAbility; currentUserRole: UserRole; tokenInfo: Token };
export type ResolveVerifyCallback = (value?: unknown) => void;
export type RejectVerifyCallback = (reason?: unknown) => void;

declare module "express-serve-static-core" {
    interface Request {
        context: RequestContext;
    }
}

function verifyCallBack(req: Request, resolve: ResolveVerifyCallback, reject: RejectVerifyCallback) {
    return async (err: unknown, data: DoneData, info: unknown) => {
        if (err || info || !data || data.user.bloqueado || !data.user.ativo)
            return reject(new ApiError(httpStatus.UNAUTHORIZED, "Você deve realizar o login!"));

        resolve();

        const currentUserRole = data.token.currentUserRole as UserRole;
        const userAbilities = defineAbilitiesFor({ userId: data.user.id, currentUserRole });

        req.context = { user: data.user, userAbilities, currentUserRole, tokenInfo: data.token };
    };
}

function auth() {
    return async (req: Request, res: Response, next: NextFunction) => {
        return new Promise((resolve, reject) => {
            passport.authenticate("jwt", { session: false }, verifyCallBack(req, resolve, reject))(req, res, next);
        })
            .then(() => next())
            .catch((err) => next(err));
    };
}

export default auth;
