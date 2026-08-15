import { GenerateAuthTokenProps, GenerateTokenProps, TokenPayload } from "../types/token.types";
import { AuthTokensResponse } from "../types/response";
import { Token, TokenType } from "@prisma/client";
import { randomUUID } from "crypto";

import httpStatus from "../utils/httpStatus";
import ApiError from "../utils/apiError";
import userService from "./user.service";
import config from "../config/config";
import prisma from "../prisma/prisma";
import jwt from "jsonwebtoken";
import moment from "moment";

const saveToken = async (props: {
    tokenProps: GenerateTokenProps;
    token: string;
    tokenType: TokenType;
    currentRoleId?: string;
    blacklisted: boolean;
}): Promise<Token> => {
    const createdToken = await prisma.token.create({
        data: {
            id: props.tokenProps.tokenId,
            token: props.token,
            userId: props.tokenProps.userId,
            expires: props.tokenProps.expires.toDate(),
            type: props.tokenType,
            blacklisted: props.blacklisted,
            currentUserRoleId: props.currentRoleId,
        },
    });
    return createdToken;
};

const verifyToken = async (token: string, type: TokenType): Promise<Token> => {
    try {
        const payload = jwt.verify(token, config.jwt.secret);
        const userId = payload.sub?.toString();
        const tokenData = await prisma.token.findFirst({
            where: {
                token,
                type,
                userId,
                blacklisted: false,
            },
        });
        if (!tokenData) {
            throw new ApiError(httpStatus.NOT_FOUND, "Token não encontrado.");
        }
        return tokenData;
    } catch (error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Erro ao verificar o token.");
    }
};

const generateToken = (props: GenerateTokenProps): string => {
    const payload: TokenPayload = {
        sub: props.userId,
        iat: moment().unix(),
        exp: props.expires.unix(),
        tokenId: props.tokenId,
    };
    return jwt.sign(payload, config.jwt.secret);
};

const generateAuthToken = async (props: GenerateAuthTokenProps): Promise<AuthTokensResponse> => {
    const accessTokenId = randomUUID();
    const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, "minutes");
    const accessTokenProps = { userId: props.userId, tokenId: accessTokenId, expires: accessTokenExpires };
    const accessToken = generateToken(accessTokenProps);

    const refreshTokenId = randomUUID();
    const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, "days");
    const refreshTokenProps = { userId: props.userId, tokenId: refreshTokenId, expires: refreshTokenExpires };
    const refreshToken = generateToken(refreshTokenProps);

    await saveToken({
        tokenProps: accessTokenProps,
        token: accessToken,
        tokenType: TokenType.ACCESS,
        currentRoleId: props.currentRoleId,
        blacklisted: false,
    });
    await saveToken({
        tokenProps: refreshTokenProps,
        token: refreshToken,
        tokenType: TokenType.REFRESH,
        currentRoleId: props.currentRoleId,
        blacklisted: false,
    });

    return {
        access: {
            token: accessToken,
            expires: accessTokenExpires.toDate(),
        },
        refresh: {
            token: refreshToken,
            expires: refreshTokenExpires.toDate(),
        },
    };
};

const generateResetPasswordToken = async (email: string): Promise<string> => {
    const user = await userService.getOneByEmail(email);
    if (!user) throw new ApiError(httpStatus.NOT_FOUND, "Nenhum usuário encontrado com esse email.");
    if (user.bloqueado === true)
        throw new ApiError(httpStatus.FORBIDDEN, "Não é possivel fazer pedido de redefinição de senha");

    const resetPasswordTokenId = randomUUID();
    const resetPasswordTokenExpires = moment().add(config.jwt.resetPasswordExpirationMinutes, "minutes");
    const resetPasswordTokenProps = {
        userId: user.id,
        expires: resetPasswordTokenExpires,
        tokenId: resetPasswordTokenId,
    };
    const resetPasswordToken = generateToken(resetPasswordTokenProps);

    await saveToken({
        tokenProps: resetPasswordTokenProps,
        token: resetPasswordToken,
        tokenType: TokenType.RESET_PASSWORD,
        blacklisted: false,
    });
    return resetPasswordToken;
};

export default {
    generateToken,
    saveToken,
    verifyToken,
    generateAuthToken,
    generateResetPasswordToken,
};
