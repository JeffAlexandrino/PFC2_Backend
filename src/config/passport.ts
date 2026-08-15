import { Strategy as JwtStrategy, ExtractJwt, VerifyCallback } from "passport-jwt";
import { TokenWithCurrentUserRole } from "../types/token.types";
import { TokenType, User } from "@prisma/client";

import prisma from "../prisma/prisma";
import config from "./config";

export type DoneData = { user: User; token: TokenWithCurrentUserRole } | false;
export type DonePayload = unknown | null;
export type VerifyDoneCallback = (payload: DonePayload, data: DoneData) => void;

const jwtOptions = {
    secretOrKey: config.jwt.secret,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify: VerifyCallback = async (payload, done: VerifyDoneCallback) => {
    try {
        const token = await prisma.token.findUnique({
            where: { id: payload.tokenId },
            include: { currentUserRole: true },
        });

        if (!token) throw new Error("Esta sessão foi encerrada.");
        if (token.type != TokenType.ACCESS) throw new Error("Chave de aceesso incorreta.");

        const user = await prisma.user.findUnique({
            where: {
                id: payload.sub,
                ativo: true,
                bloqueado: false,
                userRoles: {
                    some: {
                        id: token.currentUserRole?.id,
                        empresaId: token.currentUserRole?.empresaId,
                        ativo: true,
                        bloqueado: false,
                    },
                },
            },
        });
        if (!user) return done(null, false);

        done(null, { user, token });
    } catch (error) {
        done(error, false);
    }
};

export const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);
